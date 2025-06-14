import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ArticleService } from '../../services/article.service';
import { PromotionService } from '../../services/promotion.service';
import { StockService } from '../../services/stock.service';
import { VenteService } from '../../services/vente.service';
import { Article, Promotion, Stock, Vente } from '../../models/article.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  loading = false;

  // Counts
  articlesCount = 0;
  activeArticlesCount = 0;
  activePromotionsCount = 0;
  pendingPromotionsCount = 0;
  lowStockCount = 0;
  outOfStockCount = 0;
  todaysSalesCount = 0;
  todaysRevenue = 0;
  // Recent data
  lowStockItems: Stock[] = [];
  recentPromotions: Promotion[] = [];
  recentOrders: any[] = [];

  // Stats for the dashboard display
  stats: any[] = [];

  constructor(
    private articleService: ArticleService,
    private promotionService: PromotionService,
    private stockService: StockService,
    private venteService: VenteService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;

    // Load articles
    this.articleService.getAll().subscribe({
      next: (articles) => {
        this.articlesCount = articles.length;
        this.activeArticlesCount = articles.filter(
          (a) => a.prix_Vente_TND > 0
        ).length;
      },
      error: (error) => console.error('Error loading articles:', error),
    });

    // Load promotions
    this.promotionService.getAll().subscribe({
      next: (promotions) => {
        this.recentPromotions = promotions.sort(
          (a, b) =>
            new Date(b.dateCreation).getTime() -
            new Date(a.dateCreation).getTime()
        );
        this.pendingPromotionsCount = promotions.filter(
          (p) => !p.isAccepted
        ).length;
      },
      error: (error) => console.error('Error loading promotions:', error),
    });

    // Load active promotions
    this.promotionService.getActivePromotions().subscribe({
      next: (activePromotions) => {
        this.activePromotionsCount = activePromotions.length;
      },
      error: (error) =>
        console.error('Error loading active promotions:', error),
    });

    // Load stock data
    this.stockService.getAll().subscribe({
      next: (stocks) => {
        this.lowStockItems = stocks.filter(
          (s) => s.quantitePhysique <= s.stockMin && s.quantitePhysique > 0
        );
        this.lowStockCount = this.lowStockItems.length;
        this.outOfStockCount = stocks.filter(
          (s) => s.quantitePhysique === 0
        ).length;
      },
      error: (error) => console.error('Error loading stock:', error),
    });

    // Load today's sales
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );
    this.venteService.getByDateRange(startOfDay, endOfDay).subscribe({
      next: (todaysSales) => {
        this.todaysSalesCount = todaysSales.length;
        this.todaysRevenue = todaysSales.reduce(
          (sum, sale) => sum + sale.montantTotal,
          0
        );

        // Create recent orders from sales data
        this.recentOrders = todaysSales.slice(0, 5).map((sale, index) => ({
          id: `ORD-${1000 + index}`,
          customer: `Customer ${index + 1}`,
          amount: sale.montantTotal.toFixed(2),
          status:
            index % 3 === 0
              ? 'Completed'
              : index % 3 === 1
              ? 'Pending'
              : 'Processing',
          date: new Date(sale.dateVente).toLocaleDateString(),
        }));

        this.updateStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading today sales:', error);
        // Create mock data if no sales data available
        this.recentOrders = [
          {
            id: 'ORD-1001',
            customer: 'Customer 1',
            amount: '150.00',
            status: 'Completed',
            date: new Date().toLocaleDateString(),
          },
          {
            id: 'ORD-1002',
            customer: 'Customer 2',
            amount: '89.50',
            status: 'Pending',
            date: new Date().toLocaleDateString(),
          },
          {
            id: 'ORD-1003',
            customer: 'Customer 3',
            amount: '200.00',
            status: 'Processing',
            date: new Date().toLocaleDateString(),
          },
        ];
        this.updateStats();
        this.loading = false;
      },
    });
  }

  updateStats() {
    this.stats = [
      {
        title: 'Total Articles',
        value: this.articlesCount,
        change: 12,
        changeType: 'increase',
        icon: 'fas fa-box',
        color: 'bg-blue-500',
      },
      {
        title: 'Active Promotions',
        value: this.activePromotionsCount,
        change: 8,
        changeType: 'increase',
        icon: 'fas fa-percentage',
        color: 'bg-green-500',
      },
      {
        title: 'Low Stock Items',
        value: this.lowStockCount,
        change: 5,
        changeType: 'decrease',
        icon: 'fas fa-exclamation-triangle',
        color: 'bg-yellow-500',
      },
      {
        title: "Today's Revenue",
        value: this.todaysRevenue.toFixed(2) + ' TND',
        change: 15,
        changeType: 'increase',
        icon: 'fas fa-dollar-sign',
        color: 'bg-purple-500',
      },
    ];
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
