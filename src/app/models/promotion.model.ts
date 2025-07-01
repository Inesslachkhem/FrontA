export interface Promotion {
  id?: number;
  code_article: string;
  product_name: string;
  category_name: string;
  discount_percentage: string;
  price_before: string;
  price_after: string;
  end_date: string;
  created_at: string;
  status?: 'active' | 'expired' | 'pending';
  expected_volume_impact?: number;
  expected_revenue_impact?: number;
  is_accepted?: boolean;
  date_approval?: string;
  validateur_id?: number;
  prediction_confidence?: number;
  seasonal_adjustment?: number;
  temporal_adjustment?: number;
}

// .NET Backend model interfaces
export interface DotNetPromotion {
  id: number;
  dateFin: string;
  tauxReduction: number;
  codeArticle: string;
  prix_Vente_TND_Avant: number;
  prix_Vente_TND_Apres: number;
  isAccepted: boolean;
  dateCreation: string;
  dateApproval?: string;
  validateurId?: number;
  predictionConfidence?: number;
  seasonalAdjustment?: number;
  temporalAdjustment?: number;
  expectedVolumeImpact?: number;
  expectedRevenueImpact?: number;
  article?: {
    libelle: string;
    categorie?: {
      nom: string;
      description?: string;
    };
  };
}

export interface PromotionAnalysis {
  product_id: number;
  product_name: string;
  current_price: string;
  avg_monthly_sales: string;
  total_revenue: string;
  profit_margin: string;
  stock_level: number;
  sales_trend: 'increasing' | 'decreasing' | 'stable';
  needs_promotion: boolean;
  recommended_discount: string;
  projected_increase: string;
}

export interface PromotionGeneration {
  category_id: string; // Changed from number to string to match category IDs
  promotions_generated: number;
  promotions_saved: number;
  promotions: GeneratedPromotion[];
}

export interface GeneratedPromotion {
  product_id: number;
  discount_percentage: string;
  new_price: string;
  projected_sales_increase: string;
  projected_revenue_increase: string;
  start_date: string;
  end_date: string;
}

export interface Category {
  id: string; // Changed from number to string to match backend idCategorie
  name: string;
}

export interface PromotionStats {
  total_promotions: number;
  active_promotions: number;
  expired_promotions: number;
  total_discount_value: number;
  projected_revenue_increase: number;
}
