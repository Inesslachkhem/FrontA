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
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading today sales:', error);
        this.loading = false;
      },
    });
  }
}
