import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { PromotionService } from '../../services/promotion.service';
import { 
  Promotion, 
  PromotionStats, 
  Category, 
  PromotionAnalysis 
} from '../../models/promotion.model';

interface FilterOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-promotions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './promotions.component.html',
  styleUrls: ['./promotions.component.css']
})
export class PromotionsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Data properties
  promotions: Promotion[] = [];
  filteredPromotions: Promotion[] = [];
  categories: Category[] = [];
  promotionStats: PromotionStats = {
    total_promotions: 0,
    active_promotions: 0,
    expired_promotions: 0,
    total_discount_value: 0,
    projected_revenue_increase: 0
  };

  // UI state
  loading = false;
  showGenerateModal = false;
  showAnalysisModal = false;
  
  // Filters
  searchTerm = '';
  statusFilter = 'all';
  categoryFilter = 'all';
  sortBy = 'created_at';
  sortOrder: 'asc' | 'desc' = 'desc';

  // Generation
  selectedCategoryId: number | null = null;
  generating = false;
  
  // Analysis
  analysisData: PromotionAnalysis[] = [];
  analyzingCategory = false;

  // Filter options
  statusOptions: FilterOption[] = [
    { value: 'all', label: 'All Promotions' },
    { value: 'active', label: 'Active' },
    { value: 'expired', label: 'Expired' }
  ];

  sortOptions: FilterOption[] = [
    { value: 'created_at', label: 'Creation Date' },
    { value: 'end_date', label: 'End Date' },
    { value: 'discount_percentage', label: 'Discount %' },
    { value: 'product_name', label: 'Product Name' }
  ];

  constructor(private promotionService: PromotionService) {}

  ngOnInit(): void {
    this.loadPromotions();
    this.loadCategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Data loading methods
  loadPromotions(): void {
    this.loading = true;
    this.promotionService.getActivePromotions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (promotions) => {
          this.promotions = promotions;
          this.applyFilters();
          this.calculateStats();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading promotions:', error);
          this.loading = false;
        }
      });
  }

  loadCategories(): void {
    this.promotionService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.categories = categories;
        },
        error: (error) => {
          console.error('Error loading categories:', error);
        }
      });
  }

  // Filter and sort methods
  applyFilters(): void {
    let filtered = [...this.promotions];

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(promo => 
        (promo.product_name && promo.product_name.toLowerCase().includes(term)) ||
        (promo.category_name && promo.category_name.toLowerCase().includes(term)) ||
        (promo.code_article && promo.code_article.toLowerCase().includes(term))
      );
    }

    // Status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(promo => promo.status === this.statusFilter);
    }

    // Category filter
    if (this.categoryFilter !== 'all') {
      filtered = filtered.filter(promo => promo.category_name && promo.category_name === this.categoryFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (this.sortBy) {
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'end_date':
          aValue = new Date(a.end_date);
          bValue = new Date(b.end_date);
          break;
        case 'discount_percentage':
          aValue = parseFloat(a.discount_percentage.replace('%', ''));
          bValue = parseFloat(b.discount_percentage.replace('%', ''));
          break;
        case 'product_name':
          aValue = a.product_name.toLowerCase();
          bValue = b.product_name.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return this.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredPromotions = filtered;
  }

  // Statistics calculation
  calculateStats(): void {
    this.promotionStats = this.promotionService.calculatePromotionStats(this.promotions);
  }

  // Event handlers
  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.applyFilters();
  }

  // Promotion generation
  openGenerateModal(): void {
    this.showGenerateModal = true;
    this.selectedCategoryId = null;
  }

  closeGenerateModal(): void {
    this.showGenerateModal = false;
    this.selectedCategoryId = null;
  }

  generatePromotions(): void {
    if (!this.selectedCategoryId) return;

    this.generating = true;
    this.promotionService.generatePromotions(this.selectedCategoryId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          console.log('Promotions generated:', result);
          this.generating = false;
          this.closeGenerateModal();
          this.loadPromotions(); // Refresh the list
        },
        error: (error) => {
          console.error('Error generating promotions:', error);
          this.generating = false;
        }
      });
  }

  // Category analysis
  analyzeCategory(categoryId: number): void {
    this.analyzingCategory = true;
    this.promotionService.analyzeCategory(categoryId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (analysis) => {
          this.analysisData = analysis;
          this.showAnalysisModal = true;
          this.analyzingCategory = false;
        },
        error: (error) => {
          console.error('Error analyzing category:', error);
          this.analyzingCategory = false;
        }
      });
  }

  closeAnalysisModal(): void {
    this.showAnalysisModal = false;
    this.analysisData = [];
  }

  // Utility methods
  getPromotionCardClass(promotion: Promotion): string {
    return this.promotionService.getPromotionCardColor(promotion.discount_percentage);
  }

  formatCurrency(amount: string | number): string {
    return this.promotionService.formatCurrency(amount);
  }

  formatPercentage(percentage: string): string {
    return this.promotionService.formatPercentage(percentage);
  }

  isPromotionExpired(endDate: string): boolean {
    return new Date(endDate) <= new Date();
  }

  getDaysRemaining(endDate: string): number {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  refreshData(): void {
    this.loadPromotions();
    this.loadCategories();
  }

  // TrackBy function for better performance
  trackByPromotionId(index: number, promotion: Promotion): any {
    return promotion.id || promotion.code_article;
  }
}
