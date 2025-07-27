import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
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

    console.log('🌐 Appel API:', `${this.DOTNET_API_URL}/promotions`, { params: params.toString() });
    
    return this.http.get<any>(`${this.DOTNET_API_URL}/promotions`, { params }).pipe(
      map(response => {
        console.log('📥 Réponse API brute:', response);
        
        // Adapter le format de réponse de l'API .NET au format attendu par Angular
        if (response.success && response.data) {
          const adaptedPromotions = response.data.promotions.map((promo: any) => ({
            id: promo.id,
            article_id: promo.articleId || promo.id,
            article_name: promo.articleName || promo.description || 'Article inconnu',
            category_name: promo.categoryName || 'Non définie',
            current_price: promo.currentPrice || 0,
            promotional_price: promo.promotionalPrice || 0,
            promotion_percentage: promo.promotionPercentage || 0,
            current_stock: 100, // Valeur par défaut, peut être adaptée
            start_date: promo.startDate,
            end_date: promo.endDate,
            status: this.mapStatus(promo.status),
            created_at: promo.createdAt,
            updated_at: promo.updatedAt,
            created_by: promo.createdBy || 'System',
            description: promo.description,
            conditions: promo.conditions,
            max_usage: promo.maxUsage,
            current_usage: promo.currentUsage || 0,
            revenue_impact: promo.revenueImpact,
            is_ai_generated: promo.isAiGenerated || false
          }));

          const adaptedResponse: PromotionListResponse = {
            promotions: adaptedPromotions,
            total: response.data.pagination?.totalItems || adaptedPromotions.length,
            page: response.data.pagination?.currentPage || page,
            limit: response.data.pagination?.itemsPerPage || limit,
            totalPages: response.data.pagination?.totalPages || 1
          };

          console.log('📤 Réponse adaptée:', adaptedResponse);
          return adaptedResponse;
        } else {
          // Retourner une réponse vide en cas d'erreur
          console.warn('⚠️ Réponse API invalide:', response);
          return {
            promotions: [],
            total: 0,
            page: page,
            limit: limit,
            totalPages: 0
          };
        }
      })
    );
  }

  private mapStatus(status: string): 'pending' | 'approved' | 'rejected' | 'active' | 'expired' {
    switch (status?.toLowerCase()) {
      case 'pending': return 'pending';
      case 'approved': return 'approved';
      case 'rejected': return 'rejected';
      case 'active': return 'active';
      case 'expired': return 'expired';
      default: return 'pending';
    }
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
    // Transformation des données AI pour correspondre au format attendu par l'API Flask
    const transformedPromotions = promotions.map(promo => ({
      article_id: promo.article_id,
      article_name: promo.article_name,
      current_price: promo.current_price,
      promotional_price: promo.promotional_price,
      promotion_percentage: promo.promotion_percentage,
      risk_level: promo.risk_level,
      recommendation: promo.recommendation,
      impact: promo.impact || {
        revenue_change_percentage: 0,
        volume_change_percentage: 0
      },
      scores: promo.scores || {
        final_score: 0.85,
        sales_score: 0.5,
        elasticity_score: 0.5
      }
    }));

    const saveRequest = {
      promotions: transformedPromotions,
      start_date: startDate,
      end_date: endDate
    };
    
    console.log('🔄 Sauvegarde des promotions:', saveRequest);
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
