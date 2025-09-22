import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Product } from '../../models/product.interface';

@Component({
  selector: 'app-product-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css'
})
export class ProductFormComponent implements OnInit {
  @Input() customerName: string = '';
  @Input() customerPhone: string = '';
  @Input() priority: number = 1;
  @Output() productsChanged = new EventEmitter<Product[]>();
  @Output() customerInfoChanged = new EventEmitter<{name: string, phone: string, priority: number}>();

  productForm: FormGroup;
  
  productTypes = [
    'Lácteo',
    'Carne',
    'Frango',
    'Peixe',
    'Fruta',
    'Verdura',
    'Grão',
    'Cereal',
    'Ovos',
    'Outros'
  ];

  temperatureOptions = [
    'ambiente',
    'refrigerado',
    'congelado'
  ];

  units = [
    'kg',
    'g',
    'litros',
    'ml',
    'unidades',
    'caixas',
    'pacotes'
  ];

  constructor(private fb: FormBuilder) {
    this.productForm = this.fb.group({
      customerName: ['', [Validators.required, Validators.minLength(2)]],
      customerPhone: ['', [Validators.required, Validators.pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)]],
      priority: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
      products: this.fb.array([])
    });
  }

  ngOnInit() {
    // Inicializar com um produto vazio
    this.addProduct();
    
    // Escutar mudanças no formulário
    this.productForm.valueChanges.subscribe(() => {
      this.emitChanges();
    });

    // Preencher valores iniciais se fornecidos
    if (this.customerName) {
      this.productForm.patchValue({ customerName: this.customerName });
    }
    if (this.customerPhone) {
      this.productForm.patchValue({ customerPhone: this.customerPhone });
    }
    if (this.priority) {
      this.productForm.patchValue({ priority: this.priority });
    }
  }

  get products(): FormArray {
    return this.productForm.get('products') as FormArray;
  }

  addProduct() {
    const productGroup = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      type: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(0.1)]],
      unit: ['', Validators.required],
      maxDeliveryTimeMinutes: [240, [Validators.required, Validators.min(30), Validators.max(1440)]],
      description: [''],
      temperature: ['', Validators.required]
    });

    this.products.push(productGroup);
  }

  removeProduct(index: number) {
    if (this.products.length > 1) {
      this.products.removeAt(index);
    }
  }

  private emitChanges() {
    if (this.productForm.valid) {
      const formValue = this.productForm.value;
      
      // Emitir produtos
      this.productsChanged.emit(formValue.products);
      
      // Emitir informações do cliente
      this.customerInfoChanged.emit({
        name: formValue.customerName,
        phone: formValue.customerPhone,
        priority: formValue.priority
      });
    }
  }

  getMaxDeliveryTimeInHours(minutes: number): number {
    return Math.round((minutes / 60) * 10) / 10;
  }

  setMaxDeliveryTimeFromHours(hours: number, index: number) {
    const minutes = Math.round(hours * 60);
    this.products.at(index).patchValue({ maxDeliveryTimeMinutes: minutes });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isProductFieldInvalid(index: number, fieldName: string): boolean {
    const field = this.products.at(index).get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
