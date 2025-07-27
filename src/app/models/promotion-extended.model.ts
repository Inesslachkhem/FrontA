export interface Promotion {
  id: number;
  article_id: number;
  article_name: string;
  category_name?: string;
  current_price: number;
  promotional_price: number;
  promotion_percentage: number;
  current_stock: number;
  start_date: string;
  end_date: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'expired';
  created_at: string;
  updated_at: string;
  created_by: string;
  description?: string;
  conditions?: string;
  max_usage?: number;
  current_usage?: number;
  revenue_impact?: number;
  is_ai_generated?: boolean;
  expected_volume_impact?: number;
  expected_revenue_impact?: number;
  revenue_change_percentage?: number;
  volume_change_percentage?: number;
  recommendations?: string;
  ai_recommendations?: string;
  risk_level?: string;
}

export interface PromotionCreateRequest {
  article_id: number;
  promotional_price: number;
  start_date: string;
  end_date: string;
  description?: string;
  conditions?: string;
  max_usage?: number;
}

export interface PromotionUpdateRequest {
  id: number;
  promotional_price?: number;
  start_date?: string;
  end_date?: string;
  description?: string;
  conditions?: string;
  max_usage?: number;
  status?: 'pending' | 'approved' | 'rejected' | 'active' | 'expired';
}

export interface PromotionApprovalRequest {
  id: number;
  status: 'approved' | 'rejected';
  reason?: string;
}

export interface AIPromotionGenerationRequest {
  category_id?: number;
  prediction_method?: 'ai' | 'classic';
  start_date?: string;
  end_date?: string;
  duration_days?: number;
}

export interface PromotionListResponse {
  promotions: Promotion[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
