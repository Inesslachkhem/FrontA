import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface AIRecommendation {
  should_promote: boolean;
  confidence_score: number;
  optimal_discount_rate: number;
  predicted_sales_lift_percent: number;
  predicted_revenue_impact: number;
  risk_level: string;
  key_factors: string[];
  recommendation_reason: string;
}

export interface KPIData {
  rotation_rate: number;
  sell_through_rate_percent: number;
  stock_coverage_days: number;
  inventory_status: string;
}

export interface AIRecommendationResponse {
  status: string;
  product_id: number;
  product_name: string;
  ai_recommendation: AIRecommendation;
  current_kpis: KPIData;
  prediction_timestamp: string;
}

export interface BatchRecommendationResponse {
  status: string;
  total_products: number;
  successful_predictions: number;
  recommendations: AIRecommendation[];
  prediction_timestamp: string;
}

export interface ModelInfo {
  status: string;
  model_trained: boolean;
  model_version: string;
  features_used: string[];
  algorithms: string[];
  last_training?: string;
  prediction_accuracy?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AIPromotionService {
  private readonly aiApiUrl = environment.aiApiUrl || 'http://localhost:5001/ai';

  constructor(private http: HttpClient) {}

  /**
   * Get model information and status
   */
  getModelInfo(): Observable<ModelInfo> {
    return this.http.get<ModelInfo>(`${this.aiApiUrl}/model/info`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get AI promotion recommendation for a single product
   */
  getPromotionRecommendation(productData: any): Observable<AIRecommendationResponse> {
    const payload = {
      product_id: productData.id || productData.product_id,
      product_name: productData.name || productData.product_name || productData.libelle,
      current_price: productData.price || productData.current_price || productData.prix_vente_tnd,
      current_stock: productData.stock || productData.current_stock || productData.quantite_physique,
      total_sales_90d: productData.total_sales_90d || this.estimateSales(productData),
      total_revenue_90d: productData.total_revenue_90d || this.estimateRevenue(productData),
      total_purchased_90d: productData.total_purchased_90d || this.estimatePurchases(productData),
      sales_last_30d: productData.sales_last_30d || this.estimateRecentSales(productData),
      sales_previous_30d: productData.sales_previous_30d || this.estimatePreviousSales(productData),
      days_since_last_promo: productData.days_since_last_promo || 365,
      last_promo_discount: productData.last_promo_discount || 0,
      promo_count_6months: productData.promo_count_6months || 0,
      category_id: productData.category_id || productData.id_categorie || 1
    };

    return this.http.post<AIRecommendationResponse>(`${this.aiApiUrl}/promotion/predict`, payload)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get AI recommendations for multiple products
   */
  getBatchRecommendations(products: any[], maxProducts: number = 50): Observable<BatchRecommendationResponse> {
    const payload = {
      products: products.slice(0, maxProducts).map(product => ({
        product_id: product.id || product.product_id,
        product_name: product.name || product.product_name || product.libelle,
        current_price: product.price || product.current_price || product.prix_vente_tnd,
        current_stock: product.stock || product.current_stock || product.quantite_physique,
        total_sales_90d: product.total_sales_90d || this.estimateSales(product),
        total_revenue_90d: product.total_revenue_90d || this.estimateRevenue(product),
        total_purchased_90d: product.total_purchased_90d || this.estimatePurchases(product),
        sales_last_30d: product.sales_last_30d || this.estimateRecentSales(product),
        sales_previous_30d: product.sales_previous_30d || this.estimatePreviousSales(product),
        days_since_last_promo: product.days_since_last_promo || 365,
        last_promo_discount: product.last_promo_discount || 0,
        promo_count_6months: product.promo_count_6months || 0,
        category_id: product.category_id || product.id_categorie || 1
      })),
      max_products: maxProducts
    };

    return this.http.post<BatchRecommendationResponse>(`${this.aiApiUrl}/promotion/batch`, payload)
      .pipe(catchError(this.handleError));
  }

  /**
   * Calculate retail KPIs for a product
   */
  calculateKPIs(productData: any): Observable<any> {
    const payload = {
      product_id: productData.id || productData.product_id,
      total_sales_90d: productData.total_sales_90d || this.estimateSales(productData),
      total_purchased_90d: productData.total_purchased_90d || this.estimatePurchases(productData),
      current_stock: productData.stock || productData.current_stock || productData.quantite_physique,
      sales_last_30d: productData.sales_last_30d || this.estimateRecentSales(productData),
      sales_previous_30d: productData.sales_previous_30d || this.estimatePreviousSales(productData),
      current_price: productData.price || productData.current_price || productData.prix_vente_tnd
    };

    return this.http.post<any>(`${this.aiApiUrl}/kpis/calculate`, payload)
      .pipe(catchError(this.handleError));
  }

  /**
   * Train or retrain the AI model
   */
  trainModel(monthsBack: number = 12, forceRetrain: boolean = false): Observable<any> {
    const payload = {
      months_back: monthsBack,
      force_retrain: forceRetrain
    };

    return this.http.post<any>(`${this.aiApiUrl}/model/train`, payload)
      .pipe(catchError(this.handleError));
  }

  /**
   * Check AI API health
   */
  checkHealth(): Observable<any> {
    return this.http.get<any>(`${this.aiApiUrl}/health`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get confidence level class for UI styling
   */
  getConfidenceClass(confidence: number): string {
    if (confidence >= 0.9) return 'confidence-excellent';
    if (confidence >= 0.8) return 'confidence-good';
    if (confidence >= 0.7) return 'confidence-fair';
    return 'confidence-poor';
  }

  /**
   * Get risk level class for UI styling
   */
  getRiskClass(riskLevel: string): string {
    switch (riskLevel.toLowerCase()) {
      case 'low': return 'risk-low';
      case 'medium': return 'risk-medium';
      case 'high': return 'risk-high';
      default: return 'risk-unknown';
    }
  }

  /**
   * Format percentage for display
   */
  formatPercent(value: number): string {
    return `${(value * 100).toFixed(1)}%`;
  }

  /**
   * Format currency for display
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'TND'
    }).format(value);
  }

  // Private helper methods for estimating missing data
  private estimateSales(product: any): number {
    // Simple estimation based on stock and product type
    const stock = product.stock || product.current_stock || product.quantite_physique || 0;
    return Math.max(0, Math.floor(stock * 0.3)); // Assume 30% of stock sold in 90 days
  }

  private estimateRevenue(product: any): number {
    const sales = this.estimateSales(product);
    const price = product.price || product.current_price || product.prix_vente_tnd || 0;
    return sales * price;
  }

  private estimatePurchases(product: any): number {
    const stock = product.stock || product.current_stock || product.quantite_physique || 0;
    const sales = this.estimateSales(product);
    return stock + sales; // Estimate total purchases as current stock + sales
  }

  private estimateRecentSales(product: any): number {
    const totalSales = this.estimateSales(product);
    return Math.floor(totalSales * 0.4); // Assume 40% of sales in last 30 days
  }

  private estimatePreviousSales(product: any): number {
    const totalSales = this.estimateSales(product);
    return Math.floor(totalSales * 0.35); // Assume 35% of sales in previous 30 days
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      
      if (error.status === 0) {
        errorMessage = 'Unable to connect to AI service. Please check if the AI API is running on http://localhost:5001';
      } else if (error.status === 500) {
        errorMessage = 'AI service internal error. Please check the model training status.';
      }
    }
    
    console.error('AI Service Error:', errorMessage);
    return throwError(errorMessage);
  }
}
