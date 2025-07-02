import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardData } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrl = 'http://localhost:5256/api/Dashboard';

  constructor(private http: HttpClient) {}

  // Get all dashboard statistics in a single call
  getDashboardStats(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.apiUrl}/stats`);
  }

  // Individual endpoint methods (if needed separately)
  getAcceptedPromotionsRevenue(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/accepted-promotions-revenue`);
  }

  getCategoriesCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/categories/count`);
  }

  getArticlesCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/articles/count`);
  }

  getVentesCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/ventes/count`);
  }

  getStocksCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stocks/count`);
  }

  getDepotsCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/depots/count`);
  }
}
