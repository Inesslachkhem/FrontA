import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PromotionCategory {
  name: string;
  product_count: number;
  promotion_needed: number;
  avg_stock_coverage: number;
  avg_price: number;
}

export interface PromotionRecommendation {
  product_name: string;
  code_article: string;
  current_price: number;
  current_stock: number;
  stock_coverage_days: number;
  rotation: number;
  suggested_discount: number;
  discounted_price: number;
  predicted_sales_lift: number;
  confidence: number;
  expected_revenue_increase: number;
  reasoning: string;
  start_date: string;
  end_date: string;
  duration_days: number;
}

export interface PromotionSummary {
  category: string;
  total_products: number;
  products_to_promote: number;
  avg_discount: number;
  total_expected_revenue_increase: number;
  start_date: string;
  end_date: string;
  duration_days: number;
}

export interface PromotionGenerationResponse {
  success: boolean;
  message: string;
  recommendations: PromotionRecommendation[];
  summary: PromotionSummary;
  timestamp: string;
}

export interface CategoriesResponse {
  categories: PromotionCategory[];
  total_products: number;
  timestamp: string;
}

export interface ModelStatus {
  models_loaded: boolean;
  promotion_classifier: boolean;
  discount_regressor: boolean;
  impact_regressor: boolean;
  database_connected: boolean;
  timestamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class PromotionAiService {
  private readonly apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  /**
   * Health check for the AI service
   */
  healthCheck(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`);
  }

  /**
   * Get available product categories
   */
  getCategories(): Observable<CategoriesResponse> {
    return this.http.get<CategoriesResponse>(
      `${this.apiUrl}/promotions/categories`
    );
  }

  /**
   * Generate promotion recommendations for a specific category
   */
  generatePromotions(
    category: string,
    startDate?: string
  ): Observable<PromotionGenerationResponse> {
    const payload = {
      category: category,
      start_date: startDate || new Date().toISOString().split('T')[0],
    };

    return this.http.post<PromotionGenerationResponse>(
      `${this.apiUrl}/promotions/generate`,
      payload
    );
  }

  /**
   * Analyze a single product for promotion recommendations
   */
  analyzeProduct(productData: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/promotions/analyze-product`,
      productData
    );
  }

  /**
   * Get the status of AI models
   */
  getModelStatus(): Observable<ModelStatus> {
    return this.http.get<ModelStatus>(`${this.apiUrl}/promotions/model-status`);
  }
}
