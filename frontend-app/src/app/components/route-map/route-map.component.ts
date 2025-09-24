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
          
          <!-- Marcadores baseados na sequência otimizada -->
          <map-marker
            *ngFor="let routeIndex of results.optimizedRoute; let sequenceIndex = index"
            [position]="getMarkerPosition(routeIndex)"
            [title]="getMarkerTitle(routeIndex, sequenceIndex)"
            [options]="getMarkerOptions(sequenceIndex)">
          </map-marker>

          <!-- Linhas da rota (apenas se não estiver usando directions) -->
          <map-polyline
            *ngIf="routePath.length > 1 && !showDirections"
            [path]="routePath"
            [options]="polylineOptions">
          </map-polyline>
        </google-map>

        <!-- Legenda -->
        <div class="route-legend">
          <div class="legend-item">
            <div class="legend-marker start"></div>
            <span>Ponto de Partida</span>
          </div>
          <div class="legend-item">
            <div class="legend-marker delivery"></div>
            <span>Entregas</span>
          </div>
          <div class="legend-item">
            <div class="legend-marker end"></div>
            <span>Ponto Final</span>
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

  ngOnInit(): void {
    // Inicializar serviços do Google Maps
    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: true, // Não mostrar marcadores padrão
      polylineOptions: {
        strokeColor: '#3b82f6',
        strokeOpacity: 1.0,
        strokeWeight: 4
      }
    });
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

    // Calcular rota real usando Google Directions
    this.calculateRealRoute();
  }

  private buildOptimizedRoutePath(): google.maps.LatLngLiteral[] {
    const path: google.maps.LatLngLiteral[] = [];
    
    if (!this.results?.optimizedRoute || !this.startLocation) {
      return path;
    }

    // Para cada índice na rota otimizada
    for (const index of this.results.optimizedRoute) {
      if (index === 0) {
        // Índice 0 = ponto de início
        path.push({
          lat: this.startLocation.latitude,
          lng: this.startLocation.longitude
        });
      } else {
        // Índices > 0 = entregas (ajustar por -1 pois o array de deliveries é 0-indexed)
        const deliveryIndex = index - 1;
        if (deliveryIndex >= 0 && deliveryIndex < this.results.deliveryOrder.length) {
          const delivery = this.results.deliveryOrder[deliveryIndex];
          path.push({
            lat: delivery.location.latitude,
            lng: delivery.location.longitude
          });
        }
      }
    }

    return path;
  }

  private calculateRealRoute(): void {
    if (!this.results?.optimizedRoute || !this.startLocation || this.routePath.length < 2) {
      return;
    }

    this.isLoadingRoute = true;

    // Preparar waypoints para o DirectionsService
    const waypoints: google.maps.DirectionsWaypoint[] = [];
    
    // Construir waypoints baseado na rota otimizada (excluindo início e fim)
    for (let i = 1; i < this.results.optimizedRoute.length - 1; i++) {
      const routeIndex = this.results.optimizedRoute[i];
      
      if (routeIndex === 0) {
        // Se for 0 (ponto de início) no meio da rota
        waypoints.push({
          location: new google.maps.LatLng(this.startLocation.latitude, this.startLocation.longitude),
          stopover: true
        });
      } else {
        // Se for uma entrega
        const deliveryIndex = routeIndex - 1;
        if (deliveryIndex >= 0 && deliveryIndex < this.results.deliveryOrder.length) {
          const delivery = this.results.deliveryOrder[deliveryIndex];
          waypoints.push({
            location: new google.maps.LatLng(delivery.location.latitude, delivery.location.longitude),
            stopover: true
          });
        }
      }
    }

    // Definir origem e destino
    const origin = new google.maps.LatLng(this.startLocation.latitude, this.startLocation.longitude);
    const destination = new google.maps.LatLng(this.startLocation.latitude, this.startLocation.longitude);

    // Fazer a requisição ao DirectionsService
    const request: google.maps.DirectionsRequest = {
      origin: origin,
      destination: destination,
      waypoints: waypoints,
      optimizeWaypoints: false, // Não otimizar, usar a ordem já definida
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
        
        // Configurar o renderer com o mapa quando ele estiver disponível
        setTimeout(() => {
          if (this.mapInstance) {
            this.directionsRenderer.setMap(this.mapInstance);
            this.directionsRenderer.setDirections(result);
          }
        }, 100);
      } else {
        // Falha - continuar usando polyline simples
        console.warn('Não foi possível calcular a rota real:', status);
        this.showDirections = false;
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

  getMarkerPosition(routeIndex: number): google.maps.LatLngLiteral {
    if (routeIndex === 0 && this.startLocation) {
      // Índice 0 = ponto de início
      return {
        lat: this.startLocation.latitude,
        lng: this.startLocation.longitude
      };
    } else {
      // Índices > 0 = entregas (ajustar por -1)
      const deliveryIndex = routeIndex - 1;
      if (deliveryIndex >= 0 && deliveryIndex < (this.results?.deliveryOrder.length || 0)) {
        const delivery = this.results!.deliveryOrder[deliveryIndex];
        return {
          lat: delivery.location.latitude,
          lng: delivery.location.longitude
        };
      }
    }
    return { lat: 0, lng: 0 }; // Fallback
  }

  getMarkerTitle(routeIndex: number, sequenceIndex: number): string {
    const isFirst = sequenceIndex === 0;
    const isLast = sequenceIndex === (this.results?.optimizedRoute.length || 0) - 1;
    
    if (routeIndex === 0) {
      // Ponto de início
      const position = isFirst ? 'Início' : 'Retorno';
      return `${position}: ${this.startLocation?.address || 'Ponto de partida'}`;
    } else {
      // Entrega
      const deliveryIndex = routeIndex - 1;
      if (deliveryIndex >= 0 && deliveryIndex < (this.results?.deliveryOrder.length || 0)) {
        const delivery = this.results!.deliveryOrder[deliveryIndex];
        return `Entrega ${sequenceIndex}: ${delivery.customerName} - ${delivery.location.address}`;
      }
    }
    return `Ponto ${sequenceIndex + 1}`;
  }

  getMarkerOptions(sequenceIndex: number): google.maps.MarkerOptions {
    const isFirst = sequenceIndex === 0;
    const isLast = sequenceIndex === (this.results?.optimizedRoute.length || 0) - 1;
    
    let color = '#3b82f6'; // Azul para entregas normais
    if (isFirst) color = '#22c55e'; // Verde para início
    if (isLast) color = '#ef4444';  // Vermelho para fim (retorno)

    return {
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: color,
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2
      },
      label: {
        text: (sequenceIndex + 1).toString(),
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold'
      }
    };
  }

  onMapInitialized(map: google.maps.Map): void {
    this.mapInstance = map;
    
    // Se já temos dados, recalcular a rota real
    if (this.results && this.startLocation) {
      this.calculateRealRoute();
    }
  }
}