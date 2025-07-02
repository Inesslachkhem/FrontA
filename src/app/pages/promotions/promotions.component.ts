import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, Observable } from 'rxjs';
import { PromotionService } from '../../services/promotion.service';
import {
  PromotionAiService,
  PromotionCategory,
  PromotionRecommendation,
  PromotionGenerationResponse,
  CategoriesResponse,
} from '../../services/promotion-ai.service';
import {
  Promotion,
  PromotionStats,
  Category,
  PromotionAnalysis,
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
  styleUrls: ['./promotions.component.css'],
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
    projected_revenue_increase: 0,
  };

  // AI Categories and selected category
  aiCategories: PromotionCategory[] = [];
  selectedCategory: string = '';

  // AI Generation results
  promotionResults: PromotionGenerationResponse | null = null;
  showPromotionModal = false;

  // UI state
  loading = false;
  showGenerateModal = false;
  showAnalysisModal = false;
  showDetailsModal = false;
  showAIInsightsModal = false;
  selectedPromotion: Promotion | null = null;

  // Filters
  searchTerm = '';
  statusFilter = 'all';
  categoryFilter = 'all';
  sortBy = 'created_at';
  sortOrder: 'asc' | 'desc' = 'desc';

  // Generation
  selectedCategoryId: string | null = null;
  generating = false;
  startDate: string = new Date().toISOString().split('T')[0]; // Default to today

  // Analysis
  analysisData: PromotionAnalysis[] = [];
  analyzingCategory = false;

  // Filter options
  statusOptions: FilterOption[] = [
    { value: 'all', label: 'All Promotions' },
    { value: 'pending', label: 'Pending Approval' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'active', label: 'Active' },
    { value: 'expired', label: 'Expired' },
  ];

  sortOptions: FilterOption[] = [
    { value: 'created_at', label: 'Creation Date' },
    { value: 'end_date', label: 'End Date' },
    { value: 'discount_percentage', label: 'Discount %' },
    { value: 'product_name', label: 'Product Name' },
  ];

  constructor(
    private promotionService: PromotionService,
    private promotionAiService: PromotionAiService
  ) {}

  ngOnInit(): void {
    this.loadPromotions();
    this.loadCategories();
    this.loadAICategories();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // AI Methods
  loadAICategories(): void {
    this.promotionAiService
      .getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: CategoriesResponse) => {
          this.aiCategories = response.categories;
          if (this.aiCategories.length > 0) {
            this.selectedCategory = this.aiCategories[0].name;
          }
          console.log('AI service is available');
        },
        error: (error: any) => {
          console.warn('AI service unavailable:', error);
        },
      });
  }

  // Generate AI Promotions
  generateAIPromotions(): void {
    if (!this.selectedCategory || !this.startDate) {
      return;
    }

    this.generating = true;

    this.promotionAiService
      .generatePromotions(this.selectedCategory, this.startDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PromotionGenerationResponse) => {
          this.promotionResults = response;
          this.showPromotionModal = true;
          this.generating = false;
          this.closeGenerateModal();

          // Reload promotions to show any new ones
          this.loadPromotions();
        },
        error: (error: any) => {
          console.error('Error generating promotions:', error);
          this.generating = false;
        },
      });
  }

  // Close promotion modal
  closePromotionModal(): void {
    this.showPromotionModal = false;
    this.promotionResults = null;
  }

  // Category selection change
  onCategorySelect(category: string): void {
    this.selectedCategory = category;
  }

  // Data loading methods
  loadPromotions(): void {
    this.loading = true;

    // Choose the appropriate service method based on status filter
    let promotionObservable: Observable<Promotion[]>;

    switch (this.statusFilter) {
      case 'pending':
        promotionObservable = this.promotionService.getPendingPromotions();
        break;
      case 'approved':
        promotionObservable = this.promotionService.getApprovedPromotions();
        break;
      case 'rejected':
        promotionObservable = this.promotionService.getRejectedPromotions();
        break;
      case 'active':
        promotionObservable = this.promotionService.getOnlyActivePromotions();
        break;
      case 'expired':
        promotionObservable = this.promotionService.getExpiredPromotions();
        break;
      default:
        promotionObservable = this.promotionService.getActivePromotions();
        break;
    }

    promotionObservable.pipe(takeUntil(this.destroy$)).subscribe({
      next: (promotions: Promotion[]) => {
        this.promotions = promotions;
        this.applyFilters();
        this.calculateStats();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading promotions:', error);
        this.loading = false;
      },
    });
  }

  loadCategories(): void {
    this.promotionService
      .getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.categories = categories;
        },
        error: (error) => {
          console.error('Error loading categories:', error);
        },
      });
  }

  // Filter and sort methods
  applyFilters(): void {
    let filtered = [...this.promotions];

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (promo) =>
          (promo.product_name &&
            promo.product_name.toLowerCase().includes(term)) ||
          (promo.category_name &&
            promo.category_name.toLowerCase().includes(term)) ||
          (promo.code_article &&
            promo.code_article.toLowerCase().includes(term))
      );
    }

    // Status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter((promo) => promo.status === this.statusFilter);
    }

    // Category filter
    if (this.categoryFilter !== 'all') {
      filtered = filtered.filter(
        (promo) =>
          promo.category_name && promo.category_name === this.categoryFilter
      );
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
    this.promotionStats = this.promotionService.calculatePromotionStats(
      this.promotions
    );
  }

  // Event handlers
  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    // If status filter changed, reload promotions with new filter
    this.loadPromotions();
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
  }

  closeGenerateModal(): void {
    this.showGenerateModal = false;
    this.selectedCategoryId = null;
    // Reset to today's date when closing modal
    this.startDate = new Date().toISOString().split('T')[0];
  }

  // Generate promotions (fallback method - using AI if selectedCategory is available)
  generatePromotions(): void {
    if (this.selectedCategory) {
      // Use AI generation if category is selected from AI categories
      this.generateAIPromotions();
      return;
    }

    if (!this.selectedCategoryId) {
      return;
    }

    this.generating = true;

    // For backward compatibility, you could add a basic promotion generation here
    // For now, we'll just close the modal and suggest using AI
    console.log('Use AI generation for better results');
    this.generating = false;
    this.closeGenerateModal();
  }

  // Category selection change
  onCategoryChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedCategory = target.value;
  }

  // Category analysis
  analyzeCategory(categoryId: string): void {
    this.analyzingCategory = true;
    this.promotionService
      .analyzeCategory(categoryId)
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
        },
      });
  }

  closeAnalysisModal(): void {
    this.showAnalysisModal = false;
    this.analysisData = [];
  }

  // Details modal methods
  openDetailsModal(promotion: Promotion): void {
    this.selectedPromotion = promotion;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedPromotion = null;
  }

  // AI recommendations - This method was removed to avoid duplication
  // The async loadAIRecommendations method above handles AI recommendations

  toggleAIInsights(): void {
    this.showAIInsightsModal = !this.showAIInsightsModal;
  }

  closeAIInsightsModal(): void {
    this.showAIInsightsModal = false;
  }

  // Promotion approval/rejection methods
  approvePromotion(promotion: Promotion): void {
    if (!promotion.id) return;

    const confirmed = confirm(
      `Are you sure you want to approve the promotion for ${promotion.product_name}?`
    );
    if (!confirmed) return;

    this.promotionService.approvePromotion(promotion.id).subscribe({
      next: (response) => {
        console.log('Promotion approved:', response);
        this.showSuccessMessage(
          `Promotion for ${promotion.product_name} has been approved successfully.`
        );
        this.refreshData();
      },
      error: (error) => {
        console.error('Error approving promotion:', error);
        this.showErrorMessage('Failed to approve promotion. Please try again.');
      },
    });
  }

  rejectPromotion(promotion: Promotion): void {
    if (!promotion.id) return;

    const confirmed = confirm(
      `Are you sure you want to reject the promotion for ${promotion.product_name}?`
    );
    if (!confirmed) return;

    this.promotionService.rejectPromotion(promotion.id).subscribe({
      next: (response) => {
        console.log('Promotion rejected:', response);
        this.showSuccessMessage(
          `Promotion for ${promotion.product_name} has been rejected.`
        );
        this.refreshData();
      },
      error: (error) => {
        console.error('Error rejecting promotion:', error);
        this.showErrorMessage('Failed to reject promotion. Please try again.');
      },
    });
  }

  updatePromotionAcceptance(promotion: Promotion, isAccepted: boolean): void {
    if (!promotion.id) return;

    const action = isAccepted ? 'approve' : 'reject';
    const confirmed = confirm(
      `Are you sure you want to ${action} the promotion for ${promotion.product_name}?`
    );
    if (!confirmed) return;

    this.promotionService
      .updatePromotionAcceptance(promotion.id, isAccepted)
      .subscribe({
        next: (response) => {
          console.log(`Promotion ${action}d:`, response);
          this.showSuccessMessage(
            `Promotion for ${promotion.product_name} has been ${action}d successfully.`
          );
          this.refreshData();
        },
        error: (error) => {
          console.error(`Error ${action}ing promotion:`, error);
          this.showErrorMessage(
            `Failed to ${action} promotion. Please try again.`
          );
        },
      });
  }

  // Bulk approval/rejection methods
  bulkApprovePromotions(promotionIds: number[]): void {
    if (promotionIds.length === 0) return;

    const confirmed = confirm(
      `Are you sure you want to approve ${promotionIds.length} promotion(s)?`
    );
    if (!confirmed) return;

    this.promotionService.bulkApprovePromotions(promotionIds).subscribe({
      next: (response) => {
        console.log('Bulk approval response:', response);
        this.showSuccessMessage(
          `${response.updatedCount} promotions have been approved successfully.`
        );
        this.refreshData();
      },
      error: (error) => {
        console.error('Error in bulk approval:', error);
        this.showErrorMessage(
          'Failed to approve promotions. Please try again.'
        );
      },
    });
  }

  bulkRejectPromotions(promotionIds: number[]): void {
    if (promotionIds.length === 0) return;

    const confirmed = confirm(
      `Are you sure you want to reject ${promotionIds.length} promotion(s)?`
    );
    if (!confirmed) return;

    this.promotionService.bulkRejectPromotions(promotionIds).subscribe({
      next: (response) => {
        console.log('Bulk rejection response:', response);
        this.showSuccessMessage(
          `${response.updatedCount} promotions have been rejected successfully.`
        );
        this.refreshData();
      },
      error: (error) => {
        console.error('Error in bulk rejection:', error);
        this.showErrorMessage('Failed to reject promotions. Please try again.');
      },
    });
  }

  // Helper methods for status management
  isPendingPromotion(promotion: Promotion): boolean {
    return promotion.status === 'pending' || promotion.is_accepted === false;
  }

  isApprovedPromotion(promotion: Promotion): boolean {
    return promotion.is_accepted === true;
  }

  getRejectionDate(promotion: Promotion): string | null {
    if (promotion.is_accepted === false && promotion.date_approval) {
      return promotion.date_approval;
    }
    return null;
  }

  // Message display methods
  private showSuccessMessage(message: string): void {
    // You can implement a toast notification system here
    alert(message); // Temporary implementation
  }

  private showErrorMessage(message: string): void {
    // You can implement a toast notification system here
    alert(message); // Temporary implementation
  }

  // Utility methods
  getPromotionCardClass(promotion: Promotion): string {
    return this.promotionService.getPromotionCardColor(
      promotion.discount_percentage
    );
  }

  formatCurrency(amount: string | number): string {
    return this.promotionService.formatCurrency(amount);
  }

  formatPercentage(percentage: string): string {
    return this.promotionService.formatPercentage(percentage);
  }

  calculateSavings(
    priceBefore: string | number,
    priceAfter: string | number
  ): number {
    const before =
      typeof priceBefore === 'string' ? parseFloat(priceBefore) : priceBefore;
    const after =
      typeof priceAfter === 'string' ? parseFloat(priceAfter) : priceAfter;
    return before - after;
  }

  // Calculate savings amount
  calculateSavingsAmount(
    currentPrice: number,
    discountedPrice: number
  ): number {
    return currentPrice - discountedPrice;
  }

  // Calculate savings percentage (for display)
  calculateSavingsPercentage(
    currentPrice: number,
    discountedPrice: number
  ): number {
    if (currentPrice === 0) return 0;
    return ((currentPrice - discountedPrice) / currentPrice) * 100;
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

  // Utility method to get today's date
  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}
