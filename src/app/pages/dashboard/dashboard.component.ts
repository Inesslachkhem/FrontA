import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ArticleService } from '../../services/article.service';
import { PromotionService } from '../../services/promotion.service';
import { AuthService } from '../../services/auth.service';
import { Article } from '../../models/article.model';
import { Promotion } from '../../models/promotion.model';
import { User, UserType } from '../../models/user.model';
import { AdminStatsWidgetComponent } from '../../components/widgets/admin-stats-widget.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminStatsWidgetComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  loading = false;
  currentUser: User | null = null;

  // Core data
  articles: Article[] = [];
  promotions: Promotion[] = [];
  articlesWithPromotions: any[] = [];

  // Counts
  articlesCount = 0;
  activePromotionsCount = 0;
  articlesWithPromotionsCount = 0;

  // Chart data for articles with promotions
  promotionChartData: any[] = [];

  // Stats for the dashboard display
  stats: any[] = [];

  constructor(
    private articleService: ArticleService,
    private promotionService: PromotionService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
    this.loadDashboardData();
  }

  get isAdmin(): boolean {
    return this.currentUser?.type === UserType.Admin;
  }

  loadDashboardData() {
    this.loading = true;

    // Load articles
    this.articleService.getAll().subscribe({
      next: (articles) => {
        this.articles = articles;
        this.articlesCount = articles.length;
        this.loadPromotions();
      },
      error: (error) => {
        console.error('Error loading articles:', error);
        this.loading = false;
      },
    });
  }

  loadPromotions() {
    this.promotionService.getAll().subscribe({
      next: (promotions) => {
        this.promotions = promotions;
        this.activePromotionsCount = promotions.filter(
          (p) => p['isAccepted'] && new Date(p.dateFin) > new Date()
        ).length;

        this.generateArticlesWithPromotions();
        this.generatePromotionChart();
        this.updateStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading promotions:', error);
        this.updateStats();
        this.loading = false;
      },
    });
  }
  generateArticlesWithPromotions() {
    this.articlesWithPromotions = this.articles
      .map((article) => {
        const articlePromotions = this.promotions.filter(
          (p) => p['codeArticle'] === article.codeArticle && p['isAccepted']
        );

        if (articlePromotions.length > 0) {
          const bestPromotion = articlePromotions.reduce((best, current) => {
            if (!best) return current;
            if (!current) return best;
            return (current?.['tauxReduction'] ?? 0) > (best?.['tauxReduction'] ?? 0) ? current : best;
          }, articlePromotions[0]);

          return {
            ...article,
            hasPromotion: true,
            promotionCount: articlePromotions.length,
            bestDiscount: bestPromotion['tauxReduction'],
            discountedPrice: bestPromotion['prix_Vente_TND_Apres'],
          };
        }

        return null;
      })
      .filter((item) => item !== null)
      .slice(0, 10);

    this.articlesWithPromotionsCount = this.articlesWithPromotions.length;
  }

  generatePromotionChart() {
    // Group articles by promotion percentage ranges
    const ranges = [
      { min: 0, max: 10, label: '0-10%', count: 0 },
      { min: 10, max: 20, label: '10-20%', count: 0 },
      { min: 20, max: 30, label: '20-30%', count: 0 },
      { min: 30, max: 50, label: '30-50%', count: 0 },
      { min: 50, max: 100, label: '50%+', count: 0 },
    ];

    this.articlesWithPromotions.forEach((article) => {
      const discount = article.bestDiscount;
      const range =
        ranges.find((r) => discount >= r.min && discount < r.max) ||
        ranges[ranges.length - 1];
      range.count++;
    });

    this.promotionChartData = ranges.filter((r) => r.count > 0);
  }

  updateStats() {
    this.stats = [
      {
        title: 'Total Articles',
        value: this.articlesCount,
        changeType: 'neutral',
        icon: 'fas fa-box',
        color: 'blue',
      },
      {
        title: 'Active Promotions',
        value: this.activePromotionsCount,
        changeType: 'increase',
        icon: 'fas fa-tags',
        color: 'green',
      },
      {
        title: 'Articles with Promotions',
        value: this.articlesWithPromotionsCount,
        changeType: 'increase',
        icon: 'fas fa-percentage',
        color: 'purple',
      },
      {
        title: 'Promotion Coverage',
        value:
          this.articlesCount > 0
            ? Math.round(
                (this.articlesWithPromotionsCount / this.articlesCount) * 100
              ) + '%'
            : '0%',
        changeType: 'neutral',
        icon: 'fas fa-chart-pie',
        color: 'orange',
      },
    ];
  }
}
