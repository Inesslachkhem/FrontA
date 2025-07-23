import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Promotion, 
  PromotionListResponse, 
  PromotionCreateRequest, 
  PromotionUpdateRequest, 
  PromotionApprovalRequest,
  AIPromotionGenerationRequest 
} from '../models/promotion-extended.model';
import { AIPromotion } from '../models/promotion.model';

@Injectable({
  providedIn: 'root'
})
export class PromotionService {
  private readonly DOTNET_API_URL = 'http://localhost:5256/api';
  private readonly FLASK_API_URL = 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  // DotNet API calls for promotion CRUD operations
  getPromotions(page: number = 1, limit: number = 10, status?: string, search?: string): Observable<PromotionListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (status && status !== 'all') {
      params = params.set('status', status);
    }
    
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PromotionListResponse>(`${this.DOTNET_API_URL}/promotions`, { params });
  }

  getPromotionById(id: number): Observable<Promotion> {
    return this.http.get<Promotion>(`${this.DOTNET_API_URL}/promotions/${id}`);
  }

  createPromotion(promotion: PromotionCreateRequest): Observable<Promotion> {
    return this.http.post<Promotion>(`${this.DOTNET_API_URL}/promotions`, promotion);
  }

  updatePromotion(promotion: PromotionUpdateRequest): Observable<Promotion> {
    return this.http.put<Promotion>(`${this.DOTNET_API_URL}/promotions/${promotion.id}`, promotion);
  }

  deletePromotion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.DOTNET_API_URL}/promotions/${id}`);
  }

  approvePromotion(request: PromotionApprovalRequest): Observable<Promotion> {
    return this.http.patch<Promotion>(`${this.DOTNET_API_URL}/promotions/${request.id}/approve`, request);
  }

  rejectPromotion(request: PromotionApprovalRequest): Observable<Promotion> {
    return this.http.patch<Promotion>(`${this.DOTNET_API_URL}/promotions/${request.id}/reject`, request);
  }

  // Flask API calls for AI promotion generation
  generateAIPromotions(request: AIPromotionGenerationRequest): Observable<{ success: boolean; data: { promotions: AIPromotion[] } }> {
    return this.http.post<{ success: boolean; data: { promotions: AIPromotion[] } }>(`${this.FLASK_API_URL}/api/promotions/generate`, request);
  }

  checkFlaskHealth(): Observable<{ status: string; service: string; model_status: any }> {
    return this.http.get<{ status: string; service: string; model_status: any }>(`${this.FLASK_API_URL}/api/health`);
  }

  getCategories(): Observable<{ success: boolean; categories: any[] }> {
    return this.http.get<{ success: boolean; categories: any[] }>(`${this.FLASK_API_URL}/api/categories`);
  }

  saveAIPromotions(promotions: AIPromotion[], startDate: string, endDate: string): Observable<{ success: boolean; message: string; promotions: any[]; count: number }> {
    const saveRequest = {
      promotions: promotions,
      start_date: startDate,
      end_date: endDate
    };
    return this.http.post<{ success: boolean; message: string; promotions: any[]; count: number }>(`${this.FLASK_API_URL}/api/promotions/save`, saveRequest);
  }

  getModelStatus(): Observable<{ success: boolean; model_status: any }> {
    return this.http.get<{ success: boolean; model_status: any }>(`${this.FLASK_API_URL}/api/model/status`);
  }

  retrainModel(force: boolean = false): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.FLASK_API_URL}/api/model/retrain`, { force });
  }

  convertAIToPromotion(aiPromotion: AIPromotion): Observable<Promotion> {
    const promotionData = {
      article_id: aiPromotion.article_id,
      promotional_price: aiPromotion.promotional_price,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      description: `AI Generated: ${aiPromotion.recommendation}`,
      conditions: `Minimum stock: ${aiPromotion.current_stock}`,
      max_usage: 1000
    };
    
    return this.createPromotion(promotionData);
  }
}
