import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteOptimizationResponse } from '../../models/route-optimization-response.interface';

@Component({
  selector: 'app-route-results',
  imports: [CommonModule],
  templateUrl: './route-results.component.html',
  styleUrl: './route-results.component.css'
})
export class RouteResultsComponent {
  @Input() results: RouteOptimizationResponse | null = null;
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
}
