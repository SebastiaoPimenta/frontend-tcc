import { Location } from './location.interface';
import { Delivery } from './delivery.interface';

export interface RouteOptimizationRequest {
  startLocation: Location;
  deliveries: Delivery[];
  vehicleSpeedKmH: number;
  loadingTimeMinutes: number;
  useGoogleMaps: boolean;
}