import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
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
        <google-map
          #googleMap
          [height]="mapHeight"
          [width]="mapWidth"
          [center]="mapCenter"
          [zoom]="mapZoom"
          [options]="mapOptions">
          
          <!-- Marcadores das entregas -->
          <map-marker
            *ngFor="let delivery of results.deliveryOrder; let i = index"
            [position]="getMarkerPosition(delivery.location)"
            [title]="getMarkerTitle(delivery, i)"
            [options]="getMarkerOptions(i)">
          </map-marker>

          <!-- Linhas da rota -->
          <map-polyline
            *ngIf="routePath.length > 1"
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

    @media (max-width: 768px) {
      .route-legend {
        flex-direction: column;
        gap: 1rem;
      }
    }
  `]
})
export class RouteMapComponent implements OnChanges {
  @Input() results: RouteOptimizationResponse | null = null;
  @ViewChild('googleMap') googleMapRef!: ElementRef;

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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['results'] && this.results) {
      this.updateMapData();
    }
  }

  private updateMapData(): void {
    if (!this.results || !this.results.deliveryOrder.length) {
      return;
    }

    // Criar o caminho da rota
    this.routePath = this.results.deliveryOrder.map(delivery => ({
      lat: delivery.location.latitude,
      lng: delivery.location.longitude
    }));

    // Calcular o centro do mapa baseado nas coordenadas
    this.calculateMapCenter();
  }

  private calculateMapCenter(): void {
    if (!this.results || !this.results.deliveryOrder.length) {
      return;
    }

    const locations = this.results.deliveryOrder.map(d => d.location);
    const latSum = locations.reduce((sum, loc) => sum + loc.latitude, 0);
    const lngSum = locations.reduce((sum, loc) => sum + loc.longitude, 0);

    this.mapCenter = {
      lat: latSum / locations.length,
      lng: lngSum / locations.length
    };

    // Ajustar zoom baseado na dispersão dos pontos
    this.adjustZoomLevel(locations);
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

  getMarkerPosition(location: Location): google.maps.LatLngLiteral {
    return {
      lat: location.latitude,
      lng: location.longitude
    };
  }

  getMarkerTitle(delivery: any, index: number): string {
    const position = index === 0 ? 'Início' : 
                    index === this.results!.deliveryOrder.length - 1 ? 'Fim' : 
                    `Entrega ${index}`;
    return `${position}: ${delivery.customerName} - ${delivery.location.address}`;
  }

  getMarkerOptions(index: number): google.maps.MarkerOptions {
    const isFirst = index === 0;
    const isLast = index === (this.results?.deliveryOrder.length || 0) - 1;
    
    let color = '#3b82f6'; // Azul para entregas normais
    if (isFirst) color = '#22c55e'; // Verde para início
    if (isLast) color = '#ef4444';  // Vermelho para fim

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
        text: (index + 1).toString(),
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold'
      }
    };
  }
}