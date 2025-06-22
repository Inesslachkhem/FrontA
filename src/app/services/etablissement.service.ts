import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Etablissement } from '../models/article.model';

@Injectable({
  providedIn: 'root',
})
export class EtablissementService {
  private apiUrl = 'http://localhost:5256/api/Etablissement';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Etablissement[]> {
    return this.http.get<Etablissement[]>(this.apiUrl);
  }

  getById(id: number): Observable<Etablissement> {
    return this.http.get<Etablissement>(`${this.apiUrl}/${id}`);
  }

  create(etablissement: Etablissement): Observable<Etablissement> {
    return this.http.post<Etablissement>(this.apiUrl, etablissement);
  }

  update(id: number, etablissement: Etablissement): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, etablissement);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  importEtablissements(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    // On attend un objet JSON du backend
    return this.http.post(`${this.apiUrl}/import-Etab`, formData);
  }
}
