export interface DashboardData {
  categoriesCount: number;
  articlesCount: number;
  ventesCount: number;
  stocksCount: number;
  depotsCount: number;
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
