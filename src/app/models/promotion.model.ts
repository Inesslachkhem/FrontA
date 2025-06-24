export interface Promotion {
  id?: number;
  articleId?: number;
  articleLibelle?: string;
  depotId?: number;
  depotLibelle?: string;
  etablissementId?: number;
  etablissementLibelle?: string;
  codeArticle?: string;
  article?: any;
  dateDebut?: Date | string;
  dateFin: Date | string;
  reductionPourcentage?: number;
  tauxReduction?: number;
  notes?: string;
  prix_Vente_TND_Avant?: number;
  prix_Vente_TND_Apres?: number;
  isAccepted?: boolean;
  dateCreation?: Date | string;
  dateApproval?: Date | string;
  // Champs IA harmonisés
  predictionConfidence?: number;
  seasonalAdjustment?: number;
  temporalAdjustment?: number;
  expectedVolumeImpact?: number;
  expectedRevenueImpact?: number;
  // Champs IA du moteur Python
  adjusted_promotion_pct?: number;
  promoted_price_tnd?: number;
  current_price_tnd?: number;
  volume_impact_pct?: number;
  revenue_impact_tnd?: number;
  projected_monthly_volume?: number;
  aiPredictionResults?: any;
  aiPredictions?: any;
  // Champs pour affichage
  createdAt?: Date | string;
  updatedAt?: Date | string;
  // Autres champs potentiels
  [key: string]: any;
}
