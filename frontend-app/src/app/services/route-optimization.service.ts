import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  RouteOptimizationRequest, 
  RouteOptimizationResponse 
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class RouteOptimizationService {
  private readonly baseUrl = 'http://localhost:8080/api/route-optimization';
  
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  /**
   * Otimiza a rota de entrega usando algoritmo genético
   */
  optimizeRoute(request: RouteOptimizationRequest): Observable<RouteOptimizationResponse> {
    return this.http.post<RouteOptimizationResponse>(
      `${this.baseUrl}/optimize`, 
      request, 
      this.httpOptions
    );
  }

  /**
   * Verifica se é possível realizar todas as entregas sem otimizar a rota
   */
  checkFeasibility(request: RouteOptimizationRequest): Observable<RouteOptimizationResponse> {
    return this.http.post<RouteOptimizationResponse>(
      `${this.baseUrl}/check-feasibility`, 
      request, 
      this.httpOptions
    );
  }

  /**
   * Retorna informações sobre o serviço
   */
  getServiceInfo(): Observable<any> {
    return this.http.get(`${this.baseUrl}/info`);
  }
}