import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Article } from '../models/article.model';

@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  private apiUrl = 'http://localhost:5256/api/Article'; // Adjust URL as needed

  constructor(private http: HttpClient) {}

  // Get all articles
  getAll(): Observable<Article[]> {
    return this.http.get<Article[]>(this.apiUrl);
  }

  // Get article by ID
  getById(id: number): Observable<Article> {
    return this.http.get<Article>(`${this.apiUrl}/${id}`);
  }

  // Create new article
  create(article: Article): Observable<Article> {
    return this.http.post<Article>(this.apiUrl, article);
  }

  // Update article
  update(id: number, article: Article): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, article);
  }

  // Delete article
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Import articles from CSV
  importArticles(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/import-articles`, formData);
  }

  // Debug methods
  getCategoriesCount(): Observable<any> {
    return this.http.get(`${this.apiUrl}/debug/categories-count`);
  }

  // Auto-create missing categories
  autoCreateMissingCategories(categoryNames: string[]): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/auto-create-categories`,
      categoryNames
    );
  }

  testCsvParsing(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/debug/test-csv-parsing`, formData);
  }

  // Clear all articles
  clearAll(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clear-all`);
  }
}
