import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import {
  Chart,
  ChartConfiguration,
  ChartData,
  ChartEvent,
  ChartType,
  registerables,
} from 'chart.js';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardData } from '../../models/dashboard.model';
import {
  PromotionAiService,
  PromotionCategory,
  PromotionGenerationResponse,
} from '../../services/promotion-ai.service';
import { Subject, takeUntil, forkJoin } from 'rxjs';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  dashboardData: DashboardData | null = null;
  loading = true;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  // Animation states
  animateCards = false;

  // Chart configurations
  public salesChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  public salesChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = this.formatCurrency(context.parsed as number);
            return `${label}: ${value}`;
          },
        },
      },
    },
  };

  public monthlySalesChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        label: 'Revenue (TND)',
        data: [],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
      {
        label: 'Quantity',
        data: [],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        yAxisID: 'y1',
      },
    ],
  };

  public monthlySalesChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value =
              context.datasetIndex === 0
                ? this.formatCurrency(context.parsed.y)
                : this.formatNumber(context.parsed.y);
            return `${label}: ${value}`;
          },
        },
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Revenue (TND)',
        },
        ticks: {
          callback: (value) => this.formatCurrency(value as number),
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Quantity',
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: (value) => this.formatNumber(value as number),
        },
      },
    },
  };

  constructor(
    private dashboardService: DashboardService,
    private promotionAiService: PromotionAiService
  ) {}

  // AI Promotion properties
  categories: PromotionCategory[] = [];
  selectedCategory: string = '';
  aiServiceConnected = false;
  promotionLoading = false;
  promotionResults: PromotionGenerationResponse | null = null;
  showPromotionModal = false;

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadPromotionCategories();
    // Trigger card animations after component loads
    setTimeout(() => {
      this.animateCards = true;
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    this.dashboardService
      .getDashboardStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.dashboardData = data;
          this.updateChartData(data);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading dashboard data:', error);
          this.error = 'Failed to load dashboard data. Please try again.';
          this.loading = false;
        },
      });
  }

  private updateChartData(data: DashboardData): void {
    // Update sales chart
    if (data.salesChartData && data.salesChartData.length > 0) {
      this.salesChartData = {
        labels: data.salesChartData.map((item) => item.label),
        datasets: [
          {
            data: data.salesChartData.map((item) => item.value),
            backgroundColor: data.salesChartData.map((item) => item.color),
            borderWidth: 2,
            borderColor: '#ffffff',
          },
        ],
      };
    }

    // Update monthly sales chart
    if (data.monthlySales && data.monthlySales.length > 0) {
      this.monthlySalesChartData = {
        labels: data.monthlySales.map((item) => item.month),
        datasets: [
          {
            label: 'Revenue (TND)',
            data: data.monthlySales.map((item) => item.revenue),
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#3B82F6',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
          },
          {
            label: 'Quantity',
            data: data.monthlySales.map((item) => item.quantity),
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: false,
            tension: 0.4,
            pointBackgroundColor: '#10B981',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
            yAxisID: 'y1',
          },
        ],
      };
    }
  }

  refreshData(): void {
    this.loadDashboardData();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 2,
    }).format(value);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('fr-TN').format(value);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-TN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }

  getPromotionStatusClass(promotion: any): string {
    if (!promotion.isAccepted) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    }

    const now = new Date();
    const endDate = new Date(promotion.dateFin);

    if (endDate > now) {
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    } else {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  }

  getPromotionStatusText(promotion: any): string {
    if (!promotion.isAccepted) {
      return 'Pending';
    }

    const now = new Date();
    const endDate = new Date(promotion.dateFin);

    if (endDate > now) {
      return 'Active';
    } else {
      return 'Expired';
    }
  }

  // AI Promotion Methods
  loadPromotionCategories(): void {
    this.promotionAiService
      .getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.categories = response.categories;
          this.aiServiceConnected = true;
          if (this.categories.length > 0) {
            this.selectedCategory = this.categories[0].name;
          }
        },
        error: (error) => {
          console.warn('AI service not available:', error);
          this.aiServiceConnected = false;
        },
      });
  }

  generatePromotions(): void {
    if (!this.selectedCategory) {
      return;
    }

    this.promotionLoading = true;
    const startDate = new Date().toISOString().split('T')[0];

    this.promotionAiService
      .generatePromotions(this.selectedCategory, startDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.promotionResults = response;
          this.showPromotionModal = true;
          this.promotionLoading = false;

          // Reload dashboard data to reflect any new promotions
          this.loadDashboardData();
        },
        error: (error) => {
          console.error('Error generating promotions:', error);
          this.promotionLoading = false;
          // You could add a toast notification here
        },
      });
  }

  closePromotionModal(): void {
    this.showPromotionModal = false;
    this.promotionResults = null;
  }

  onCategoryChange(event: any): void {
    this.selectedCategory = event.target.value;
  }
}
