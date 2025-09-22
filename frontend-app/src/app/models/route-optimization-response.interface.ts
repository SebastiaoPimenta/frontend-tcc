import { Delivery } from './delivery.interface';

export interface RouteOptimizationResponse {
  optimizedRoute: number[];
  deliveryOrder: Delivery[];
  totalDistanceKm: number;
  totalTimeMinutes: number;
  feasible: boolean;
  message: string;
  algorithmExecutionTimeMs: number;
}