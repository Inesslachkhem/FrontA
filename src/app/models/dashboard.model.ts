export interface DashboardData {
  acceptedPromotionsRevenue: number;
  categoriesCount: number;
  articlesCount: number;
  ventesCount: number;
  stocksCount: number;
  depotsCount: number;
  totalPromotionsCount: number;
  activePromotionsCount: number;
  pendingPromotionsCount: number;
  recentPromotions: RecentPromotion[];
  salesChartData: SalesChartData[];
  monthlySales: MonthlySales[];
}

export interface SalesChartData {
  label: string;
  value: number;
  color: string;
}

export interface MonthlySales {
  month: string;
  revenue: number;
  quantity: number;
}

export interface RecentPromotion {
  id: number;
  productName: string;
  categoryName: string;
  discountPercentage: number;
  originalPrice: number;
  finalPrice: number;
  dateFin: string;
  dateCreation: string;
  isAccepted: boolean;
  expectedRevenueImpact?: number;
}
