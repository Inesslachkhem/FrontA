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
    console.log('📚 loadPromotions() appelé - loading mis à true');
    console.trace('🔍 Trace de l\'appel loadPromotions:'); // Affiche la pile d'appels
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

    const formValues = this.aiGenerationForm.value;
    if (!formValues.start_date) {
      this.showToastMessage('❌ Veuillez renseigner la date de début', 'error');
      return;
    }

    // Calculate end date based on duration
    const startDate = new Date(formValues.start_date);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + (formValues.duration_days || 30));

    this.aiLoading = true;
    console.log('🚀 Début génération IA - aiLoading set to true:', this.aiLoading);
    
    const requestData: AIPromotionGenerationRequest = {
      category_id: formValues.category_id,
      prediction_method: formValues.prediction_method,
      start_date: formValues.start_date,
      end_date: endDate.toISOString().split('T')[0] // Format YYYY-MM-DD
    };

    this.promotionService.generateAIPromotions(requestData).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        console.log('📥 Réponse reçue, avant reset aiLoading:', this.aiLoading);
        this.aiLoading = false;
        this.loading = false; // 🔧 CORRECTION: Force loading à false aussi
        console.log('🔄 aiLoading et loading reset to false:', { aiLoading: this.aiLoading, loading: this.loading });
        this.cdr.detectChanges(); // Force change detection
        console.log('🔄 Change detection triggered');
        
        if (response.success && response.data) {
          this.aiPromotions = response.data.promotions;
          this.showAIResultsModal = true;
          console.log('✅ Promotions assignées:', this.aiPromotions.length);
          this.showToastMessage(`🤖 ${response.data.promotions.length} promotions IA générées (${formValues.duration_days} jours)`, 'success');
          this.closeAIModal();
          
          // Debug: Log pour vérifier l'état des variables
          console.log('✅ État final après génération réussie:', {
            aiPromotions: this.aiPromotions.length,
            loading: this.loading,
            aiLoading: this.aiLoading,
            showAIResultsModal: this.showAIResultsModal,
            buttonShouldBeDisabled: this.loading || this.aiLoading || !this.aiPromotions.length
          });
          
          // Vérification automatique si le bouton devrait être activé
          this.checkButtonState('après génération réussie');
        } else {
          this.showToastMessage('❌ Erreur lors de la génération IA', 'error');
        }
      },
      error: (error) => {
        this.aiLoading = false;
        this.loading = false; // 🔧 CORRECTION: Force loading à false aussi
        this.cdr.detectChanges(); // Force change detection
        console.log('🔄 aiLoading et loading reset to false after error:', { aiLoading: this.aiLoading, loading: this.loading });
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
        this.cdr.detectChanges(); // Force change detection
        
        // Debug: Log pour vérifier l'état après erreur
        console.log('⚠️ Mode démo activé:', {
          aiPromotions: this.aiPromotions.length,
          loading: this.loading,
          aiLoading: this.aiLoading,
          showAIResultsModal: this.showAIResultsModal,
          buttonShouldBeDisabled: this.loading || this.aiLoading || !this.aiPromotions.length
        });
        
        // Vérification automatique en mode démo aussi
        this.checkButtonState('mode démo activé');
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

  // Méthode pour forcer la réinitialisation de l'état AI
  resetAIState(): void {
    this.aiLoading = false;
    this.loading = false;
    this.cdr.detectChanges();
    console.log('🔄 État AI forcé à reset:', {
      aiLoading: this.aiLoading,
      loading: this.loading,
      aiPromotions: this.aiPromotions.length
    });
  }

  // Méthode pour vérifier l'état du bouton et détecter les anomalies
  checkButtonState(context: string): void {
    const shouldBeDisabled = this.loading || this.aiLoading || !this.aiPromotions.length;
    const conditions = {
      loading: this.loading,
      aiLoading: this.aiLoading,
      hasPromotions: this.aiPromotions.length > 0,
      promotionsCount: this.aiPromotions.length
    };
    
    console.log(`🔍 Vérification bouton (${context}):`, {
      ...conditions,
      shouldBeDisabled,
      buttonCurrentlyDisabled: shouldBeDisabled
    });
    
    // Alerte si le bouton devrait être activé mais ne l'est pas
    if (!shouldBeDisabled) {
      console.log('✅ Bouton DEVRAIT être activé - toutes conditions OK');
      setTimeout(() => {
        const stillDisabled = this.loading || this.aiLoading || !this.aiPromotions.length;
        if (stillDisabled) {
          console.error('🚨 PROBLÈME: Bouton encore désactivé après 100ms');
          this.forceButtonActivation();
        }
      }, 100);
    } else {
      const reasons = [];
      if (this.loading) reasons.push('loading=true');
      if (this.aiLoading) reasons.push('aiLoading=true');
      if (!this.aiPromotions.length) reasons.push('aucune promotion');
      console.log('❌ Bouton désactivé car:', reasons.join(', '));
    }
  }

  // Méthode pour forcer l'activation du bouton en cas de problème
  forceButtonActivation(): void {
    console.log('🔧 Force activation du bouton...');
    const beforeState = { loading: this.loading, aiLoading: this.aiLoading };
    
    this.aiLoading = false;
    this.loading = false;
    this.cdr.detectChanges();
    
    const afterState = { loading: this.loading, aiLoading: this.aiLoading };
    const finalCheck = this.loading || this.aiLoading || !this.aiPromotions.length;
    
    console.log('🔧 Force activation - changements:', {
      avant: beforeState,
      après: afterState,
      promotions: this.aiPromotions.length,
      stillDisabled: finalCheck
    });
    
    if (!finalCheck) {
      console.log('✅ Bouton maintenant activé !');
    } else {
      console.log('❌ Bouton encore désactivé malgré force activation');
    }
  }

  // Méthode pour simuler une génération réussie (TEST)
  simulateSuccessfulGeneration(): void {
    console.log('🧪 Simulation de génération réussie...');
    
    // Simuler le processus complet
    this.aiLoading = true;
    console.log('1. aiLoading set to true:', this.aiLoading);
    
    setTimeout(() => {
      // Simuler des promotions générées
      this.aiPromotions = [
        {
          article_id: 999,
          article_name: 'Test Article',
          current_price: 100,
          promotional_price: 80,
          promotion_percentage: 20,
          current_stock: 10,
          prediction_method: 'ai',
          scores: { 
            stock_score: 8, 
            elasticity_score: 7, 
            sales_score: 6,
            promotion_score: 8,
            final_score: 7.25
          },
          impact: {
            current_monthly_sales_volume: 50,
            predicted_monthly_sales_volume: 80,
            volume_change_percentage: 60,
            current_monthly_revenue: 5000,
            predicted_monthly_revenue: 6400,
            revenue_change_percentage: 28,
            profit_change_percentage: 15
          },
          recommendation: 'Test promotion',
          risk_level: 'low',
          created_at: new Date().toISOString()
        }
      ];
      
      console.log('2. Promotions créées:', this.aiPromotions.length);
      
      // Reset aiLoading
      this.aiLoading = false;
      console.log('3. aiLoading set to false:', this.aiLoading);
      
      // Afficher le modal
      this.showAIResultsModal = true;
      console.log('4. Modal affiché:', this.showAIResultsModal);
      
      // Force change detection
      this.cdr.detectChanges();
      console.log('5. Change detection effectuée');
      
      // État final
      const finalState = {
        aiLoading: this.aiLoading,
        loading: this.loading,
        aiPromotions: this.aiPromotions.length,
        showAIResultsModal: this.showAIResultsModal,
        buttonDisabled: this.loading || this.aiLoading || !this.aiPromotions.length
      };
      
      console.log('✅ État final simulation:', finalState);
      
      // Vérification automatique
      this.checkButtonState('simulation terminée');
      
      alert('🧪 Simulation terminée!\nBouton désactivé: ' + finalState.buttonDisabled);
      
    }, 2000); // Simuler 2 secondes de traitement
  }
  forceEnableButton(): void {
    // Créer des promotions factices pour le test
    if (this.aiPromotions.length === 0) {
      this.aiPromotions = [
        {
          article_id: 999,
          article_name: 'Test Article',
          current_price: 100,
          promotional_price: 80,
          promotion_percentage: 20,
          current_stock: 10,
          prediction_method: 'ai',
          scores: { 
            stock_score: 8, 
            elasticity_score: 7, 
            sales_score: 6,
            promotion_score: 8,
            final_score: 7.25
          },
          impact: {
            current_monthly_sales_volume: 50,
            predicted_monthly_sales_volume: 80,
            volume_change_percentage: 60,
            current_monthly_revenue: 5000,
            predicted_monthly_revenue: 6400,
            revenue_change_percentage: 28,
            profit_change_percentage: 15
          },
          recommendation: 'Test promotion',
          risk_level: 'low',
          created_at: new Date().toISOString()
        }
      ];
    }
    this.aiLoading = false;
    this.loading = false;
    this.showAIResultsModal = true;
    this.cdr.detectChanges();
    
    console.log('🧪 Bouton forcé activé pour test:', {
      aiLoading: this.aiLoading,
      loading: this.loading,
      aiPromotions: this.aiPromotions.length,
      showAIResultsModal: this.showAIResultsModal
    });
    
    alert('🧪 Bouton forcé activé pour test!\naiPromotions.length: ' + this.aiPromotions.length);
  }

  debugButtonState(): void {
    const state = {
      aiPromotions: this.aiPromotions.length,
      loading: this.loading,
      aiLoading: this.aiLoading,
      showAIResultsModal: this.showAIResultsModal,
      buttonDisabled: this.loading || this.aiLoading || !this.aiPromotions.length,
      conditions: {
        'loading': this.loading,
        'aiLoading': this.aiLoading,
        'no aiPromotions': !this.aiPromotions.length
      }
    };
    
    console.log('🔍 État du bouton Sauvegarder:', state);
    console.log('🔍 Promotions IA détails:', this.aiPromotions);
    
    // Analyse chaque condition individuellement
    let disabledReasons = [];
    if (this.loading) disabledReasons.push('💾 Loading en cours');
    if (this.aiLoading) disabledReasons.push('🤖 AI Loading en cours');
    if (!this.aiPromotions.length) disabledReasons.push('❌ Aucune promotion IA générée (aiPromotions.length = 0)');
    
    const message = disabledReasons.length > 0 
      ? `❌ Bouton désactivé car:\n${disabledReasons.join('\n')}`
      : '✅ Bouton devrait être activé';
    
    alert(`🔍 Debug État du Bouton:\n\n✅ Promotions: ${state.aiPromotions}\n🔄 Loading: ${state.loading}\n🤖 AI Loading: ${state.aiLoading}\n📱 Modal: ${state.showAIResultsModal}\n\n${message}`);
  }

  saveAIPromotionsToDatabase(): void {
    console.log('🔄 Tentative de sauvegarde - État des variables:', {
      aiPromotions: this.aiPromotions.length,
      loading: this.loading,
      aiLoading: this.aiLoading,
      showAIResultsModal: this.showAIResultsModal
    });

    if (!this.aiPromotions.length) {
      this.showToastMessage('❌ Aucune promotion à sauvegarder', 'warning');
      return;
    }

    const formValues = this.aiGenerationForm.value;
    if (!formValues.start_date) {
      this.showToastMessage('❌ Veuillez renseigner la date de début', 'error');
      return;
    }

    // Calculate end date based on duration
    const startDate = new Date(formValues.start_date);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + (formValues.duration_days || 30));

    console.log(`🔄 Début de sauvegarde de ${this.aiPromotions.length} promotions...`);
    console.log('📅 Période:', formValues.start_date, 'à', endDate.toISOString().split('T')[0]);
    
    this.loading = true;
    this.showToastMessage(`🔄 Sauvegarde de ${this.aiPromotions.length} promotions en cours...`, 'info');
    
    this.promotionService.saveAIPromotions(
      this.aiPromotions,
      formValues.start_date,
      endDate.toISOString().split('T')[0] // Format YYYY-MM-DD
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.loading = false;
        this.cdr.detectChanges(); // Force change detection
        console.log('✅ Réponse de sauvegarde:', response);
        if (response.success) {
          this.showToastMessage(`✅ ${response.count || 0} promotions sauvegardées avec succès (durée: ${formValues.duration_days} jours)`, 'success');
          this.showAIResultsModal = false;
          this.aiPromotions = [];
          this.loadPromotions(); // Recharger la liste des promotions
        } else {
          this.showToastMessage(`❌ Erreur: ${response.message || 'Erreur lors de la sauvegarde'}`, 'error');
        }
      },
      error: (error) => {
        this.loading = false;
        this.cdr.detectChanges(); // Force change detection
        console.error('❌ Erreur lors de la sauvegarde:', error);
        const errorMsg = error.error?.message || error.message || 'Erreur inconnue';
        this.showToastMessage(`❌ Erreur de sauvegarde: ${errorMsg}`, 'error');
      }
    });
  }
}
