import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vente } from '../models/article.model';

@Injectable({
  providedIn: 'root',
})
export class VenteService {
  private apiUrl = 'http://localhost:5256/api/Vente';

  constructor(private http: HttpClient) {}

  // Get all sales
  getAll(): Observable<Vente[]> {
    return this.http.get<Vente[]>(this.apiUrl);
  }

  // Get sale by ID
  getById(id: number): Observable<Vente> {
    return this.http.get<Vente>(`${this.apiUrl}/${id}`);
  }

  // Get sales by article ID
  getByArticleId(articleId: number): Observable<Vente[]> {
    return this.http.get<Vente[]>(`${this.apiUrl}/by-article/${articleId}`);
  }

  // Get sales by date range
  getByDateRange(startDate: Date, endDate: Date): Observable<Vente[]> {
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];
    return this.http.get<Vente[]>(
      `${this.apiUrl}/by-date-range?startDate=${start}&endDate=${end}`
    );
  }

  // Get sales summary
  getSalesSummary(): Observable<any> {
    return this.http.get(`${this.apiUrl}/summary`);
  }

  // Create new sale
  create(vente: Vente): Observable<Vente> {
    return this.http.post<Vente>(this.apiUrl, vente);
  }

  // Update sale
  update(id: number, vente: Vente): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, vente);
  }

  // Delete sale
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Import sales from CSV
  importVentes(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/import-ventes`, formData);
  }
}
