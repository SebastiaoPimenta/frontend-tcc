import { Component, Output, EventEmitter, Input, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { Location } from '../../models/location.interface';

@Component({
  selector: 'app-google-maps',
  imports: [CommonModule, GoogleMapsModule],
  templateUrl: './google-maps.component.html',
  styleUrl: './google-maps.component.css'
})
export class GoogleMapsComponent implements OnInit {
  @Input() isSelectingStartLocation = false;
  @Input() isSelectingDeliveryLocation = false;
  @Output() locationSelected = new EventEmitter<Location>();
  @Output() startLocationSelected = new EventEmitter<Location>();
  @Output() deliveryLocationSelected = new EventEmitter<Location>();

  center: google.maps.LatLngLiteral = { lat: -14.235004, lng: -51.92528 }; // Centro do Brasil
  zoom = 5;
  
  startLocationMarker: google.maps.LatLngLiteral | null = null;
  deliveryMarkers: google.maps.LatLngLiteral[] = [];

  // Flag para controlar se o Google Maps foi carregado
  isGoogleMapsLoaded = false;

  markerOptions: google.maps.MarkerOptions = {
    draggable: false
  };

  startMarkerOptions: google.maps.MarkerOptions = {
    draggable: true,
    icon: {
      url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
    }
  };

  deliveryMarkerOptions: google.maps.MarkerOptions = {
    draggable: true,
    icon: {
      url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
    }
  };

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    // Verificar se estamos no browser e se o Google Maps está disponível
    if (isPlatformBrowser(this.platformId)) {
      this.waitForGoogleMaps();
    }
  }

  private waitForGoogleMaps(): void {
    // Função para verificar se o Google Maps foi carregado
    const checkGoogleMaps = () => {
      if (typeof google !== 'undefined' && google.maps) {
        this.isGoogleMapsLoaded = true;
        console.log('Google Maps carregado com sucesso!');
      } else {
        console.log('Aguardando Google Maps carregar...');
        setTimeout(checkGoogleMaps, 100);
      }
    };
    
    checkGoogleMaps();
  }

  onMapClick(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      // Usar Geocoding para obter o endereço
      this.reverseGeocode(lat, lng).then(location => {
        if (this.isSelectingStartLocation) {
          this.startLocationMarker = { lat, lng };
          this.startLocationSelected.emit(location);
        } else if (this.isSelectingDeliveryLocation) {
          this.deliveryMarkers.push({ lat, lng });
          this.deliveryLocationSelected.emit(location);
        }
      });
    }
  }

  private async reverseGeocode(lat: number, lng: number): Promise<Location> {
    const geocoder = new google.maps.Geocoder();
    
    try {
      const result = await geocoder.geocode({ location: { lat, lng } });
      if (result.results && result.results.length > 0) {
        const addressComponents = result.results[0].address_components;
        const formattedAddress = result.results[0].formatted_address;
        
        let city = '';
        let state = '';
        
        addressComponents?.forEach(component => {
          if (component.types.includes('administrative_area_level_2')) {
            city = component.long_name;
          }
          if (component.types.includes('administrative_area_level_1')) {
            state = component.short_name;
          }
        });

        return {
          latitude: lat,
          longitude: lng,
          address: formattedAddress,
          city: city,
          state: state
        };
      }
    } catch (error) {
      console.error('Erro no geocoding:', error);
    }

    // Fallback se o geocoding falhar
    return {
      latitude: lat,
      longitude: lng,
      address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      city: '',
      state: ''
    };
  }

  clearStartLocation() {
    this.startLocationMarker = null;
  }

  clearDeliveryLocations() {
    this.deliveryMarkers = [];
  }

  clearAllMarkers() {
    this.clearStartLocation();
    this.clearDeliveryLocations();
  }
}
