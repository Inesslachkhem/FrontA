import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
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
    private fb: FormBuilder
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
      min_stock: [10],
      max_promotions: [20],
      prediction_method: ['ai'],
      start_date: [''],
      end_date: ['']
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
  }

  setupSearchDebounce(): void {
    setTimeout(() => {
      if (this.searchInput) {
        this.searchInput.nativeElement.addEventListener('input', (event: any) => {
          this.searchTerm = event.target.value;
          this.debounceSearch();
        });
      }
    });
  }

  loadCategories(): void {
    this.promotionService.getCategories().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.categories = response.categories;
          console.log('Categories loaded:', this.categories);
        }
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        // Fallback categories
        this.categories = [
          { id: 1, name: 'Électronique' },
          { id: 2, name: 'Vêtements' },
          { id: 3, name: 'Alimentation' }
        ];
      }
    });
  }

  debounceSearch(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadPromotions();
    }, 300);
  }

  checkAPIHealth(): void {
    this.promotionService.checkFlaskHealth().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.flaskHealthy = response.status === 'healthy';
        console.log('Flask API Status:', response);
      },
      error: () => this.flaskHealthy = false
    });

    this.promotionService.getPromotions(1, 1).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => this.dotnetHealthy = true,
      error: () => this.dotnetHealthy = false
    });
  }

  loadPromotions(): void {
    this.loading = true;
    
    this.promotionService.getPromotions(
      this.currentPage, 
      this.itemsPerPage, 
      this.statusFilter,
      this.searchTerm
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.promotions = response.promotions;
        this.totalItems = response.total;
        this.totalPages = response.totalPages;
        this.showToastMessage(`📋 ${response.promotions.length} promotions chargées`, 'info');
      },
      error: (error) => {
        console.error('Error loading promotions:', error);
        this.showToastMessage('❌ Erreur lors du chargement des promotions', 'error');
        this.loadMockData();
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  loadMockData(): void {
    this.promotions = [
      {
        id: 1,
        article_id: 101,
        article_name: 'Smartphone Samsung Galaxy',
        category_name: 'Electronics',
        current_price: 699.99,
        promotional_price: 599.99,
        promotion_percentage: 14.3,
        current_stock: 45,
        start_date: '2025-01-01',
        end_date: '2025-01-31',
        status: 'pending',
        created_at: '2025-01-15T10:30:00Z',
        updated_at: '2025-01-15T10:30:00Z',
        created_by: 'AI System',
        description: 'AI Generated promotion for high-demand product',
        max_usage: 100,
        current_usage: 0,
        is_ai_generated: true
      },
      {
        id: 2,
        article_id: 102,
        article_name: 'MacBook Pro 14"',
        category_name: 'Computers',
        current_price: 1999.99,
        promotional_price: 1799.99,
        promotion_percentage: 10.0,
        current_stock: 23,
        start_date: '2025-01-10',
        end_date: '2025-02-10',
        status: 'approved',
        created_at: '2025-01-10T14:20:00Z',
        updated_at: '2025-01-12T09:15:00Z',
        created_by: 'Admin User',
        description: 'Winter sale promotion',
        max_usage: 50,
        current_usage: 12,
        is_ai_generated: false
      },
      {
        id: 3,
        article_id: 103,
        article_name: 'PlayStation 5',
        category_name: 'Gaming',
        current_price: 499.99,
        promotional_price: 449.99,
        promotion_percentage: 10.0,
        current_stock: 15,
        start_date: '2025-01-20',
        end_date: '2025-02-20',
        status: 'rejected',
        created_at: '2025-01-18T16:45:00Z',
        updated_at: '2025-01-19T10:20:00Z',
        created_by: 'Manager',
        description: 'Gaming console promotion',
        max_usage: 30,
        current_usage: 0,
        is_ai_generated: false
      }
    ];
    this.totalItems = 3;
    this.totalPages = 1;
  }

  viewDetails(promotion: Promotion): void {
    this.selectedPromotion = promotion;
    this.showDetailsModal = true;
  }

  editPromotion(promotion: Promotion): void {
    this.selectedPromotion = promotion;
    this.editForm.patchValue({
      promotional_price: promotion.promotional_price,
      start_date: promotion.start_date.split('T')[0],
      end_date: promotion.end_date.split('T')[0],
      description: promotion.description,
      conditions: promotion.conditions,
      max_usage: promotion.max_usage
    });
    this.showEditModal = true;
  }

  deletePromotion(promotion: Promotion): void {
    this.selectedPromotion = promotion;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.selectedPromotion) return;
    
    this.promotionService.deletePromotion(this.selectedPromotion.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.showToastMessage(`🗑️ Promotion "${this.selectedPromotion!.article_name}" supprimée`, 'success');
        this.loadPromotions();
        this.closeDeleteModal();
      },
      error: (error) => {
        console.error('Error deleting promotion:', error);
        this.showToastMessage('❌ Erreur lors de la suppression', 'error');
        // Remove from local array for demo
        const index = this.promotions.findIndex(p => p.id === this.selectedPromotion!.id);
        if (index > -1) {
          this.promotions.splice(index, 1);
          this.showToastMessage(`🗑️ Promotion "${this.selectedPromotion!.article_name}" supprimée`, 'success');
        }
        this.closeDeleteModal();
      }
    });
  }

  approvePromotion(promotion: Promotion): void {
    this.promotionService.approvePromotion({
      id: promotion.id,
      status: 'approved'
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.showToastMessage(`✅ Promotion "${promotion.article_name}" approuvée`, 'success');
        this.loadPromotions();
      },
      error: (error) => {
        console.error('Error approving promotion:', error);
        // Update local data for demo
        promotion.status = 'approved';
        this.showToastMessage(`✅ Promotion "${promotion.article_name}" approuvée`, 'success');
      }
    });
  }

  rejectPromotion(promotion: Promotion): void {
    this.promotionService.rejectPromotion({
      id: promotion.id,
      status: 'rejected'
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.showToastMessage(`❌ Promotion "${promotion.article_name}" rejetée`, 'warning');
        this.loadPromotions();
      },
      error: (error) => {
        console.error('Error rejecting promotion:', error);
        // Update local data for demo
        promotion.status = 'rejected';
        this.showToastMessage(`❌ Promotion "${promotion.article_name}" rejetée`, 'warning');
      }
    });
  }

  saveEdit(): void {
    if (!this.selectedPromotion || this.editForm.invalid) return;
    
    const updateData: PromotionUpdateRequest = {
      id: this.selectedPromotion.id,
      ...this.editForm.value
    };

    this.promotionService.updatePromotion(updateData).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.showToastMessage(`💾 Promotion "${this.selectedPromotion!.article_name}" modifiée`, 'success');
        this.loadPromotions();
        this.closeEditModal();
      },
      error: (error) => {
        console.error('Error updating promotion:', error);
        this.showToastMessage('❌ Erreur lors de la modification', 'error');
      }
    });
  }

  generateAIPromotions(): void {
    if (!this.flaskHealthy) {
      this.showToastMessage('❌ API Flask non disponible', 'error');
      return;
    }

    this.aiLoading = true;
    const requestData: AIPromotionGenerationRequest = this.aiGenerationForm.value;

    this.promotionService.generateAIPromotions(requestData).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.aiPromotions = response.data.promotions;
          this.showAIResultsModal = true;
          this.showToastMessage(`🤖 ${response.data.promotions.length} promotions IA générées`, 'success');
          this.closeAIModal();
        } else {
          this.showToastMessage('❌ Erreur lors de la génération IA', 'error');
        }
      },
      error: (error) => {
        console.error('Error generating AI promotions:', error);
        // Mock AI promotions for demo
        this.aiPromotions = [
          {
            article_id: 104,
            article_name: 'iPhone 15 Pro',
            current_price: 1199.99,
            promotional_price: 1099.99,
            promotion_percentage: 8.3,
            current_stock: 35,
            prediction_method: 'ai',
            scores: {
              stock_score: 8.5,
              elasticity_score: 7.2,
              sales_score: 9.1,
              promotion_score: 8.8,
              final_score: 8.4
            },
            impact: {
              current_monthly_sales_volume: 25,
              predicted_monthly_sales_volume: 45,
              volume_change_percentage: 80.0,
              current_monthly_revenue: 29999.75,
              predicted_monthly_revenue: 49499.55,
              revenue_change_percentage: 65.0,
              profit_change_percentage: 45.0
            },
            recommendation: 'Excellent opportunity for revenue growth with minimal risk',
            risk_level: 'low',
            created_at: new Date().toISOString()
          }
        ];
        this.showAIResultsModal = true;
        this.showToastMessage(`🤖 1 promotion IA générée (mode démo)`, 'info');
        this.closeAIModal();
      },
      complete: () => {
        this.aiLoading = false;
      }
    });
  }

  convertAIPromotion(aiPromotion: AIPromotion): void {
    this.promotionService.convertAIToPromotion(aiPromotion).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.showToastMessage(`✨ Promotion IA convertie pour "${aiPromotion.article_name}"`, 'success');
        this.loadPromotions();
      },
      error: (error) => {
        console.error('Error converting AI promotion:', error);
        this.showToastMessage('❌ Erreur lors de la conversion', 'error');
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadPromotions();
    }
  }

  onStatusFilterChange(): void {
    this.currentPage = 1;
    this.loadPromotions();
  }

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
  }

  closeAIResultsModal(): void {
    this.showAIResultsModal = false;
    this.aiPromotions = [];
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'active': return 'text-blue-600 bg-blue-100';
      case 'expired': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  getRiskColor(risk: string): string {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('fr-FR');
  }

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

  trackByPromotion(index: number, promotion: Promotion): number {
    return promotion.id;
  }

  saveAIPromotionsToDatabase(): void {
    if (!this.aiPromotions.length) {
      this.showToastMessage('❌ Aucune promotion à sauvegarder', 'warning');
      return;
    }

    const formValues = this.aiGenerationForm.value;
    if (!formValues.start_date || !formValues.end_date) {
      this.showToastMessage('❌ Veuillez renseigner les dates de début et fin', 'error');
      return;
    }

    this.loading = true;
    
    this.promotionService.saveAIPromotions(
      this.aiPromotions,
      formValues.start_date,
      formValues.end_date
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.showToastMessage(`✅ ${response.count} promotions sauvegardées avec succès`, 'success');
          this.showAIResultsModal = false;
          this.aiPromotions = [];
          this.loadPromotions(); // Recharger la liste des promotions
        } else {
          this.showToastMessage('❌ Erreur lors de la sauvegarde', 'error');
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error saving promotions:', error);
        this.showToastMessage('❌ Erreur lors de la sauvegarde des promotions', 'error');
      }
    });
  }
}
