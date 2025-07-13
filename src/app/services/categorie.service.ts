import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Categorie } from '../models/article.model';

@Injectable({
  providedIn: 'root',
})
export class CategorieService {
  private apiUrl = 'http://localhost:5256/api/Categorie'; // Adjust URL as needed

  constructor(private http: HttpClient) {}

  // Get all categories
  getAll(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(this.apiUrl);
  }

  // Get category by ID
  getById(id: string): Observable<Categorie> {
    return this.http.get<Categorie>(`${this.apiUrl}/${id}`);
  }

  // Create new category
  create(categorie: Categorie): Observable<Categorie> {
    return this.http.post<Categorie>(this.apiUrl, categorie);
  }

  // Update category
  update(id: string, categorie: Categorie): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, categorie);
  }

  // Delete category
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Test connection to backend
  testConnection(): Observable<any> {
    console.log('Testing connection to:', this.apiUrl);
    return this.http.get(`${this.apiUrl}`).pipe(
      tap((response: any) =>
        console.log('Connection test successful:', response)
      ),
      catchError((error: any) => {
        console.error('Connection test failed:', error);
        throw error;
      })
    );
  }

  // Import categories from CSV
  importCategories(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    console.log('FormData created:', formData);
    console.log('File being uploaded:', file.name, file.size, file.type);
    console.log('Making request to:', `${this.apiUrl}/import-categories`);

    // Don't set Content-Type header - let browser set it with boundary for multipart/form-data
    return this.http.post(`${this.apiUrl}/import-categories`, formData).pipe(
      tap((response) => console.log('Service response:', response)),
      catchError((error) => {
        console.error('Service error:', error);
        throw error;
      })
    );
  }

  // Clear all categories
  clearAll(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clear-all`);
  }

  // Debug CSV import
  debugCsv(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/debug-csv`, formData);
  }

  // Create categories in bulk from a list of IDs
  bulkCreate(categoryIds: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/bulk-create`, categoryIds);
  }
}
