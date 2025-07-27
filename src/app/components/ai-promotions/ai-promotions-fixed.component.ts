import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { PromotionService } from '../../services/promotion.service';
import { 
  Promotion, 
  PromotionUpdateRequest, 
  AIPromotionGenerationRequest 
} from '../../models/promotion-extended.model';
import { AIPromotion } from '../../models/promotion.model';

@Component({
  selector: 'app-ai-promotions',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule, TitleCasePipe],
  templateUrl: './ai-promotions-new.component.html',
  styleUrls: ['./ai-promotions-new.component.css']
})
export class AiPromotionsComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef;
  
  private destroy$ = new Subject<void>();
  private searchTimeout: any;
  
  // Data properties
  promotions: Promotion[] = [];
  filteredPromotions: Promotion[] = [];
  aiPromotions: AIPromotion[] = [];
  selectedPromotion: Promotion | null = null;
  categories: any[] = [];
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;
  
  // UI state
  loading = false;
  aiLoading = false;
  showAIModal = false;
  showDetailsModal = false;
  showEditModal = false;
  showDeleteModal = false;
  showAIResultsModal = false;
  
  // Filters
  statusFilter = 'all';
  searchTerm = '';
  
  // Forms
  editForm: FormGroup;
  aiGenerationForm: FormGroup;
  
  // Toast properties
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' | 'info' | 'warning' = 'info';
  
  // API Health
  flaskHealthy = false;
  dotnetHealthy = false;

  // Utility
  Math = Math;

  constructor(
    private promotionService: PromotionService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.editForm = this.fb.group({
      promotional_price: [''],
      start_date: [''],
      end_date: [''],
      description: [''],
      conditions: [''],
      max_usage: ['']
    });

    this.aiGenerationForm = this.fb.group({
      category_id: [''],
      prediction_method: ['ai'],
      start_date: [''],
      duration_days: [30] // Duration in days instead of end date
    });
  }

  ngOnInit(): void {
    this.checkAPIHealth();
    this.loadPromotions();
    this.loadCategories();
    this.setupSearchDebounce();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  setupSearchDebounce(): void {
    setTimeout(() => {
      if (this.searchInput) {
        this.searchInput.nativeElement.addEventListener('input', (event: any) => {
          this.searchTerm = event.target.value;
          this.debounceSearch();
        });
      }
    }, 100);
  }

  checkAPIHealth(): void {
    // Check Flask API health
    this.promotionService.checkFlaskHealth().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.flaskHealthy = true;
        this.showToastMessage('✅ API Flask connectée', 'success');
      },
      error: () => {
        this.flaskHealthy = false;
        this.showToastMessage('❌ API Flask non disponible', 'error');
      }
    });

    // Check .NET API health
    this.promotionService.checkDotNetHealth().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.dotnetHealthy = true;
        this.showToastMessage('✅ API .NET connectée', 'success');
      },
      error: () => {
        this.dotnetHealthy = false;
        this.showToastMessage('❌ API .NET non disponible', 'error');
      }
    });
  }

  debounceSearch(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadPromotions();
    }, 500);
  }

  loadCategories(): void {
    this.promotionService.getCategories().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des catégories:', error);
        this.showToastMessage('❌ Erreur lors du chargement des catégories', 'error');
      }
    });
  }

  loadPromotions(): void {
    this.loading = true;
    console.log('🔄 Chargement des promotions...');
    console.log('📊 Paramètres:', {
      page: this.currentPage,
      limit: this.itemsPerPage,
      status: this.statusFilter,
      search: this.searchTerm
    });
    
    this.promotionService.getPromotions(
      this.currentPage, 
      this.itemsPerPage, 
      this.statusFilter,
      this.searchTerm
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        console.log('📦 Réponse reçue:', response);
        this.promotions = response.promotions;
        this.filteredPromotions = [...this.promotions];
        this.totalItems = response.total;
        this.totalPages = response.totalPages;
        this.loading = false;
        
        console.log('✅ Promotions chargées:', {
          count: this.promotions.length,
          total: this.totalItems,
          pages: this.totalPages
        });
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des promotions:', error);
        this.loading = false;
        this.promotions = [];
        this.filteredPromotions = [];
        this.showToastMessage('❌ Erreur lors du chargement des promotions', 'error');
      }
    });
  }

  // Filtering methods
  onStatusFilterChange(): void {
    console.log('🔄 Changement de filtre statut:', this.statusFilter);
    this.currentPage = 1;
    this.loadPromotions();
  }

  // Clear all filters
  clearAllFilters(): void {
    this.statusFilter = 'all';
    this.searchTerm = '';
    if (this.searchInput) {
      this.searchInput.nativeElement.value = '';
    }
    this.currentPage = 1;
    this.loadPromotions();
    this.showToastMessage('🧹 Filtres réinitialisés', 'info');
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadPromotions();
    }
  }

  goToPrevious(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  goToNext(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  // Modal controls
  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedPromotion = null;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedPromotion = null;
    this.editForm.reset();
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedPromotion = null;
  }

  closeAIModal(): void {
    this.showAIModal = false;
    this.aiGenerationForm.reset();
  }

  closeAIResultsModal(): void {
    this.showAIResultsModal = false;
    this.aiPromotions = [];
  }

  // Action methods
  viewDetails(promotion: Promotion): void {
    this.selectedPromotion = promotion;
    this.showDetailsModal = true;
  }

  editPromotion(promotion: Promotion): void {
    this.selectedPromotion = promotion;
    this.editForm.patchValue({
      promotional_price: promotion.promotional_price,
      start_date: promotion.start_date,
      end_date: promotion.end_date,
      description: promotion.description,
      conditions: promotion.conditions,
      max_usage: promotion.max_usage
    });
    this.showEditModal = true;
  }

  confirmDelete(promotion: Promotion): void {
    this.selectedPromotion = promotion;
    this.showDeleteModal = true;
  }

  deletePromotion(): void {
    if (this.selectedPromotion) {
      const promotionId = this.selectedPromotion.id;
      this.promotionService.deletePromotion(promotionId).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.showToastMessage('✅ Promotion supprimée avec succès', 'success');
          this.loadPromotions();
          this.closeDeleteModal();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.showToastMessage('❌ Erreur lors de la suppression', 'error');
        }
      });
    }
  }

  saveEdit(): void {
    if (this.selectedPromotion && this.editForm.valid) {
      const updateRequest: PromotionUpdateRequest = {
        id: this.selectedPromotion.id,
        promotional_price: this.editForm.value.promotional_price,
        start_date: this.editForm.value.start_date,
        end_date: this.editForm.value.end_date,
        description: this.editForm.value.description,
        conditions: this.editForm.value.conditions,
        max_usage: this.editForm.value.max_usage
      };

      this.promotionService.updatePromotion(updateRequest).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: () => {
          this.showToastMessage('✅ Promotion mise à jour avec succès', 'success');
          this.loadPromotions();
          this.closeEditModal();
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour:', error);
          this.showToastMessage('❌ Erreur lors de la mise à jour', 'error');
        }
      });
    }
  }

  // AI Generation methods
  generateAIPromotions(): void {
    if (this.aiGenerationForm.valid) {
      this.aiLoading = true;
      const request: AIPromotionGenerationRequest = this.aiGenerationForm.value;
      
      this.promotionService.generateAIPromotions(request).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (promotions) => {
          this.aiPromotions = promotions;
          this.aiLoading = false;
          this.showAIModal = false;
          this.showAIResultsModal = true;
          this.showToastMessage(`🤖 ${promotions.length} promotions IA générées`, 'success');
        },
        error: (error) => {
          console.error('Erreur génération IA:', error);
          this.aiLoading = false;
          this.showToastMessage('❌ Erreur lors de la génération IA', 'error');
        }
      });
    }
  }

  approveAIPromotion(promotion: AIPromotion): void {
    this.promotionService.approveAIPromotion(promotion).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.showToastMessage('✅ Promotion IA approuvée', 'success');
        this.loadPromotions();
        // Remove from AI promotions list
        const index = this.aiPromotions.indexOf(promotion);
        if (index > -1) {
          this.aiPromotions.splice(index, 1);
        }
      },
      error: (error) => {
        console.error('Erreur approbation IA:', error);
        this.showToastMessage('❌ Erreur lors de l\'approbation', 'error');
      }
    });
  }

  rejectAIPromotion(promotion: AIPromotion): void {
    const index = this.aiPromotions.indexOf(promotion);
    if (index > -1) {
      this.aiPromotions.splice(index, 1);
      this.showToastMessage('❌ Promotion IA rejetée', 'info');
    }
  }

  // Utility methods
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'approved':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'approved':
      case 'active':
        return '✅';
      case 'pending':
        return '⏳';
      case 'rejected':
        return '❌';
      case 'expired':
        return '⏰';
      default:
        return '📋';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(amount);
  }

  calculateSavings(currentPrice: number, promotionalPrice: number): number {
    return currentPrice - promotionalPrice;
  }

  calculateDiscountPercentage(currentPrice: number, promotionalPrice: number): number {
    if (currentPrice === 0) return 0;
    return Math.round(((currentPrice - promotionalPrice) / currentPrice) * 100);
  }

  // Toast methods
  showToastMessage(message: string, type: 'success' | 'error' | 'info' | 'warning'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    
    setTimeout(() => {
      this.showToast = false;
    }, 5000);
  }

  closeToast(): void {
    this.showToast = false;
  }

  // Export functionality
  exportToCSV(): void {
    if (this.promotions.length === 0) {
      this.showToastMessage('❌ Aucune promotion à exporter', 'warning');
      return;
    }

    const csvHeaders = [
      'ID', 'Article', 'Catégorie', 'Prix actuel', 'Prix promotionnel', 
      '% Réduction', 'Date début', 'Date fin', 'Statut', 'Description'
    ];

    const csvData = this.promotions.map(p => [
      p.id,
      p.article_name,
      p.category_name,
      p.current_price,
      p.promotional_price,
      this.calculateDiscountPercentage(p.current_price, p.promotional_price),
      this.formatDate(p.start_date),
      this.formatDate(p.end_date),
      p.status,
      p.description || ''
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `promotions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    this.showToastMessage('📄 Export CSV téléchargé', 'success');
  }

  // Refresh data
  refreshData(): void {
    this.showToastMessage('🔄 Actualisation des données...', 'info');
    this.checkAPIHealth();
    this.loadPromotions();
    this.loadCategories();
  }
}
