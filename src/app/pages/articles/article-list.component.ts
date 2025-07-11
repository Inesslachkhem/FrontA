import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { OverlayModule } from '@angular/cdk/overlay';

import { ArticleService } from '../../services/article.service';
import { CategorieService } from '../../services/categorie.service';
import { ModalService } from '../../services/modal.service';
import { Article } from '../../models/article.model';
import { Categorie } from '../../models/categorie.model';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, OverlayModule],
  styles: [
    `
      /* Glassmorphism and Dark Theme */
      .glass-container {
        background: rgba(17, 25, 40, 0.7);
        backdrop-filter: blur(16px) saturate(180%);
        border: 1px solid rgba(255, 255, 255, 0.125);
        border-radius: 16px;
      }

      .glass-card {
        background: rgba(20, 30, 48, 0.8);
        backdrop-filter: blur(20px) saturate(150%);
        border: 1px solid rgba(59, 130, 246, 0.2);
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .glass-card:hover {
        border-color: rgba(59, 130, 246, 0.4);
        box-shadow: 0 16px 48px rgba(59, 130, 246, 0.1);
        transform: translateY(-2px);
      }

      .glass-input {
        background: rgba(30, 41, 59, 0.7);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(59, 130, 246, 0.2);
        border-radius: 8px;
        color: #e2e8f0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .glass-input:focus {
        border-color: rgba(59, 130, 246, 0.6);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        background: rgba(30, 41, 59, 0.9);
      }

      .glass-input::placeholder {
        color: #94a3b8;
      }

      .glass-button {
        background: linear-gradient(
          135deg,
          rgba(59, 130, 246, 0.8),
          rgba(37, 99, 235, 0.8)
        );
        backdrop-filter: blur(10px);
        border: 1px solid rgba(59, 130, 246, 0.3);
        border-radius: 8px;
        color: white;
        font-weight: 500;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
      }

      .glass-button:hover {
        background: linear-gradient(
          135deg,
          rgba(59, 130, 246, 1),
          rgba(37, 99, 235, 1)
        );
        box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
        transform: translateY(-1px);
      }

      .glass-button:active {
        transform: translateY(0);
      }

      .glass-button::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.2),
          transparent
        );
        transition: left 0.5s;
      }

      .glass-button:hover::before {
        left: 100%;
      }

      .glass-button-secondary {
        background: rgba(71, 85, 105, 0.7);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(148, 163, 184, 0.3);
        border-radius: 8px;
        color: #e2e8f0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .glass-button-secondary:hover {
        background: rgba(71, 85, 105, 0.9);
        border-color: rgba(148, 163, 184, 0.6);
        transform: translateY(-1px);
      }

      .glass-button-danger {
        background: linear-gradient(
          135deg,
          rgba(239, 68, 68, 0.8),
          rgba(220, 38, 38, 0.8)
        );
        backdrop-filter: blur(10px);
        border: 1px solid rgba(239, 68, 68, 0.3);
        border-radius: 8px;
        color: white;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .glass-button-danger:hover {
        background: linear-gradient(
          135deg,
          rgba(239, 68, 68, 1),
          rgba(220, 38, 38, 1)
        );
        box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
        transform: translateY(-1px);
      }

      .glass-button-success {
        background: linear-gradient(
          135deg,
          rgba(34, 197, 94, 0.8),
          rgba(22, 163, 74, 0.8)
        );
        backdrop-filter: blur(10px);
        border: 1px solid rgba(34, 197, 94, 0.3);
        border-radius: 8px;
        color: white;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .glass-button-success:hover {
        background: linear-gradient(
          135deg,
          rgba(34, 197, 94, 1),
          rgba(22, 163, 74, 1)
        );
        box-shadow: 0 8px 25px rgba(34, 197, 94, 0.4);
        transform: translateY(-1px);
      }

      /* Modal Animations */
      @keyframes modalBackdropFadeIn {
        0% {
          opacity: 0;
          backdrop-filter: blur(0px);
        }
        100% {
          opacity: 1;
          backdrop-filter: blur(16px);
        }
      }

      @keyframes modalSlideUp {
        0% {
          opacity: 0;
          transform: translateY(60px) scale(0.9);
          filter: blur(4px);
        }
        50% {
          opacity: 0.8;
          transform: translateY(20px) scale(0.95);
          filter: blur(2px);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0px);
        }
      }

      @keyframes modalSlideDown {
        0% {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0px);
        }
        100% {
          opacity: 0;
          transform: translateY(60px) scale(0.9);
          filter: blur(4px);
        }
      }

      .modal-content-wrapper.closing {
        animation: modalSlideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }

      /* Toast Notifications */
      .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
      }

      .toast {
        background: rgba(17, 25, 40, 0.95);
        backdrop-filter: blur(20px);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: white;
        padding: 16px 20px;
        margin-bottom: 12px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        animation: toastSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        position: relative;
        overflow: hidden;
      }

      .toast.toast-success {
        border-left: 4px solid #10b981;
        background: rgba(5, 46, 22, 0.95);
      }

      .toast.toast-error {
        border-left: 4px solid #ef4444;
        background: rgba(51, 10, 10, 0.95);
      }

      .toast.toast-info {
        border-left: 4px solid #3b82f6;
        background: rgba(7, 25, 51, 0.95);
      }

      .toast.closing {
        animation: toastSlideOut 0.3s ease-in forwards;
      }

      @keyframes toastSlideIn {
        0% {
          opacity: 0;
          transform: translateX(100%) scale(0.8);
        }
        100% {
          opacity: 1;
          transform: translateX(0) scale(1);
        }
      }

      @keyframes toastSlideOut {
        0% {
          opacity: 1;
          transform: translateX(0) scale(1);
        }
        100% {
          opacity: 0;
          transform: translateX(100%) scale(0.8);
        }
      }

      /* Table styles */
      .glass-table {
        background: rgba(20, 30, 48, 0.6);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(59, 130, 246, 0.2);
        border-radius: 12px;
        overflow: hidden;
      }

      .glass-table thead {
        background: rgba(30, 41, 59, 0.8);
        border-bottom: 1px solid rgba(59, 130, 246, 0.2);
      }

      .glass-table tbody tr {
        border-bottom: 1px solid rgba(59, 130, 246, 0.1);
        transition: all 0.2s ease;
      }

      .glass-table tbody tr:hover {
        background: rgba(59, 130, 246, 0.1);
        backdrop-filter: blur(20px);
      }

      .glass-table th {
        color: #e2e8f0;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-size: 0.75rem;
      }

      .glass-table td {
        color: #cbd5e1;
      }

      /* Loading and Empty states */
      .loading-spinner {
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      .empty-state {
        background: rgba(20, 30, 48, 0.6);
        backdrop-filter: blur(10px);
        border: 2px dashed rgba(59, 130, 246, 0.3);
        border-radius: 12px;
        color: #94a3b8;
        text-align: center;
        padding: 4rem 2rem;
      }

      /* Page background */
      .page-background {
        min-height: 100vh;
        background: linear-gradient(
          135deg,
          #0f172a 0%,
          #1e293b 50%,
          #334155 100%
        );
        position: relative;
      }

      .page-background::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(
            circle at 20% 20%,
            rgba(59, 130, 246, 0.1) 0%,
            transparent 50%
          ),
          radial-gradient(
            circle at 80% 80%,
            rgba(139, 92, 246, 0.1) 0%,
            transparent 50%
          ),
          radial-gradient(
            circle at 40% 60%,
            rgba(34, 197, 94, 0.05) 0%,
            transparent 50%
          );
        pointer-events: none;
      }

      /* Responsive improvements */
      @media (max-width: 768px) {
        .modal-content-wrapper > div {
          margin: 20px;
          max-width: calc(100vw - 40px);
        }

        .toast-container {
          left: 20px;
          right: 20px;
          max-width: none;
        }
      }
    `,
  ],
  template: `
    <div class="page-background">
      <div class="container mx-auto px-4 py-8">
        <!-- Header -->
        <div
          class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4"
        >
          <div>
            <h1 class="text-4xl font-bold text-white mb-2 font-['Poppins']">
              Articles
            </h1>
            <p class="text-slate-400">Gerez votre catalogue de produits</p>
          </div>
          <div class="flex gap-3">
            <button
              (click)="openImportModal()"
              class="glass-button-success px-6 py-3 text-sm font-medium rounded-xl flex items-center gap-2 shadow-lg"
            >
              <i class="fas fa-upload"></i>
              Importer CSV
            </button>
            <button
              (click)="openAddModal()"
              class="glass-button px-6 py-3 text-sm font-medium rounded-xl flex items-center gap-2 shadow-lg"
            >
              <i class="fas fa-plus"></i>
              Nouvel Article
            </button>
          </div>
        </div>

        <!-- Filters -->
        <div class="glass-card p-6 mb-8">
          <h3
            class="text-lg font-semibold text-white mb-4 flex items-center gap-2"
          >
            <i class="fas fa-filter text-blue-400"></i>
            Filtres
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">
                <i class="fas fa-search mr-2"></i>Rechercher
              </label>
              <input
                [(ngModel)]="searchTerm"
                (input)="filterArticles()"
                type="text"
                placeholder="Code, nom, code-barres..."
                class="glass-input w-full px-4 py-3 text-sm placeholder:text-slate-400"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">
                <i class="fas fa-folder mr-2"></i>Categorie
              </label>
              <select
                [(ngModel)]="selectedCategory"
                (change)="filterArticles()"
                class="glass-input w-full px-4 py-3 text-sm"
              >
                <option value="">Toutes les categories</option>
                <option
                  *ngFor="let category of categories"
                  [value]="category.idCategorie"
                >
                  {{ category.nom }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">
                <i class="fas fa-euro-sign mr-2"></i>Prix minimum
              </label>
              <input
                [(ngModel)]="minPrice"
                (input)="filterArticles()"
                type="number"
                step="0.01"
                placeholder="0.00"
                class="glass-input w-full px-4 py-3 text-sm placeholder:text-slate-400"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-300 mb-2">
                <i class="fas fa-euro-sign mr-2"></i>Prix maximum
              </label>
              <input
                [(ngModel)]="maxPrice"
                (input)="filterArticles()"
                type="number"
                step="0.01"
                placeholder="0.00"
                class="glass-input w-full px-4 py-3 text-sm placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        <!-- Articles Table -->
        <div class="glass-table">
          <!-- Loading State -->
          <div *ngIf="loading" class="p-8 text-center">
            <div
              class="loading-spinner w-8 h-8 border-3 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"
            ></div>
            <p class="text-slate-400">Chargement des articles...</p>
          </div>

          <!-- Empty State -->
          <div
            *ngIf="!loading && filteredArticles.length === 0"
            class="empty-state"
          >
            <i class="fas fa-box-open text-4xl mb-4 text-slate-500"></i>
            <h3 class="text-lg font-semibold text-slate-300 mb-2">
              Aucun article trouve
            </h3>
            <p class="text-slate-500 mb-4">
              {{
                searchTerm || selectedCategory || minPrice || maxPrice
                  ? 'Aucun article ne correspond aux criteres de recherche.'
                  : 'Commencez par ajouter des articles a votre catalogue.'
              }}
            </p>
            <button
              *ngIf="!searchTerm && !selectedCategory && !minPrice && !maxPrice"
              (click)="openAddModal()"
              class="glass-button px-6 py-3 text-sm font-medium rounded-xl"
            >
              <i class="fas fa-plus mr-2"></i>
              Ajouter le premier article
            </button>
          </div>

          <!-- Table Content -->
          <div
            *ngIf="!loading && filteredArticles.length > 0"
            class="overflow-x-auto"
          >
            <table class="min-w-full">
              <thead>
                <tr>
                  <th class="px-6 py-4 text-left">
                    <i class="fas fa-barcode mr-2"></i>Code
                  </th>
                  <th class="px-6 py-4 text-left">
                    <i class="fas fa-tag mr-2"></i>Produit
                  </th>
                  <th class="px-6 py-4 text-left">
                    <i class="fas fa-folder mr-2"></i>Categorie
                  </th>
                  <th class="px-6 py-4 text-left">
                    <i class="fas fa-euro-sign mr-2"></i>Prix de vente
                  </th>
                  <th class="px-6 py-4 text-left">
                    <i class="fas fa-truck mr-2"></i>Fournisseur
                  </th>
                  <th class="px-6 py-4 text-left">
                    <i class="fas fa-cog mr-2"></i>Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let article of paginatedArticles" class="group">
                  <td
                    class="px-6 py-4 font-mono text-sm font-medium text-white"
                  >
                    {{ article.codeArticle }}
                  </td>
                  <td class="px-6 py-4">
                    <div class="font-medium text-white">
                      {{ article.libelle }}
                    </div>
                    <div
                      class="text-sm text-slate-400 font-mono"
                      *ngIf="article.codeBarre"
                    >
                      {{ article.codeBarre }}
                    </div>
                  </td>
                  <td class="px-6 py-4 text-sm">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/50 text-blue-300 border border-blue-700/50"
                    >
                      {{ getCategoryName(article.idCategorie) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm font-semibold text-green-400">
                    {{
                      article.prix_Vente_TND
                        | currency : 'TND' : 'symbol' : '1.2-2' : 'fr'
                    }}
                  </td>
                  <td class="px-6 py-4 text-sm text-slate-300">
                    {{ article.fournisseur || '-' }}
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <button
                        (click)="editArticle(article)"
                        class="glass-button-secondary p-2 text-xs rounded-lg opacity-70 group-hover:opacity-100 transition-opacity"
                        title="Modifier"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                      <button
                        (click)="deleteArticle(article.id)"
                        class="glass-button-danger p-2 text-xs rounded-lg opacity-70 group-hover:opacity-100 transition-opacity"
                        title="Supprimer"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination -->
        <div
          *ngIf="!loading && filteredArticles.length > 0"
          class="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4"
        >
          <div class="text-sm text-slate-400">
            Affichage de {{ (currentPage - 1) * pageSize + 1 }} a
            {{ getEndIndex() }} sur {{ filteredArticles.length }} resultats
          </div>
          <div class="flex items-center gap-2">
            <button
              (click)="previousPage()"
              [disabled]="currentPage === 1"
              class="glass-button-secondary px-4 py-2 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i class="fas fa-chevron-left mr-2"></i>Precedent
            </button>
            <span
              class="px-4 py-2 text-sm text-slate-300 bg-slate-800/50 rounded-lg border border-slate-600"
            >
              Page {{ currentPage }} sur {{ totalPages }}
            </span>
            <button
              (click)="nextPage()"
              [disabled]="currentPage === totalPages"
              class="glass-button-secondary px-4 py-2 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant<i class="fas fa-chevron-right ml-2"></i>
            </button>
          </div>
        </div>

        <!-- Toast Notifications -->
        <div class="toast-container">
          <div
            *ngFor="let toast of toasts"
            class="toast"
            [class.toast-success]="toast.type === 'success'"
            [class.toast-error]="toast.type === 'error'"
            [class.toast-info]="toast.type === 'info'"
            [class.closing]="toast.closing"
          >
            <div class="flex items-start gap-3">
              <i
                class="fas"
                [class.fa-check-circle]="toast.type === 'success'"
                [class.fa-exclamation-circle]="toast.type === 'error'"
                [class.fa-info-circle]="toast.type === 'info'"
                [class.text-green-400]="toast.type === 'success'"
                [class.text-red-400]="toast.type === 'error'"
                [class.text-blue-400]="toast.type === 'info'"
              ></i>
              <div class="flex-1">
                <p class="font-medium text-sm">{{ toast.title }}</p>
                <p *ngIf="toast.message" class="text-xs opacity-90 mt-1">
                  {{ toast.message }}
                </p>
              </div>
              <button
                (click)="hideToast(toast)"
                class="text-white/70 hover:text-white transition-colors"
              >
                <i class="fas fa-times text-xs"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Modal Templates -->

        <!-- Add/Edit Modal Template -->
        <ng-template #addEditModalTemplate>
          <div class="modal-content-wrapper">
            <div
              class="relative w-full max-w-4xl mx-auto glass-card transform transition-all duration-300 ease-out"
              style="animation: modalSlideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)"
              [class.closing]="isClosingModal"
            >
              <!-- Modal Content -->
              <div class="p-8 space-y-6">
                <!-- Header -->
                <div
                  class="flex items-center justify-between pb-6 border-b border-slate-700"
                >
                  <div class="flex items-center space-x-4">
                    <!-- Icon -->
                    <div
                      class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center transform transition-transform duration-200 hover:scale-110"
                    >
                      <i
                        class="fas fa-plus text-white text-lg"
                        *ngIf="showAddModal"
                      ></i>
                      <i
                        class="fas fa-edit text-white text-lg"
                        *ngIf="showEditModal"
                      ></i>
                    </div>
                    <div>
                      <h3
                        class="text-2xl font-semibold text-white font-['Poppins']"
                      >
                        {{
                          showEditModal
                            ? "Modifier l'article"
                            : 'Nouvel article'
                        }}
                      </h3>
                      <p class="text-slate-400 text-sm">
                        {{
                          showEditModal
                            ? "Modifiez les informations de l'article"
                            : 'Ajoutez un nouvel article a votre catalogue'
                        }}
                      </p>
                    </div>
                  </div>
                  <button
                    (click)="closeModal()"
                    class="text-slate-400 hover:text-white transition-colors duration-200 p-2 hover:bg-slate-700 rounded-lg"
                  >
                    <i class="fas fa-times text-lg"></i>
                  </button>
                </div>

                <!-- Form -->
                <form (ngSubmit)="saveArticle()" class="space-y-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Code Article Field -->
                    <div class="space-y-2 form-field">
                      <label class="block text-sm font-medium text-slate-300">
                        <i class="fas fa-barcode mr-2 text-blue-400"></i>
                        Code Article *
                      </label>
                      <input
                        [(ngModel)]="currentArticle.codeArticle"
                        name="codeArticle"
                        type="text"
                        required
                        class="glass-input form-input w-full px-4 py-3 text-sm"
                        placeholder="ex: ART001"
                      />
                    </div>

                    <!-- Code Barre Field -->
                    <div class="space-y-2 form-field">
                      <label class="block text-sm font-medium text-slate-300">
                        <i class="fas fa-qrcode mr-2 text-blue-400"></i>
                        Code Barre
                      </label>
                      <input
                        [(ngModel)]="currentArticle.codeBarre"
                        name="codeBarre"
                        type="text"
                        class="glass-input form-input w-full px-4 py-3 text-sm"
                        placeholder="Code barre optionnel"
                      />
                    </div>

                    <!-- Libelle Field -->
                    <div class="md:col-span-2 space-y-2 form-field">
                      <label class="block text-sm font-medium text-slate-300">
                        <i class="fas fa-tag mr-2 text-blue-400"></i>
                        Libelle *
                      </label>
                      <input
                        [(ngModel)]="currentArticle.libelle"
                        name="libelle"
                        type="text"
                        required
                        class="glass-input form-input w-full px-4 py-3 text-sm"
                        placeholder="Nom du produit"
                      />
                    </div>

                    <!-- Prix Vente Field -->
                    <div class="space-y-2 form-field">
                      <label class="block text-sm font-medium text-slate-300">
                        <i class="fas fa-euro-sign mr-2 text-blue-400"></i>
                        Prix de vente (TND)
                      </label>
                      <input
                        [(ngModel)]="currentArticle.prix_Vente_TND"
                        name="prixVente"
                        type="number"
                        step="0.01"
                        class="glass-input form-input w-full px-4 py-3 text-sm"
                        placeholder="0.00"
                      />
                    </div>

                    <!-- Prix Achat Field -->
                    <div class="space-y-2 form-field">
                      <label class="block text-sm font-medium text-slate-300">
                        <i class="fas fa-shopping-cart mr-2 text-blue-400"></i>
                        Prix d'achat (TND)
                      </label>
                      <input
                        [(ngModel)]="currentArticle.prix_Achat_TND"
                        name="prixAchat"
                        type="number"
                        step="0.01"
                        class="glass-input form-input w-full px-4 py-3 text-sm"
                        placeholder="0.00"
                      />
                    </div>

                    <!-- Fournisseur Field -->
                    <div class="space-y-2 form-field">
                      <label class="block text-sm font-medium text-slate-300">
                        <i class="fas fa-truck mr-2 text-blue-400"></i>
                        Fournisseur
                      </label>
                      <input
                        [(ngModel)]="currentArticle.fournisseur"
                        name="fournisseur"
                        type="text"
                        class="glass-input form-input w-full px-4 py-3 text-sm"
                        placeholder="Nom du fournisseur"
                      />
                    </div>

                    <!-- Categorie Field -->
                    <div class="space-y-2 form-field">
                      <label class="block text-sm font-medium text-slate-300">
                        <i class="fas fa-folder mr-2 text-blue-400"></i>
                        Categorie
                      </label>
                      <select
                        [(ngModel)]="currentArticle.idCategorie"
                        name="idCategorie"
                        class="glass-input form-input w-full px-4 py-3 text-sm"
                      >
                        <option value="">Selectionner une categorie</option>
                        <option
                          *ngFor="let category of categories"
                          [value]="category.idCategorie"
                        >
                          {{ category.nom }}
                        </option>
                      </select>
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div
                    class="flex space-x-4 pt-6 border-t border-slate-700 form-field"
                  >
                    <button
                      type="button"
                      (click)="closeModal()"
                      class="glass-button-secondary btn-hover flex-1 py-3 px-6 rounded-xl font-medium"
                    >
                      <i class="fas fa-times mr-2"></i>
                      Annuler
                    </button>
                    <button
                      type="submit"
                      [disabled]="saving"
                      class="glass-button btn-hover flex-1 py-3 px-6 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
                    >
                      <span *ngIf="saving">
                        <i class="fas fa-spinner fa-spin mr-2"></i>
                        {{ showEditModal ? 'Mise a jour...' : 'Creation...' }}
                      </span>
                      <span *ngIf="!saving">
                        <i class="fas fa-save mr-2"></i>
                        {{ showEditModal ? 'Mettre a jour' : 'Creer' }}
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </ng-template>

        <!-- Import Modal Template -->
        <ng-template #importModalTemplate>
          <div class="modal-content-wrapper">
            <div
              class="relative w-full max-w-3xl mx-auto glass-card transform transition-all duration-300 ease-out"
              style="animation: modalSlideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)"
              [class.closing]="isClosingModal"
            >
              <div class="p-8">
                <div
                  class="flex items-center justify-between pb-6 border-b border-slate-700"
                >
                  <div class="flex items-center space-x-4">
                    <div
                      class="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center"
                    >
                      <i class="fas fa-upload text-white text-lg"></i>
                    </div>
                    <div>
                      <h3
                        class="text-2xl font-semibold text-white font-['Poppins']"
                      >
                        Importer des articles
                      </h3>
                      <p class="text-slate-400 text-sm">
                        Importer un fichier CSV avec vos articles
                      </p>
                    </div>
                  </div>
                  <button
                    (click)="closeImportModal()"
                    class="text-slate-400 hover:text-white transition-colors duration-200 p-2 hover:bg-slate-700 rounded-lg"
                  >
                    <i class="fas fa-times text-lg"></i>
                  </button>
                </div>

                <div class="space-y-6 mt-6">
                  <div>
                    <label
                      class="block text-sm font-medium text-slate-300 mb-3"
                    >
                      <i class="fas fa-file-csv mr-2 text-green-400"></i>
                      Selectionner un fichier CSV
                    </label>
                    <input
                      #fileInput
                      type="file"
                      accept=".csv"
                      (change)="onFileSelected($event)"
                      class="block w-full text-sm text-slate-300 glass-input cursor-pointer focus:outline-none file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:transition-colors"
                    />
                    <div class="mt-6 space-y-4">
                      <!-- Format Information -->
                      <div class="glass-card p-4 border-blue-500/20">
                        <p
                          class="font-medium text-blue-300 mb-2 flex items-center"
                        >
                          <i class="fas fa-info-circle mr-2"></i>
                          Format CSV requis (20 colonnes):
                        </p>
                        <div
                          class="text-xs bg-slate-900/50 p-3 rounded-lg border border-slate-600 text-slate-300 font-mono overflow-x-auto"
                        >
                          Id, CodeArticle, CodeBarre, Libelle, CodeDim1,
                          LibelleDim1, CodeDim2, LibelleDim2, Fournisseur,
                          FamilleNiv1, FamilleNiv2, FamilleNiv3, FamilleNiv4,
                          FamilleNiv5, FamilleNiv6, FamilleNiv7, FamilleNiv8,
                          Quantite_Achat, DateLibre, IdCategorie
                        </div>
                      </div>

                      <!-- Important Warning -->
                      <div
                        class="glass-card p-4 border-blue-500/20 bg-blue-900/20"
                      >
                        <p
                          class="font-medium text-blue-300 flex items-center mb-2"
                        >
                          <i class="fas fa-info-circle mr-2"></i>
                          IMPORTANT
                        </p>
                        <p class="text-sm text-blue-200">
                          Les categories doivent etre importees en premier !
                        </p>
                      </div>

                      <!-- Danger Warning -->
                      <div
                        class="glass-card p-4 border-red-500/20 bg-red-900/20"
                      >
                        <p
                          class="font-medium text-red-300 flex items-center mb-2"
                        >
                          <i class="fas fa-exclamation-triangle mr-2"></i>
                          ATTENTION
                        </p>
                        <div class="text-sm text-red-200 space-y-1">
                          <p>Ceci remplacera TOUTES les donnees d'articles !</p>
                          <p>
                            Tous les articles, stocks et ventes existants seront
                            supprimes.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    *ngIf="selectedFile"
                    class="text-sm glass-card p-4 border-green-500/20 bg-green-900/20"
                  >
                    <div class="flex items-center text-green-300">
                      <i class="fas fa-file-check mr-2"></i>
                      <strong>Fichier selectionne :</strong>
                    </div>
                    <p class="text-green-200 mt-1">
                      {{ selectedFile.name }}
                      <span class="text-green-400 ml-2">
                        ({{ (selectedFile.size / 1024).toFixed(2) }} KB)
                      </span>
                    </p>
                  </div>

                  <!-- Action Buttons -->
                  <div
                    class="flex flex-wrap gap-3 pt-6 border-t border-slate-700"
                  >
                    <button
                      (click)="checkCategories()"
                      class="glass-button-secondary px-4 py-2 text-sm rounded-lg"
                    >
                      <i class="fas fa-check mr-2"></i>
                      Verifier Categories
                    </button>
                    <button
                      (click)="testCsvFormat()"
                      [disabled]="!selectedFile"
                      class="glass-button-secondary px-4 py-2 text-sm rounded-lg disabled:opacity-50"
                    >
                      <i class="fas fa-vial mr-2"></i>
                      Test CSV
                    </button>
                    <div class="flex-1"></div>
                    <button
                      (click)="closeImportModal()"
                      class="glass-button-secondary px-6 py-2 rounded-lg font-medium"
                    >
                      Annuler
                    </button>
                    <button
                      (click)="importArticles()"
                      [disabled]="!selectedFile || importing"
                      class="glass-button-success px-6 py-2 rounded-lg font-medium disabled:opacity-50 flex items-center"
                    >
                      <span *ngIf="importing">
                        <i class="fas fa-spinner fa-spin mr-2"></i>Import en
                        cours...
                      </span>
                      <span *ngIf="!importing">
                        <i class="fas fa-upload mr-2"></i>Importer
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ng-template>
      </div>
    </div>
  `,
})
export class ArticleListComponent implements OnInit {
  @ViewChild('addEditModalTemplate', { static: true })
  addEditModalTemplate!: TemplateRef<any>;
  @ViewChild('importModalTemplate', { static: true })
  importModalTemplate!: TemplateRef<any>;

  articles: Article[] = [];
  filteredArticles: Article[] = [];
  categories: Categorie[] = [];

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  // Filters
  searchTerm = '';
  selectedCategory = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;

  // Modals
  showAddModal = false;
  showEditModal = false;
  showImportModal = false;

  // Modal animation states
  isClosingModal = false;

  // Current article for add/edit
  currentArticle: Partial<Article> = {};

  // Import
  selectedFile: File | null = null;
  importing = false;

  // Loading states
  loading = false;
  saving = false;

  // Toast notifications
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'info';
    title: string;
    message?: string;
    closing?: boolean;
  }> = [];

  // Computed properties
  get paginatedArticles(): Article[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredArticles.slice(start, end);
  }

  // Helper methods
  getEndIndex(): number {
    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredArticles.length
    );
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find((c) => c.idCategorie === categoryId);
    return category ? category.nom : 'Sans categorie';
  }

  constructor(
    private articleService: ArticleService,
    private categorieService: CategorieService,
    private modalService: ModalService,
    private viewContainerRef: ViewContainerRef
  ) {}

  ngOnInit() {
    this.loadArticles();
    this.loadCategories();
  }

  loadArticles() {
    this.loading = true;
    this.articleService.getAll().subscribe({
      next: (articles) => {
        this.articles = articles;
        this.filterArticles();
        this.loading = false;
        this.showToast(
          'success',
          'Articles charges',
          `${articles.length} articles trouves`
        );
      },
      error: (error) => {
        console.error('Error loading articles:', error);
        this.loading = false;
        this.showToast(
          'error',
          'Erreur de chargement',
          'Impossible de charger les articles'
        );
      },
    });
  }

  loadCategories() {
    this.categorieService.getAll().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.showToast(
          'error',
          'Erreur de chargement',
          'Impossible de charger les categories'
        );
      },
    });
  }

  filterArticles() {
    let filtered = [...this.articles];

    // Search term filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (article) =>
          article.libelle.toLowerCase().includes(term) ||
          article.codeArticle.toLowerCase().includes(term) ||
          article.codeBarre.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(
        (article) => article.idCategorie === this.selectedCategory
      );
    }

    // Price range filter
    if (this.minPrice !== null) {
      filtered = filtered.filter(
        (article) => article.prix_Vente_TND >= this.minPrice!
      );
    }
    if (this.maxPrice !== null) {
      filtered = filtered.filter(
        (article) => article.prix_Vente_TND <= this.maxPrice!
      );
    }

    this.filteredArticles = filtered;
    this.totalPages = Math.ceil(this.filteredArticles.length / this.pageSize);
    this.currentPage = 1;
  }

  editArticle(article: Article) {
    this.currentArticle = { ...article };
    this.showEditModal = true;
    this.openAddEditModal();
  }

  openAddModal() {
    console.log('Opening add modal...');
    this.showAddModal = true;
    this.currentArticle = {};
    this.openAddEditModal();
  }

  openImportModal() {
    console.log('Opening import modal...');
    this.showImportModal = true;
    this.modalService.openModal(
      this.importModalTemplate,
      this.viewContainerRef
    );
  }

  openAddEditModal() {
    console.log('Opening add/edit modal template...');
    if (this.addEditModalTemplate) {
      this.modalService.openModal(
        this.addEditModalTemplate,
        this.viewContainerRef
      );
    } else {
      console.error('Add/Edit modal template not found!');
    }
  }

  deleteArticle(id: number) {
    const article = this.articles.find((a) => a.id === id);
    const articleName = article ? article.libelle : 'cet article';

    if (
      confirm(
        `Etes-vous sur de vouloir supprimer "${articleName}" ?\n\nCette action est irreversible.`
      )
    ) {
      this.articleService.delete(id).subscribe({
        next: () => {
          this.loadArticles();
          this.showToast(
            'success',
            'Article supprime',
            `"${articleName}" a ete supprime avec succes`
          );
        },
        error: (error) => {
          console.error('Error deleting article:', error);
          this.showToast(
            'error',
            'Erreur de suppression',
            "Impossible de supprimer l'article"
          );
        },
      });
    }
  }

  saveArticle() {
    if (!this.currentArticle.codeArticle || !this.currentArticle.libelle) {
      this.showToast(
        'error',
        'Champs requis',
        'Veuillez remplir tous les champs obligatoires'
      );
      return;
    }

    this.saving = true;

    if (this.showEditModal && this.currentArticle.id) {
      this.articleService
        .update(this.currentArticle.id, this.currentArticle as Article)
        .subscribe({
          next: () => {
            this.loadArticles();
            this.closeModal();
            this.showToast(
              'success',
              'Article modifie',
              "L'article a ete mis a jour avec succes"
            );
            this.saving = false;
          },
          error: (error) => {
            console.error('Error updating article:', error);
            this.showToast(
              'error',
              'Erreur de modification',
              "Impossible de modifier l'article"
            );
            this.saving = false;
          },
        });
    } else {
      this.articleService.create(this.currentArticle as Article).subscribe({
        next: () => {
          this.loadArticles();
          this.closeModal();
          this.showToast(
            'success',
            'Article cree',
            'Le nouvel article a ete ajoute avec succes'
          );
          this.saving = false;
        },
        error: (error) => {
          console.error('Error creating article:', error);
          this.showToast(
            'error',
            'Erreur de creation',
            "Impossible de creer l'article"
          );
          this.saving = false;
        },
      });
    }
  }

  closeModal() {
    this.isClosingModal = true;

    // Close the overlay modal
    this.modalService.closeModal();

    // Wait for animation to complete before hiding modal
    setTimeout(() => {
      this.showAddModal = false;
      this.showEditModal = false;
      this.currentArticle = {};
      this.isClosingModal = false;
    }, 300);
  }

  closeImportModal() {
    this.isClosingModal = true;

    // Close the overlay modal
    this.modalService.closeModal();

    // Wait for animation to complete before hiding modal
    setTimeout(() => {
      this.showImportModal = false;
      this.isClosingModal = false;
    }, 300);
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  importArticles() {
    if (!this.selectedFile) return;

    // Show warning confirmation
    const confirmed = confirm(
      `ATTENTION: REMPLACEMENT DES DONNEES D'ARTICLES !\n\nCette action va :\n- Supprimer TOUS les articles existants\n- Supprimer TOUS les stocks existants\n- Supprimer TOUTES les ventes existantes\n\nEt les remplacer par les donnees d'articles du fichier : ${this.selectedFile.name}\n\nLes categories resteront inchangees.\nCette action NE PEUT PAS etre annulee !\n\nEtes-vous absolument sur de vouloir continuer ?`
    );

    if (!confirmed) {
      return;
    }

    console.log('Starting article import for file:', this.selectedFile.name);
    console.log('File size:', this.selectedFile.size, 'bytes');
    console.log('File type:', this.selectedFile.type);

    this.importing = true;
    this.showToast(
      'info',
      'Import en cours',
      'Import des articles en cours...'
    );

    this.articleService.importArticles(this.selectedFile).subscribe({
      next: (response) => {
        console.log('Import successful:', response);
        this.importing = false;
        this.closeImportModal();
        this.loadArticles();
        this.showToast(
          'success',
          'Import reussi',
          'Les articles ont ete importes avec succes'
        );
      },
      error: (error) => {
        console.error('Import error:', error);
        this.importing = false;

        let errorMessage = "Erreur lors de l'import des articles";
        let detailedErrors: any[] = [];

        if (error.status === 400) {
          if (error.error.Details) {
            detailedErrors = error.error.Details;
            errorMessage = `Erreurs de validation CSV (${
              detailedErrors?.length || 0
            } problemes trouves)`;
            this.showToast('error', 'Erreurs de validation', errorMessage);
          } else if (error.error.MissingCategories) {
            const missingCats = error.error.MissingCategories;
            errorMessage = `Categories manquantes : ${
              missingCats?.join(', ') || 'Categories inconnues'
            }`;
            this.showToast('error', 'Categories manquantes', errorMessage);

            // Offer to auto-create the missing categories
            this.handleMissingCategories(missingCats);
          } else if (typeof error.error === 'string') {
            errorMessage = error.error;
            this.showToast('error', "Erreur d'import", errorMessage);
          } else {
            this.showToast('error', "Erreur d'import", errorMessage);
          }
        } else {
          this.showToast('error', "Erreur d'import", errorMessage);
        }
      },
    });
  }

  checkCategories() {
    this.articleService.getCategoriesCount().subscribe({
      next: (response) => {
        const count = response?.Count || 0;
        this.showToast(
          'info',
          'Verification des categories',
          `${count} categories trouvees dans la base de donnees`
        );
      },
      error: (error) => {
        console.error('Error checking categories:', error);
        this.showToast(
          'error',
          'Erreur de verification',
          'Impossible de verifier les categories'
        );
      },
    });
  }

  testCsvFormat() {
    if (!this.selectedFile) return;

    this.articleService.testCsvParsing(this.selectedFile).subscribe({
      next: (response) => {
        console.log('CSV test result:', response);
        const info = `Fichier : ${response.FileName || 'Inconnu'}\nTaille : ${
          response.FileSize || 'Inconnue'
        } bytes\n\nPremieres lignes :\n${
          response.FirstLines?.join('\n') || 'Aucune ligne disponible'
        }\n\nAnalyse de l'en-tete :\n${
          response.HeaderAnalysis || 'Aucune analyse disponible'
        }`;
        this.showToast('info', 'Test du format CSV', info);
      },
      error: (error) => {
        console.error('CSV test error:', error);
        this.showToast(
          'error',
          'Erreur de test CSV',
          'Impossible de tester le format CSV'
        );
      },
    });
  }

  handleMissingCategories(missingCategories: string[]): void {
    const autoCreate = confirm(
      `Categories manquantes detectees !\n\n${
        missingCategories?.join('\n') || 'Categories inconnues'
      }\n\nVoulez-vous les creer automatiquement ?\n\nCela creera les categories manquantes avec des valeurs par defaut.`
    );

    if (autoCreate) {
      this.articleService
        .autoCreateMissingCategories(missingCategories)
        .subscribe({
          next: (response) => {
            console.log('Categories auto-created:', response);
            this.showToast(
              'success',
              'Categories creees',
              `${response.Message}\n\nVous pouvez maintenant reessayer d'importer vos articles.`
            );
            this.loadCategories(); // Reload categories
          },
          error: (error) => {
            console.error('Error auto-creating categories:', error);
            this.showToast(
              'error',
              'Erreur de creation',
              'Impossible de creer les categories automatiquement'
            );
          },
        });
    }
  }

  showToast(
    type: 'success' | 'error' | 'info',
    title: string,
    message?: string
  ) {
    const id = Date.now().toString();
    const toast = { id, type, title, message, closing: false };
    this.toasts.push(toast);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.hideToast(toast);
    }, 5000);
  }

  hideToast(toast: any) {
    toast.closing = true;
    setTimeout(() => {
      const index = this.toasts.indexOf(toast);
      if (index > -1) {
        this.toasts.splice(index, 1);
      }
    }, 300);
  }

  // Pagination methods
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
}
