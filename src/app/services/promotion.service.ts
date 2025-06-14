import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Promotion } from '../models/article.model';

@Injectable({
  providedIn: 'root',
})
export class PromotionService {
  private apiUrl = 'http://localhost:5256/api/Promotion'; // Adjust URL as needed
  private apiUrlV2 = 'http://localhost:5000/api/generate-and-save'; // Adjust URL as needed
  constructor(private http: HttpClient) {}

  // Get all promotions
  getAll(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(this.apiUrl);
  }

  // Get promotion by ID
  getById(id: number): Observable<Promotion> {
    return this.http.get<Promotion>(`${this.apiUrl}/${id}`);
  }

  // Get promotions by article code
  getByArticleCode(codeArticle: string): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(
      `${this.apiUrl}/by-article/${codeArticle}`
    );
  }

  // Get active promotions
  getActivePromotions(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(`${this.apiUrl}/active`);
  }

  // Get expired promotions
  getExpiredPromotions(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(`${this.apiUrl}/expired`);
  }

  // Get promotions by reduction range
  getByReductionRange(
    minReduction: number,
    maxReduction: number
  ): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(
      `${this.apiUrl}/by-reduction-range?minReduction=${minReduction}&maxReduction=${maxReduction}`
    );
  }

  // Get upcoming promotions
  getUpcomingPromotions(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(`${this.apiUrl}/upcoming`);
  }

  // Create new promotion
  create(promotion: Promotion): Observable<Promotion> {
    return this.http.post<Promotion>(this.apiUrl, promotion);
  }

  // Update promotion
  update(id: number, promotion: Promotion): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, promotion);
  }

  // Delete promotion
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  // Approve promotion
  approve(id: number, approvedBy?: string): Observable<any> {
    const body = approvedBy ? { approvedBy } : {};
    return this.http.post<any>(`${this.apiUrl}/${id}/approve`, body);
  }

  // Reject promotion
  reject(id: number, approvedBy?: string): Observable<any> {
    const body = approvedBy ? { approvedBy } : {};
    return this.http.post<any>(`${this.apiUrl}/${id}/reject`, body);
  }

  // Get approved promotions
  getApprovedPromotions(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(`${this.apiUrl}/approved`);
  }

  // Get pending promotions
  getPendingPromotions(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(`${this.apiUrl}/pending`);
  }

  // Generate AI promotion using Flask API
  generateAIPromotion(
    articleCode: string,
    targetDate: string,
    autoSave: boolean = true
  ): Observable<any> {
    const payload = {
      article_code: articleCode,
      target_date: targetDate,
      auto_save: autoSave,
    };
    return this.http.post<any>(this.apiUrlV2, payload);
  }

  // Predict promotion without saving (using Flask API)
  predictPromotion(articleCode: string, targetDate: string): Observable<any> {
    const payload = {
      article_code: articleCode,
      target_date: targetDate,
    };
    return this.http.post<any>('http://localhost:5000/api/predict', payload);
  }
}
