import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteOptimizationResponse } from '../../models/route-optimization-response.interface';
import { Location } from '../../models/location.interface';
import { RouteMapComponent } from '../route-map/route-map.component';

@Component({
  selector: 'app-route-results',
  imports: [CommonModule, RouteMapComponent],
  templateUrl: './route-results.component.html',
  styleUrl: './route-results.component.css'
})
export class RouteResultsComponent {
  @Input() results: RouteOptimizationResponse | null = null;
  @Input() startLocation: Location | null = null;
  @Input() isLoading = false;
  @Input() error: string | null = null;

  get totalTimeInHours(): number {
    if (!this.results) return 0;
    return Math.round((this.results.totalTimeMinutes / 60) * 10) / 10;
  }

  get executionTimeInSeconds(): number {
    if (!this.results) return 0;
    return Math.round((this.results.algorithmExecutionTimeMs / 1000) * 100) / 100;
  }

  getStatusClass(): string {
    if (!this.results) return '';
    return this.results.feasible ? 'success' : 'warning';
  }

  getStatusIcon(): string {
    if (!this.results) return '';
    return this.results.feasible ? '✅' : '⚠️';
  }

  getSequenceLabel(index: number): string {
    return index === 0 ? 'Início/Fim' : index.toString();
  }

  getSequenceChipClass(index: number): string {
    return index === 0 ? 'start' : '';
  }
}
