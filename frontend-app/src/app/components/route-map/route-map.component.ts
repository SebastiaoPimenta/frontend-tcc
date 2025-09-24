import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { RouteOptimizationResponse } from '../../models/route-optimization-response.interface';
import { Location } from '../../models/location.interface';

@Component({
  selector: 'app-route-map',
  imports: [CommonModule, GoogleMapsModule],
  template: `
    <div class="route-map-container">
      <h3>Visualização da Rota Otimizada</h3>
      
      <div *ngIf="!results" class="no-route-message">
        <p>Nenhuma rota para exibir</p>
      </div>

      <div *ngIf="results && results.deliveryOrder.length > 0" class="map-wrapper">
        <div *ngIf="isLoadingRoute" class="loading-route">
          <p>📍 Calculando rota real pelas ruas...</p>
        </div>
        
        <google-map
          #googleMap
          [height]="mapHeight"
          [width]="mapWidth"
          [center]="mapCenter"
          [zoom]="mapZoom"
          [options]="mapOptions"
          (mapInitialized)="onMapInitialized($event)">
          
          <!-- Marcador do ponto inicial -->
          <map-marker
            [position]="getStartLocationPosition()"
            [title]="getStartLocationTitle()"
            [options]="getStartLocationMarkerOptions()">
          </map-marker>
          
          <!-- Marcadores das entregas (já ordenadas) -->
          <map-marker
            *ngFor="let delivery of results.deliveryOrder; let deliveryIndex = index"
            [position]="getDeliveryPosition(delivery)"
            [title]="getDeliveryTitle(delivery, deliveryIndex)"
            [options]="getDeliveryMarkerOptions(deliveryIndex)">
          </map-marker>
          
          <!-- Marcador do ponto final (retorno) -->
          <map-marker
            [position]="getEndLocationPosition()"
            [title]="getEndLocationTitle()"
            [options]="getEndLocationMarkerOptions()">
          </map-marker>

          <!-- Linhas da rota (apenas se não estiver usando directions) -->
          <map-polyline
            *ngIf="routePath.length > 1 && !showDirections && shouldShowPolyline"
            [path]="routePath"
            [options]="polylineOptions">
          </map-polyline>
        </google-map>

        <!-- Legenda -->
        <div class="route-legend">
          <div class="legend-item">
            <div class="legend-marker start"></div>
            <span>Início/Retorno</span>
          </div>
          <div class="legend-item">
            <div class="legend-marker delivery"></div>
            <span>Entregas</span>
          </div>
        </div>

        <!-- Informações da rota -->
        <div class="route-info">
          <p><strong>Total de entregas:</strong> {{ results.deliveryOrder.length }}</p>
          <p><strong>Total de pontos na rota:</strong> {{ results.optimizedRoute.length }}</p>
          <p><strong>Distância total:</strong> {{ results.totalDistanceKm | number:'1.1-1' }} km</p>
          <p><strong>Tempo estimado:</strong> {{ results.totalTimeMinutes }} minutos</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .route-map-container {
      margin-top: 2rem;
      padding: 1.5rem;
      background: #f8f9fa;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .route-map-container h3 {
      margin: 0 0 1rem 0;
      color: #2c3e50;
      font-size: 1.4rem;
      font-weight: 600;
    }

    .no-route-message {
      text-align: center;
      padding: 2rem;
      color: #6c757d;
    }

    .map-wrapper {
      position: relative;
    }

    .route-legend {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin: 1rem 0;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
    }

    .legend-marker {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }

    .legend-marker.start {
      background-color: #22c55e;
    }

    .legend-marker.delivery {
      background-color: #3b82f6;
    }

    .legend-marker.end {
      background-color: #ef4444;
    }

    .route-info {
      background: white;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
      margin-top: 1rem;
    }

    .route-info p {
      margin: 0.5rem 0;
      color: #374151;
    }

    .loading-route {
      background: #e3f2fd;
      border: 1px solid #2196f3;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
      text-align: center;
      color: #1976d2;
      font-size: 0.9rem;
    }

    .loading-route p {
      margin: 0;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .route-legend {
        flex-direction: column;
        gap: 1rem;
      }
    }
  `]
})
export class RouteMapComponent implements OnInit, OnChanges {
  @Input() results: RouteOptimizationResponse | null = null;
  @Input() startLocation: Location | null = null;
  @ViewChild('googleMap') googleMapRef!: ElementRef;

  // Serviços do Google Maps
  private directionsService!: google.maps.DirectionsService;
  private directionsRenderer!: google.maps.DirectionsRenderer;
  private mapInstance: google.maps.Map | null = null;

  mapHeight = '400px';
  mapWidth = '100%';
  mapZoom = 12;
  mapCenter: google.maps.LatLngLiteral = { lat: -23.5505, lng: -46.6333 }; // São Paulo como padrão

  mapOptions: google.maps.MapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: false,
    maxZoom: 18,
    minZoom: 8,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ]
  };

  polylineOptions: google.maps.PolylineOptions = {
    strokeColor: '#3b82f6',
    strokeOpacity: 1.0,
    strokeWeight: 4,
    geodesic: true
  };

  routePath: google.maps.LatLngLiteral[] = [];
  showDirections = false; // Para controlar quando mostrar directions vs polyline
  isLoadingRoute = false; // Para mostrar loading da rota real
  shouldShowPolyline = false; // Inicialmente não mostrar polyline até falhar directions

  ngOnInit(): void {
    // Inicializar serviços do Google Maps quando disponível
    this.initializeGoogleMapsServices();
  }

  private initializeGoogleMapsServices(): void {
    // Verificar se Google Maps está disponível
    if (typeof google !== 'undefined' && google.maps) {
      this.directionsService = new google.maps.DirectionsService();
      this.directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true, // Não mostrar marcadores padrão
        polylineOptions: {
          strokeColor: '#3b82f6',
          strokeOpacity: 1.0,
          strokeWeight: 4
        }
      });
    } else {
      // Tentar novamente após um delay
      setTimeout(() => this.initializeGoogleMapsServices(), 100);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['results'] && this.results) || (changes['startLocation'] && this.startLocation)) {
      this.updateMapData();
    }
  }

  private updateMapData(): void {
    if (!this.results || !this.results.deliveryOrder.length || !this.startLocation) {
      return;
    }

    // Construir o caminho da rota baseado na sequência otimizada
    this.routePath = this.buildOptimizedRoutePath();

    // Calcular o centro do mapa baseado nas coordenadas
    this.calculateMapCenter();

    // Calcular rota real usando Google Directions (apenas se o mapa estiver pronto)
    if (this.mapInstance) {
      setTimeout(() => this.calculateRealRoute(), 200);
    }
  }

  private buildOptimizedRoutePath(): google.maps.LatLngLiteral[] {
    const path: google.maps.LatLngLiteral[] = [];
    
    if (!this.results?.deliveryOrder || !this.startLocation) {
      return path;
    }

    // Começar com o ponto inicial
    path.push({
      lat: this.startLocation.latitude,
      lng: this.startLocation.longitude
    });

    // Adicionar todas as entregas na ordem já otimizada
    for (const delivery of this.results.deliveryOrder) {
      path.push({
        lat: delivery.location.latitude,
        lng: delivery.location.longitude
      });
    }

    // Finalizar com o retorno ao ponto inicial
    path.push({
      lat: this.startLocation.latitude,
      lng: this.startLocation.longitude
    });

    return path;
  }

  private calculateRealRoute(): void {
    if (!this.results?.deliveryOrder || !this.startLocation || this.routePath.length < 2) {
      return;
    }

    // Verificar se os serviços do Google Maps estão disponíveis
    if (!this.directionsService || !google?.maps?.DirectionsService) {
      console.warn('Google Maps DirectionsService não está disponível');
      return;
    }

    this.isLoadingRoute = true;
    this.shouldShowPolyline = false; // Esconder polyline enquanto carrega rota real

    // Preparar waypoints para o DirectionsService usando deliveryOrder diretamente
    const waypoints: google.maps.DirectionsWaypoint[] = [];
    
    // Adicionar todas as entregas como waypoints (já estão na ordem correta)
    for (const delivery of this.results.deliveryOrder) {
      waypoints.push({
        location: new google.maps.LatLng(delivery.location.latitude, delivery.location.longitude),
        stopover: true
      });
    }

    // Definir origem e destino (ambos são o ponto inicial)
    const origin = new google.maps.LatLng(this.startLocation.latitude, this.startLocation.longitude);
    const destination = new google.maps.LatLng(this.startLocation.latitude, this.startLocation.longitude);

    // Fazer a requisição ao DirectionsService
    const request: google.maps.DirectionsRequest = {
      origin: origin,
      destination: destination,
      waypoints: waypoints,
      optimizeWaypoints: false, // Não otimizar, usar a ordem já definida pelo backend
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
      avoidHighways: false,
      avoidTolls: false
    };

    this.directionsService.route(request, (result, status) => {
      this.isLoadingRoute = false;
      
      if (status === google.maps.DirectionsStatus.OK && result) {
        // Sucesso - usar DirectionsRenderer
        this.showDirections = true;
        this.shouldShowPolyline = false; // Esconder polyline
        
        // Limpar qualquer direção anterior
        this.directionsRenderer.setMap(null);
        
        // Configurar o renderer com o mapa quando ele estiver disponível
        setTimeout(() => {
          if (this.mapInstance) {
            this.directionsRenderer.setMap(this.mapInstance);
            this.directionsRenderer.setDirections(result);
          }
        }, 100);
        
        console.log('Rota real calculada - polyline deve estar escondida');
      } else {
        // Falha - voltar para polyline simples
        console.warn('Não foi possível calcular a rota real:', status);
        this.showDirections = false;
        this.shouldShowPolyline = true; // Mostrar polyline como fallback
        
        // Remover o DirectionsRenderer em caso de falha
        this.directionsRenderer.setMap(null);
        
        console.log('Falha na rota real - usando polyline como fallback');
      }
    });
  }

  private calculateMapCenter(): void {
    if (!this.results || !this.results.deliveryOrder.length || !this.startLocation) {
      return;
    }

    // Incluir o ponto de início junto com as entregas
    const allLocations = [this.startLocation, ...this.results.deliveryOrder.map(d => d.location)];
    const latSum = allLocations.reduce((sum, loc) => sum + loc.latitude, 0);
    const lngSum = allLocations.reduce((sum, loc) => sum + loc.longitude, 0);

    this.mapCenter = {
      lat: latSum / allLocations.length,
      lng: lngSum / allLocations.length
    };

    // Ajustar zoom baseado na dispersão dos pontos
    this.adjustZoomLevel(allLocations);
  }

  private adjustZoomLevel(locations: Location[]): void {
    if (locations.length < 2) {
      this.mapZoom = 14;
      return;
    }

    const lats = locations.map(l => l.latitude);
    const lngs = locations.map(l => l.longitude);
    
    const latRange = Math.max(...lats) - Math.min(...lats);
    const lngRange = Math.max(...lngs) - Math.min(...lngs);
    const maxRange = Math.max(latRange, lngRange);

    if (maxRange > 0.5) this.mapZoom = 10;
    else if (maxRange > 0.2) this.mapZoom = 11;
    else if (maxRange > 0.1) this.mapZoom = 12;
    else if (maxRange > 0.05) this.mapZoom = 13;
    else this.mapZoom = 14;
  }



  // Funções para o ponto inicial
  getStartLocationPosition(): google.maps.LatLngLiteral {
    return {
      lat: this.startLocation!.latitude,
      lng: this.startLocation!.longitude
    };
  }

  getStartLocationTitle(): string {
    return `Início: ${this.startLocation?.address || 'Ponto de partida'}`;
  }

  getStartLocationMarkerOptions(): google.maps.MarkerOptions {
    return {
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#22c55e', // Verde para início
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2
      },
      label: {
        text: 'P',
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold'
      }
    };
  }

  // Funções para as entregas
  getDeliveryPosition(delivery: any): google.maps.LatLngLiteral {
    return {
      lat: delivery.location.latitude,
      lng: delivery.location.longitude
    };
  }

  getDeliveryTitle(delivery: any, deliveryIndex: number): string {
    return `Entrega ${deliveryIndex + 1}: ${delivery.customerName} - ${delivery.location.address}`;
  }

  getDeliveryMarkerOptions(deliveryIndex: number): google.maps.MarkerOptions {
    return {
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#3b82f6', // Azul para entregas
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2
      },
      label: {
        text: (deliveryIndex + 1).toString(), // Numeração sequencial
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold'
      }
    };
  }

  // Funções para o ponto final
  getEndLocationPosition(): google.maps.LatLngLiteral {
    return {
      lat: this.startLocation!.latitude,
      lng: this.startLocation!.longitude
    };
  }

  getEndLocationTitle(): string {
    return `Retorno: ${this.startLocation?.address || 'Ponto de partida'}`;
  }

  getEndLocationMarkerOptions(): google.maps.MarkerOptions {
    return {
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#22c55e', // Verde para retorno
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2
      },
      label: {
        text: 'P',
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold'
      }
    };
  }

  onMapInitialized(map: google.maps.Map): void {
    this.mapInstance = map;
    
    // Garantir que os serviços estão inicializados
    if (!this.directionsService) {
      this.initializeGoogleMapsServices();
    }
    
    // Limpar estado anterior
    this.showDirections = false;
    this.shouldShowPolyline = false;
    
    // Se já temos dados, recalcular a rota real
    if (this.results && this.startLocation) {
      // Aguardar um pouco para garantir que tudo está pronto
      setTimeout(() => this.calculateRealRoute(), 300);
    }
  }
}