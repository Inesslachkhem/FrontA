import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Promotion, Article } from '../../models/article.model';
import { PromotionService } from '../../services/promotion.service';
import { ArticleService } from '../../services/article.service';

@Component({
  selector: 'app-promotion-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800">Promotions</h1>
        <button
          (click)="showAddModal = true"
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <i class="fas fa-plus mr-2"></i>Add Promotion
        </button>
      </div>

      <!-- Filter Tabs -->
      <div class="mb-6">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button
              *ngFor="let tab of tabs"
              (click)="activeTab = tab.key; loadPromotions()"
              [class]="
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
              "
            >
              {{ tab.label }}
              <span
                *ngIf="tab.count !== undefined"
                class="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs"
              >
                {{ tab.count }}
              </span>
            </button>
          </nav>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-md p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            [(ngModel)]="searchTerm"
            (input)="filterPromotions()"
            type="text"
            placeholder="Search by article code or name..."
            class="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            [(ngModel)]="minReduction"
            (input)="filterPromotions()"
            type="number"
            placeholder="Min Reduction %"
            class="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            [(ngModel)]="maxReduction"
            (input)="filterPromotions()"
            type="number"
            placeholder="Max Reduction %"
            class="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            [(ngModel)]="statusFilter"
            (change)="filterPromotions()"
            class="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="accepted">Accepted</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      <!-- Promotions Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          *ngFor="let promotion of filteredPromotions"
          class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          <!-- Status Badge -->
          <div class="relative">
            <div class="absolute top-2 right-2 z-10">
              <span
                [class]="getStatusClass(promotion)"
                class="px-2 py-1 rounded-full text-xs font-medium"
              >
                {{ getStatusText(promotion) }}
              </span>
            </div>

            <!-- Promotion Header -->
            <div
              class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4"
            >
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-bold text-lg">
                    {{ promotion.tauxReduction }}% OFF
                  </h3>
                  <p class="text-sm opacity-90">
                    {{ promotion.article?.libelle || 'Loading...' }}
                  </p>
                </div>
                <div class="text-right">
                  <div class="text-lg font-bold">
                    {{ promotion.prix_Vente_TND_Apres | currency : 'TND' }}
                  </div>
                  <div class="text-sm line-through opacity-75">
                    {{ promotion.prix_Vente_TND_Avant | currency : 'TND' }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Promotion Details -->
          <div class="p-4">
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Article Code:</span>
                <span class="font-medium">{{ promotion.codeArticle }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">End Date:</span>
                <span class="font-medium">{{
                  promotion.dateFin | date : 'shortDate'
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Created:</span>
                <span class="font-medium">{{
                  promotion.dateCreation | date : 'shortDate'
                }}</span>
              </div>
              <div *ngIf="promotion.approvedBy" class="flex justify-between">
                <span class="text-gray-600">Approved by:</span>
                <span class="font-medium">{{ promotion.approvedBy }}</span>
              </div>
            </div>
          </div>
          <!-- Actions -->
          <div class="px-4 py-3 bg-gray-50 flex justify-end items-center">
            <div *ngIf="!promotion.isAccepted" class="flex space-x-2">
              <button
                (click)="approvePromotion(promotion.id)"
                class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs"
              >
                Approve
              </button>
              <button
                (click)="rejectPromotion(promotion.id)"
                class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="filteredPromotions.length === 0" class="text-center py-12">
        <i class="fas fa-tags text-6xl text-gray-300 mb-4"></i>
        <h3 class="text-xl font-medium text-gray-600 mb-2">
          No promotions found
        </h3>
        <p class="text-gray-500">{{ getEmptyMessage() }}</p>
      </div>
      <!-- Add Modal -->
      <div
        *ngIf="showAddModal"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      >
        <div
          class="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white"
        >
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold">Add Promotion</h3>
            <button
              (click)="closeModal()"
              class="text-gray-400 hover:text-gray-600"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- AI Generation Toggle -->
          <div class="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div class="flex items-center">
              <input
                type="checkbox"
                id="useAI"
                [(ngModel)]="useAIGeneration"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                for="useAI"
                class="ml-2 block text-sm text-blue-900 font-medium"
              >
                <i class="fas fa-robot mr-2"></i>Use AI to Generate Optimal
                Promotion
              </label>
            </div>
            <p class="text-xs text-blue-700 mt-1">
              AI will analyze market data and predict the optimal discount rate
              and pricing.
            </p>
          </div>

          <form (ngSubmit)="savePromotion()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700"
                >Article *</label
              >
              <select
                [(ngModel)]="currentPromotion.codeArticle"
                name="codeArticle"
                required
                (change)="onArticleSelected()"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Article</option>
                <option
                  *ngFor="let article of articles"
                  [value]="article.codeArticle"
                >
                  {{ article.codeArticle }} - {{ article.libelle }} ({{
                    article.prix_Vente_TND | currency : 'TND'
                  }})
                </option>
              </select>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Current Price (TND)</label
                >
                <input
                  [(ngModel)]="currentPromotion.prix_Vente_TND_Avant"
                  name="prixAvant"
                  type="number"
                  step="0.01"
                  readonly
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Reduction % *</label
                >
                <input
                  [(ngModel)]="currentPromotion.tauxReduction"
                  name="tauxReduction"
                  type="number"
                  min="0"
                  max="100"
                  [required]="!useAIGeneration"
                  [readonly]="useAIGeneration"
                  [placeholder]="
                    useAIGeneration
                      ? 'AI will calculate optimal rate'
                      : 'Enter reduction percentage'
                  "
                  (input)="calculatePromotionPrice()"
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  [class.bg-gray-50]="useAIGeneration"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700"
                >New Price (TND)</label
              >
              <input
                [(ngModel)]="currentPromotion.prix_Vente_TND_Apres"
                name="prixApres"
                type="number"
                step="0.01"
                readonly
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700"
                >End Date *</label
              >
              <input
                [(ngModel)]="currentPromotion.dateFin"
                name="dateFin"
                type="datetime-local"
                required
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div class="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                (click)="closeModal()"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="aiGenerating"
                class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <span *ngIf="!aiGenerating">
                  <i *ngIf="useAIGeneration" class="fas fa-robot mr-2"></i>
                  {{ useAIGeneration ? 'Generate AI Promotion' : 'Create' }}
                </span>
                <span *ngIf="aiGenerating" class="flex items-center">
                  <i class="fas fa-spinner fa-spin mr-2"></i>
                  Generating AI Promotion...
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class PromotionListComponent implements OnInit {
  promotions: Promotion[] = [];
  filteredPromotions: Promotion[] = [];
  articles: Article[] = [];

  // Tabs
  activeTab = 'all';
  tabs = [
    { key: 'all', label: 'All', count: 0 },
    { key: 'active', label: 'Active', count: 0 },
    { key: 'expired', label: 'Expired', count: 0 },
    { key: 'upcoming', label: 'Upcoming', count: 0 },
  ];

  // Filters
  searchTerm = '';
  minReduction: number | null = null;
  maxReduction: number | null = null;
  statusFilter = ''; // Modals
  showAddModal = false;
  useAIGeneration = false;

  // Current promotion for add
  currentPromotion: Partial<Promotion> = {};
  aiGenerating = false;

  constructor(
    private promotionService: PromotionService,
    private articleService: ArticleService
  ) {}

  ngOnInit() {
    this.loadPromotions();
    this.loadArticles();
  }

  loadPromotions() {
    let observable;

    switch (this.activeTab) {
      case 'active':
        observable = this.promotionService.getActivePromotions();
        break;
      case 'expired':
        observable = this.promotionService.getExpiredPromotions();
        break;
      case 'upcoming':
        observable = this.promotionService.getUpcomingPromotions();
        break;
      default:
        observable = this.promotionService.getAll();
    }

    observable.subscribe({
      next: (promotions) => {
        this.promotions = promotions;
        this.filterPromotions();
        this.updateTabCounts();
      },
      error: (error) => {
        console.error('Error loading promotions:', error);
      },
    });
  }

  loadArticles() {
    this.articleService.getAll().subscribe({
      next: (articles) => {
        this.articles = articles;
      },
      error: (error) => {
        console.error('Error loading articles:', error);
      },
    });
  }

  updateTabCounts() {
    this.promotionService.getAll().subscribe((all) => {
      this.tabs.find((t) => t.key === 'all')!.count = all.length;
    });

    this.promotionService.getActivePromotions().subscribe((active) => {
      this.tabs.find((t) => t.key === 'active')!.count = active.length;
    });

    this.promotionService.getExpiredPromotions().subscribe((expired) => {
      this.tabs.find((t) => t.key === 'expired')!.count = expired.length;
    });

    this.promotionService.getUpcomingPromotions().subscribe((upcoming) => {
      this.tabs.find((t) => t.key === 'upcoming')!.count = upcoming.length;
    });
  }

  filterPromotions() {
    let filtered = [...this.promotions];

    // Search term filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (promotion) =>
          promotion.codeArticle.toLowerCase().includes(term) ||
          (promotion.article?.libelle &&
            promotion.article.libelle.toLowerCase().includes(term))
      );
    }

    // Reduction range filter
    if (this.minReduction !== null) {
      filtered = filtered.filter(
        (promotion) => promotion.tauxReduction >= this.minReduction!
      );
    }
    if (this.maxReduction !== null) {
      filtered = filtered.filter(
        (promotion) => promotion.tauxReduction <= this.maxReduction!
      );
    }

    // Status filter
    if (this.statusFilter) {
      if (this.statusFilter === 'accepted') {
        filtered = filtered.filter((promotion) => promotion.isAccepted);
      } else if (this.statusFilter === 'pending') {
        filtered = filtered.filter((promotion) => !promotion.isAccepted);
      }
    }

    this.filteredPromotions = filtered;
  }
  approvePromotion(id: number) {
    if (confirm('Are you sure you want to approve this promotion?')) {
      this.promotionService.approve(id, 'Admin User').subscribe({
        next: (response) => {
          console.log('Promotion approved successfully:', response);
          this.loadPromotions();
        },
        error: (error) => {
          console.error('Error approving promotion:', error);
          alert(
            'Failed to approve promotion: ' +
              (error.error?.message || error.message)
          );
        },
      });
    }
  }

  rejectPromotion(id: number) {
    if (
      confirm(
        'Are you sure you want to reject this promotion? This action cannot be undone.'
      )
    ) {
      this.promotionService.reject(id, 'Admin User').subscribe({
        next: (response) => {
          console.log('Promotion rejected successfully:', response);
          this.loadPromotions();
        },
        error: (error) => {
          console.error('Error rejecting promotion:', error);
          alert(
            'Failed to reject promotion: ' +
              (error.error?.message || error.message)
          );
        },
      });
    }
  }
  savePromotion() {
    if (this.useAIGeneration) {
      this.generateAIPromotion();
    } else {
      this.createManualPromotion();
    }
  }

  generateAIPromotion() {
    if (!this.currentPromotion.codeArticle || !this.currentPromotion.dateFin) {
      alert('Please select an article and end date for AI generation.');
      return;
    }

    this.aiGenerating = true;

    // Convert datetime-local to YYYY-MM-DD format
    const targetDate = this.currentPromotion.dateFin
      ? new Date(this.currentPromotion.dateFin).toISOString().split('T')[0]
      : '';

    this.promotionService
      .generateAIPromotion(
        this.currentPromotion.codeArticle!,
        targetDate,
        true // auto_save = true
      )
      .subscribe({
        next: (response) => {
          this.aiGenerating = false;
          if (response.status === 'success') {
            const prediction = response.data.prediction;

            // Show AI results to user
            alert(`AI Promotion Generated Successfully!
          
Article: ${response.data.article_info.libelle}
Recommended Discount: ${prediction.adjusted_promotion_pct}%
New Price: ${prediction.promoted_price_tnd} TND
Expected Volume Increase: ${prediction.volume_impact_pct}%
Expected Revenue Impact: ${prediction.revenue_impact_tnd} TND

Status: ${response.data.message}`);

            this.loadPromotions();
            this.closeModal();
          } else {
            alert('Error generating AI promotion: ' + response.message);
          }
        },
        error: (error) => {
          this.aiGenerating = false;
          console.error('Error generating AI promotion:', error);
          alert('Error generating AI promotion. Please try again.');
        },
      });
  }

  createManualPromotion() {
    this.currentPromotion.dateCreation = new Date();

    this.promotionService.create(this.currentPromotion as Promotion).subscribe({
      next: () => {
        this.loadPromotions();
        this.closeModal();
      },
      error: (error) => {
        console.error('Error creating promotion:', error);
      },
    });
  }
  closeModal() {
    this.showAddModal = false;
    this.useAIGeneration = false;
    this.aiGenerating = false;
    this.currentPromotion = {};
  }

  onArticleSelected() {
    const selectedArticle = this.articles.find(
      (a) => a.codeArticle === this.currentPromotion.codeArticle
    );
    if (selectedArticle) {
      this.currentPromotion.prix_Vente_TND_Avant =
        selectedArticle.prix_Vente_TND;
      this.calculatePromotionPrice();
    }
  }

  calculatePromotionPrice() {
    if (
      this.currentPromotion.prix_Vente_TND_Avant &&
      this.currentPromotion.tauxReduction
    ) {
      const reduction =
        (this.currentPromotion.prix_Vente_TND_Avant *
          this.currentPromotion.tauxReduction) /
        100;
      this.currentPromotion.prix_Vente_TND_Apres =
        this.currentPromotion.prix_Vente_TND_Avant - reduction;
    }
  }

  getStatusClass(promotion: Promotion): string {
    if (promotion.isAccepted) {
      return 'bg-green-100 text-green-800';
    }
    return 'bg-yellow-100 text-yellow-800';
  }

  getStatusText(promotion: Promotion): string {
    if (promotion.isAccepted) {
      return 'Approved';
    }
    return 'Pending';
  }

  getEmptyMessage(): string {
    switch (this.activeTab) {
      case 'active':
        return 'No active promotions at the moment.';
      case 'expired':
        return 'No expired promotions found.';
      case 'upcoming':
        return 'No upcoming promotions scheduled.';
      default:
        return 'Get started by creating your first promotion.';
    }
  }
}
