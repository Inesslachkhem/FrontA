export interface AIPromotion {
  article_id: number;
  article_name: string;
  current_price: number;
  promotional_price: number;
  promotion_percentage: number;
  current_stock: number;
  prediction_method: 'ai' | 'classic' | 'simulation';
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

export interface PromotionStatistics {
  total_promotions: number;
  average_promotion: number;
  total_revenue_impact: number;
  method_distribution: {
    ai: number;
    classic: number;
  };
  risk_distribution: {
    low: number;
    medium: number;
    high: number;
  };
}

export interface PromotionFilter {
  risk_level?: 'all' | 'low' | 'medium' | 'high';
  prediction_method?: 'all' | 'ai' | 'classic' | 'simulation';
  category_id?: number | null;
  sort_by?: 'revenue_change_percentage' | 'promotion_percentage' | 'final_score' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface PromotionRequest {
  category_id?: number;
  min_stock?: number;
  max_promotions?: number;
  prediction_method?: 'ai' | 'classic';
}

export interface PromotionResponse {
  success: boolean;
  message: string;
  data?: AIPromotion[];
  statistics?: PromotionStatistics;
  errors?: string[];
}
