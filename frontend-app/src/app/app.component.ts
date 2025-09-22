import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { GoogleMapsComponent } from './components/google-maps/google-maps.component';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { RouteResultsComponent } from './components/route-results/route-results.component';

import { RouteOptimizationService } from './services/route-optimization.service';
import { 
  Location, 
  Product, 
  Delivery, 
  RouteOptimizationRequest, 
  RouteOptimizationResponse 
} from './models';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    CommonModule, 
    HttpClientModule, 
    ReactiveFormsModule,
    GoogleMapsComponent,
    ProductFormComponent,
    RouteResultsComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Sistema de Otimização de Rotas Agropecuárias';
  
  // Estados da aplicação
  currentStep = 1;
  maxSteps = 4;
  
  // Dados do formulário
  configForm: FormGroup;
  startLocation: Location | null = null;
  deliveries: Delivery[] = [];
  
  // Estados de seleção
  isSelectingStartLocation = false;
  isSelectingDeliveryLocation = false;
  currentDeliveryIndex = -1;
  
  // Resultados
  optimizationResults: RouteOptimizationResponse | null = null;
  isOptimizing = false;
  optimizationError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private routeService: RouteOptimizationService
  ) {
    this.configForm = this.fb.group({
      vehicleSpeedKmH: [60, [Validators.required, Validators.min(10), Validators.max(150)]],
      loadingTimeMinutes: [15, [Validators.required, Validators.min(5), Validators.max(120)]],
      useGoogleMaps: [true]
    });
  }

  ngOnInit() {
    // Inicialização se necessário
  }

  // Métodos de navegação entre etapas
  goToStep(step: number) {
    if (step >= 1 && step <= this.maxSteps) {
      this.currentStep = step;
    }
  }

  nextStep() {
    if (this.currentStep < this.maxSteps) {
      this.currentStep++;
      
      // Se chegando na etapa 3, garantir que todas as entregas têm dados básicos
      if (this.currentStep === 3) {
        this.deliveries.forEach((delivery, index) => {
          if (!delivery.customerName) delivery.customerName = '';
          if (!delivery.customerPhone) delivery.customerPhone = '';
          if (!delivery.priority) delivery.priority = 1;
          if (!delivery.products) delivery.products = [];
        });
        console.log('Entregas preparadas para etapa 3:', this.deliveries);
      }
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // Métodos para o mapa
  startSelectingStartLocation() {
    this.isSelectingStartLocation = true;
    this.isSelectingDeliveryLocation = false;
  }

  startSelectingDeliveryLocation() {
    this.isSelectingStartLocation = false;
    this.isSelectingDeliveryLocation = true;
    
    // Adicionar nova entrega
    const newDelivery: Delivery = {
      location: {} as Location,
      products: [],
      customerName: '',
      customerPhone: '',
      priority: 1
    };
    this.deliveries.push(newDelivery);
    this.currentDeliveryIndex = this.deliveries.length - 1;
  }

  onStartLocationSelected(location: Location) {
    this.startLocation = location;
    this.isSelectingStartLocation = false;
  }

  onDeliveryLocationSelected(location: Location) {
    console.log('onDeliveryLocationSelected called', { location, currentDeliveryIndex: this.currentDeliveryIndex });
    
    if (this.currentDeliveryIndex >= 0 && this.currentDeliveryIndex < this.deliveries.length) {
      this.deliveries[this.currentDeliveryIndex].location = location;
      console.log('Location updated for delivery', this.currentDeliveryIndex, this.deliveries[this.currentDeliveryIndex]);
    } else {
      // Fallback: adicionar nova entrega se o índice não estiver correto
      const newDelivery: Delivery = {
        location: location,
        products: [],
        customerName: '',
        customerPhone: '',
        priority: 1
      };
      this.deliveries.push(newDelivery);
      console.log('Created new delivery with location', newDelivery);
    }
    
    this.isSelectingDeliveryLocation = false;
  }

  // Métodos para produtos
  onProductsChanged(products: Product[], deliveryIndex: number) {
    if (deliveryIndex >= 0 && deliveryIndex < this.deliveries.length) {
      this.deliveries[deliveryIndex].products = products;
    }
  }

  onCustomerInfoChanged(info: {name: string, phone: string, priority: number}, deliveryIndex: number) {
    if (deliveryIndex >= 0 && deliveryIndex < this.deliveries.length) {
      this.deliveries[deliveryIndex].customerName = info.name;
      this.deliveries[deliveryIndex].customerPhone = info.phone;
      this.deliveries[deliveryIndex].priority = info.priority;
    }
  }

  removeDelivery(index: number) {
    this.deliveries.splice(index, 1);
    if (this.currentDeliveryIndex >= this.deliveries.length) {
      this.currentDeliveryIndex = this.deliveries.length - 1;
    }
  }

  // Método principal de otimização
  optimizeRoute() {
    if (!this.canOptimize()) {
      return;
    }

    const request: RouteOptimizationRequest = {
      startLocation: this.startLocation!,
      deliveries: this.deliveries,
      vehicleSpeedKmH: this.configForm.value.vehicleSpeedKmH,
      loadingTimeMinutes: this.configForm.value.loadingTimeMinutes,
      useGoogleMaps: this.configForm.value.useGoogleMaps
    };

    this.isOptimizing = true;
    this.optimizationError = null;
    this.optimizationResults = null;

    this.routeService.optimizeRoute(request).subscribe({
      next: (response) => {
        this.optimizationResults = response;
        this.isOptimizing = false;
        this.goToStep(4); // Ir para a etapa de resultados
      },
      error: (error) => {
        this.optimizationError = error.error?.message || 'Erro desconhecido na otimização';
        this.isOptimizing = false;
      }
    });
  }

  // Validações
  canOptimize(): boolean {
    console.log('=== Debug canOptimize ===');
    console.log('startLocation:', this.startLocation);
    console.log('deliveries.length:', this.deliveries.length);
    console.log('deliveries:', this.deliveries);
    console.log('configForm.valid:', this.configForm.valid);
    console.log('configForm.value:', this.configForm.value);
    
    const hasStartLocation = !!this.startLocation;
    const hasDeliveries = this.deliveries.length > 0;
    
    const deliveriesValid = this.deliveries.every(d => {
      const hasCoordinates = d.location.latitude && d.location.longitude;
      const hasProducts = d.products.length > 0;
      const hasCustomerInfo = d.customerName && d.customerPhone;
      
      console.log(`Delivery validation:`, {
        location: d.location,
        hasCoordinates,
        hasProducts,
        hasCustomerInfo,
        productsCount: d.products.length,
        customerName: d.customerName,
        customerPhone: d.customerPhone
      });
      
      return hasCoordinates && hasProducts && hasCustomerInfo;
    });
    
    const isFormValid = this.configForm.valid;
    
    const canOptimize = hasStartLocation && hasDeliveries && deliveriesValid && isFormValid;
    
    console.log('Final validation result:', {
      hasStartLocation,
      hasDeliveries,
      deliveriesValid,
      isFormValid,
      canOptimize
    });
    
    return canOptimize;
  }

  debugValidation() {
    console.log('=== DEBUG MANUAL ===');
    console.log('canOptimize():', this.canOptimize());
    
    // Forçar validação do form
    this.configForm.updateValueAndValidity();
    console.log('Form após updateValueAndValidity:', this.configForm.valid, this.configForm.value);
    
    // Mostrar alertas para debug
    if (!this.startLocation) {
      alert('❌ Falta local de início');
    } else if (this.deliveries.length === 0) {
      alert('❌ Falta pontos de entrega');
    } else if (!this.configForm.valid) {
      alert('❌ Formulário de configuração inválido');
    } else {
      // Verificar cada entrega individualmente
      for (let i = 0; i < this.deliveries.length; i++) {
        const d = this.deliveries[i];
        if (!d.location.latitude || !d.location.longitude) {
          alert(`❌ Entrega ${i+1}: falta coordenadas`);
          return;
        }
        if (d.products.length === 0) {
          alert(`❌ Entrega ${i+1}: falta produtos`);
          return;
        }
        if (!d.customerName) {
          alert(`❌ Entrega ${i+1}: falta nome do cliente`);
          return;
        }
        if (!d.customerPhone) {
          alert(`❌ Entrega ${i+1}: falta telefone do cliente`);
          return;
        }
      }
      alert('✅ Tudo parece estar OK! O botão deveria estar habilitado.');
    }
  }

  isStepValid(step: number): boolean {
    switch (step) {
      case 1:
        return !!this.startLocation;
      case 2:
        return this.deliveries.length > 0 && 
               this.deliveries.every(d => d.location.latitude && d.location.longitude);
      case 3:
        return this.deliveries.every(d => 
          d.products.length > 0 && d.customerName && d.customerPhone
        ) && this.configForm.valid;
      case 4:
        return !!this.optimizationResults;
      default:
        return false;
    }
  }

  // Reset
  resetAll() {
    this.currentStep = 1;
    this.startLocation = null;
    this.deliveries = [];
    this.currentDeliveryIndex = -1;
    this.isSelectingStartLocation = false;
    this.isSelectingDeliveryLocation = false;
    this.optimizationResults = null;
    this.isOptimizing = false;
    this.optimizationError = null;
  }
}
