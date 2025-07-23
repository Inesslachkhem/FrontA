import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface AIPromotion {
  article_id: number;
  article_name: string;
  current_price: number;
  promotional_price: number;
  promotion_percentage: number;
  current_stock: number;
  prediction_method: 'ai' | 'classic';
  scores: {
    stock_score: number;
    elasticity_score: number;
    sales_score: number;
    promotion_score: number;
    final_score: number;
  };
  impact: {
    current_monthly_sales_volume: number;
    predicted_monthly_sales_volume: number;
    volume_change_percentage: number;
    current_monthly_revenue: number;
    predicted_monthly_revenue: number;
    revenue_change_percentage: number;
    profit_change_percentage: number;
  };
  recommendation: string;
  risk_level: 'low' | 'medium' | 'high';
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface PromotionResponse {
  success: boolean;
  message: string;
  data?: {
    promotions: AIPromotion[];
    statistics: {
      total_promotions: number;
      average_promotion: number;
      total_revenue_impact: number;
      ai_predictions: number;
      classic_predictions: number;
    };
    category_id: number;
    generated_at: string;
    file_saved: string;
  };
  error?: string;
}

export interface ModelStatus {
  success: boolean;
  model_initialized: boolean;
  is_trained: boolean;
  metrics: any;
  best_model: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AIPromotionService {
  private readonly API_BASE_URL = 'http://localhost:5000/api';
  
  private promotionsSubject = new BehaviorSubject<AIPromotion[]>([]);
  public promotions$ = this.promotionsSubject.asObservable();
  
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  
  private statisticsSubject = new BehaviorSubject<any>(null);
  public statistics$ = this.statisticsSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    };
  }

  /**
   * Vérifie l'état de l'API Flask
   */
  checkAPIHealth(): Observable<any> {
    return this.http.get(`${this.API_BASE_URL}/health`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Récupère les catégories disponibles
   */
  getCategories(): Observable<Category[]> {
    return this.http.get<any>(`${this.API_BASE_URL}/categories`)
      .pipe(
        map(response => response.success ? response.categories : []),
        catchError(this.handleError)
      );
  }

  /**
   * Génère des promotions IA pour une catégorie
   */
  generatePromotions(categoryId: number): Observable<PromotionResponse> {
    this.loadingSubject.next(true);
    
    const payload = { category_id: categoryId };
    
    return this.http.post<PromotionResponse>(
      `${this.API_BASE_URL}/promotions/generate`,
      payload,
      this.getHttpOptions()
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          this.promotionsSubject.next(response.data.promotions);
          this.statisticsSubject.next(response.data.statistics);
        }
        this.loadingSubject.next(false);
        return response;
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        return this.handleError(error);
      })
    );
  }

  /**
   * Récupère l'historique des promotions générées
   */
  getPromotionsHistory(): Observable<any[]> {
    return this.http.get<any>(`${this.API_BASE_URL}/promotions/history`)
      .pipe(
        map(response => response.success ? response.history : []),
        catchError(this.handleError)
      );
  }

  /**
   * Récupère le contenu d'un fichier de promotions spécifique
   */
  getPromotionFile(filename: string): Observable<AIPromotion[]> {
    return this.http.get<any>(`${this.API_BASE_URL}/promotions/file/${filename}`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            this.promotionsSubject.next(response.data);
            return response.data;
          }
          return [];
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Récupère l'état du modèle IA
   */
  getModelStatus(): Observable<ModelStatus> {
    return this.http.get<ModelStatus>(`${this.API_BASE_URL}/model/status`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Réentraîne le modèle IA
   */
  retrainModel(useSimulation: boolean = true): Observable<any> {
    const payload = { use_simulation: useSimulation };
    
    return this.http.post<any>(
      `${this.API_BASE_URL}/model/retrain`,
      payload,
      this.getHttpOptions()
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Filtre les promotions par niveau de risque
   */
  filterPromotionsByRisk(riskLevel: 'low' | 'medium' | 'high'): Observable<AIPromotion[]> {
    return this.promotions$.pipe(
      map(promotions => promotions.filter(p => p.risk_level === riskLevel))
    );
  }

  /**
   * Filtre les promotions par méthode de prédiction
   */
  filterPromotionsByMethod(method: 'ai' | 'classic'): Observable<AIPromotion[]> {
    return this.promotions$.pipe(
      map(promotions => promotions.filter(p => p.prediction_method === method))
    );
  }

  /**
   * Trie les promotions par pourcentage de promotion (décroissant)
   */
  sortPromotionsByDiscount(): Observable<AIPromotion[]> {
    return this.promotions$.pipe(
      map(promotions => [...promotions].sort((a, b) => b.promotion_percentage - a.promotion_percentage))
    );
  }

  /**
   * Trie les promotions par impact sur le revenu (décroissant)
   */
  sortPromotionsByRevenueImpact(): Observable<AIPromotion[]> {
    return this.promotions$.pipe(
      map(promotions => [...promotions].sort((a, b) => b.impact.revenue_change_percentage - a.impact.revenue_change_percentage))
    );
  }

  /**
   * Récupère les promotions les plus rentables (top N)
   */
  getTopProfitablePromotions(limit: number = 5): Observable<AIPromotion[]> {
    return this.sortPromotionsByRevenueImpact().pipe(
      map(promotions => promotions.slice(0, limit))
    );
  }

  /**
   * Calcule les statistiques globales des promotions
   */
  calculatePromotionStats(): Observable<any> {
    return this.promotions$.pipe(
      map(promotions => {
        if (promotions.length === 0) return null;

        const totalRevenue = promotions.reduce((sum, p) => sum + p.impact.current_monthly_revenue, 0);
        const totalPredictedRevenue = promotions.reduce((sum, p) => sum + p.impact.predicted_monthly_revenue, 0);
        const avgPromotion = promotions.reduce((sum, p) => sum + p.promotion_percentage, 0) / promotions.length;
        
        return {
          total_promotions: promotions.length,
          average_promotion: Math.round(avgPromotion * 10) / 10,
          total_revenue_impact: Math.round((totalPredictedRevenue - totalRevenue) * 100) / 100,
          revenue_impact_percentage: totalRevenue > 0 ? Math.round(((totalPredictedRevenue - totalRevenue) / totalRevenue * 100) * 10) / 10 : 0,
          ai_predictions: promotions.filter(p => p.prediction_method === 'ai').length,
          classic_predictions: promotions.filter(p => p.prediction_method === 'classic').length,
          high_risk_count: promotions.filter(p => p.risk_level === 'high').length,
          medium_risk_count: promotions.filter(p => p.risk_level === 'medium').length,
          low_risk_count: promotions.filter(p => p.risk_level === 'low').length
        };
      })
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('Erreur API AI Promotion:', error);
    
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      if (error.status === 0) {
        errorMessage = 'Impossible de joindre le service Flask. Vérifiez qu\'il est démarré sur le port 5000.';
      } else {
        errorMessage = error.error?.message || `Erreur ${error.status}: ${error.statusText}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
