import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Depot } from '../models/article.model';

@Injectable({
  providedIn: 'root',
})
export class DepotService {
  private apiUrl = 'http://localhost:5256/api/Depot';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Depot[]> {
    return this.http.get<Depot[]>(this.apiUrl);
  }

  getById(id: number): Observable<Depot> {
    return this.http.get<Depot>(`${this.apiUrl}/${id}`);
  }

  create(depot: Depot): Observable<Depot> {
    return this.http.post<Depot>(this.apiUrl, depot);
  }

  update(id: number, depot: Depot): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, depot);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  importDepots(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/import-Depot`, formData);
  }
}
