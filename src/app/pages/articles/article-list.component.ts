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
import { ConfirmationService } from '../../services/confirmation.service';
import { Article } from '../../models/article.model';
import { Categorie } from '../../models/categorie.model';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, OverlayModule],
  styles: [
    `
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

      .toast {
        animation: toastSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .toast.closing {
        animation: toastSlideOut 0.3s ease-in forwards;
      }

      /* Loading spinner */
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

      /* Form field animations */
      .form-field {
        animation: slideInFromBottom 0.4s ease-out;
      }

      .form-field:nth-child(1) {
        animation-delay: 0.1s;
      }
      .form-field:nth-child(2) {
        animation-delay: 0.2s;
      }
      .form-field:nth-child(3) {
        animation-delay: 0.3s;
      }
      .form-field:nth-child(4) {
        animation-delay: 0.4s;
      }

      @keyframes slideInFromBottom {
        0% {
          opacity: 0;
          transform: translateY(20px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
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
    <div
      class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-500"
    >
      <div class="container mx-auto px-4 py-8">
        <!-- Header -->
        <div
          class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4"
        >
          <div>
            <h1
              class="text-4xl font-bold text-gray-900 dark:text-white mb-2 font-['Poppins']"
            >
              Articles
            </h1>
            <p class="text-gray-600 dark:text-gray-400">
              Gérez votre catalogue de produits
            </p>
          </div>
          <div class="flex gap-3">
            <button
              (click)="openImportModal()"
              class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl flex items-center gap-2 shadow-lg transition-all duration-300"
            >
              <i class="fas fa-upload"></i>
              Importer CSV
            </button>
            <button
              (click)="openAddModal()"
              class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl flex items-center gap-2 shadow-lg transition-all duration-300"
            >
              <i class="fas fa-plus"></i>
              Nouvel Article
            </button>
          </div>
        </div>

        <!-- Filters -->
        <div
          class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 mb-8 shadow-sm"
        >
          <h3
            class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"
          >
            <i class="fas fa-filter text-blue-500 dark:text-blue-400"></i>
            Filtres
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                <i class="fas fa-search mr-2"></i>Rechercher
              </label>
              <input
                [(ngModel)]="searchTerm"
                (input)="filterArticles()"
                type="text"
                placeholder="Code, nom, code-barres..."
                class="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                <i class="fas fa-folder mr-2"></i>Catégorie
              </label>
              <select
                [(ngModel)]="selectedCategory"
                (change)="filterArticles()"
                class="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              >
                <option value="">Toutes les catégories</option>
                <option
                  *ngFor="let category of categories"
                  [value]="category.idCategorie"
                >
                  {{ category.nom }}
                </option>
              </select>
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                <i class="fas fa-euro-sign mr-2"></i>Prix minimum
              </label>
              <input
                [(ngModel)]="minPrice"
                (input)="filterArticles()"
                type="number"
                step="0.01"
                placeholder="0.00"
                class="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                <i class="fas fa-euro-sign mr-2"></i>Prix maximum
              </label>
              <input
                [(ngModel)]="maxPrice"
                (input)="filterArticles()"
                type="number"
                step="0.01"
                placeholder="0.00"
                class="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              />
            </div>
          </div>
        </div>

        <!-- Articles Table -->
        <div
          class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm"
        >
          <!-- Loading State -->
          <div *ngIf="loading" class="p-8 text-center">
            <div
              class="loading-spinner w-8 h-8 border-3 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full mx-auto mb-4"
            ></div>
            <p class="text-gray-500 dark:text-gray-400">
              Chargement des articles...
            </p>
          </div>

          <!-- Empty State -->
          <div
            *ngIf="!loading && filteredArticles.length === 0"
            class="text-center py-16 bg-gray-50 dark:bg-gray-700/50 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl m-4"
          >
            <i
              class="fas fa-box-open text-4xl mb-4 text-gray-400 dark:text-gray-500"
            ></i>
            <h3
              class="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2"
            >
              Aucun article trouvé
            </h3>
            <p class="text-gray-500 dark:text-gray-400 mb-4">
              {{
                searchTerm || selectedCategory || minPrice || maxPrice
                  ? 'Aucun article ne correspond aux critères de recherche.'
                  : 'Commencez par ajouter des articles à votre catalogue.'
              }}
            </p>
            <button
              *ngIf="!searchTerm && !selectedCategory && !minPrice && !maxPrice"
              (click)="openAddModal()"
              class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all duration-300"
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
              <thead
                class="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600"
              >
                <tr>
                  <th
                    class="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
                  >
                    <i class="fas fa-barcode mr-2"></i>Code
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
                  >
                    <i class="fas fa-tag mr-2"></i>Produit
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
                  >
                    <i class="fas fa-folder mr-2"></i>Catégorie
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
                  >
                    <i class="fas fa-euro-sign mr-2"></i>Prix de vente
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
                  >
                    <i class="fas fa-truck mr-2"></i>Fournisseur
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider"
                  >
                    <i class="fas fa-cog mr-2"></i>Actions
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
                <tr
                  *ngFor="let article of paginatedArticles"
                  class="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td
                    class="px-6 py-4 font-mono text-sm font-medium text-gray-800 dark:text-gray-200"
                  >
                    {{ article.codeArticle }}
                  </td>
                  <td class="px-6 py-4">
                    <div class="font-medium text-gray-800 dark:text-gray-200">
                      {{ article.libelle }}
                    </div>
                    <div
                      class="text-sm text-gray-600 dark:text-gray-400 font-mono"
                      *ngIf="article.codeBarre"
                    >
                      {{ article.codeBarre }}
                    </div>
                  </td>
                  <td class="px-6 py-4 text-sm">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700"
                    >
                      {{ getCategoryName(article.idCategorie) }}
                    </span>
                  </td>
                  <td
                    class="px-6 py-4 text-sm font-semibold text-green-600 dark:text-green-400"
                  >
                    {{
                      article.prix_Vente_TND
                        | currency : 'TND' : 'symbol' : '1.2-2' : 'fr'
                    }}
                  </td>
                  <td
                    class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400"
                  >
                    {{ article.fournisseur || '-' }}
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <button
                        (click)="editArticle(article)"
                        class="p-2 text-xs rounded-lg opacity-70 group-hover:opacity-100 transition-all bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                        title="Modifier"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                      <button
                        (click)="deleteArticle(article.id)"
                        class="p-2 text-xs rounded-lg opacity-70 group-hover:opacity-100 transition-all bg-red-600 hover:bg-red-700 text-white"
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
          <div class="text-sm text-gray-600 dark:text-gray-400">
            Affichage de {{ (currentPage - 1) * pageSize + 1 }} à
            {{ getEndIndex() }} sur {{ filteredArticles.length }} résultats
          </div>
          <div class="flex items-center gap-2">
            <button
              (click)="previousPage()"
              [disabled]="currentPage === 1"
              class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              <i class="fas fa-chevron-left mr-2"></i>Précédent
            </button>
            <span
              class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600"
            >
              Page {{ currentPage }} sur {{ totalPages }}
            </span>
            <button
              (click)="nextPage()"
              [disabled]="currentPage === totalPages"
              class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              Suivant<i class="fas fa-chevron-right ml-2"></i>
            </button>
          </div>
        </div>

        <!-- Toast Notifications -->
        <div class="fixed top-20 right-20 z-50 max-w-sm w-full space-y-3">
          <div
            *ngFor="let toast of toasts"
            class="toast bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4"
            [class.border-l-4]="true"
            [class.border-l-green-500]="toast.type === 'success'"
            [class.border-l-red-500]="toast.type === 'error'"
            [class.border-l-blue-500]="toast.type === 'info'"
            [class.closing]="toast.closing"
          >
            <div class="flex items-start gap-3">
              <i
                class="fas mt-0.5"
                [class.fa-check-circle]="toast.type === 'success'"
                [class.fa-exclamation-circle]="toast.type === 'error'"
                [class.fa-info-circle]="toast.type === 'info'"
                [class.text-green-500]="toast.type === 'success'"
                [class.text-red-500]="toast.type === 'error'"
                [class.text-blue-500]="toast.type === 'info'"
              ></i>
              <div class="flex-1">
                <p class="font-medium text-sm text-gray-900 dark:text-white">
                  {{ toast.title }}
                </p>
                <p
                  *ngIf="toast.message"
                  class="text-xs text-gray-600 dark:text-gray-400 mt-1"
                >
                  {{ toast.message }}
                </p>
              </div>
              <button
                (click)="hideToast(toast)"
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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
              class="relative w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl transform transition-all duration-300 ease-out"
              style="animation: modalSlideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)"
              [class.closing]="isClosingModal"
            >
              <!-- Modal Content -->
              <div class="p-8 space-y-6">
                <!-- Header -->
                <div
                  class="flex items-center justify-between pb-6 border-b border-gray-200 dark:border-gray-700"
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
                        class="text-2xl font-semibold text-gray-900 dark:text-white font-['Poppins']"
                      >
                        {{
                          showEditModal
                            ? "Modifier l'article"
                            : 'Nouvel article'
                        }}
                      </h3>
                      <p class="text-gray-600 dark:text-gray-400 text-sm">
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
                    class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <i class="fas fa-times text-lg"></i>
                  </button>
                </div>

                <!-- Form -->
                <form (ngSubmit)="saveArticle()" class="space-y-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Code Article Field -->
                    <div class="space-y-2 form-field">
                      <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        <i
                          class="fas fa-barcode mr-2 text-blue-500 dark:text-blue-400"
                        ></i>
                        Code Article *
                      </label>
                      <input
                        [(ngModel)]="currentArticle.codeArticle"
                        name="codeArticle"
                        type="text"
                        required
                        class="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        placeholder="ex: ART001"
                      />
                    </div>

                    <!-- Code Barre Field -->
                    <div class="space-y-2 form-field">
                      <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        <i
                          class="fas fa-qrcode mr-2 text-blue-500 dark:text-blue-400"
                        ></i>
                        Code Barre
                      </label>
                      <input
                        [(ngModel)]="currentArticle.codeBarre"
                        name="codeBarre"
                        type="text"
                        class="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        placeholder="Code barre optionnel"
                      />
                    </div>

                    <!-- Libelle Field -->
                    <div class="md:col-span-2 space-y-2 form-field">
                      <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        <i
                          class="fas fa-tag mr-2 text-blue-500 dark:text-blue-400"
                        ></i>
                        Libelle *
                      </label>
                      <input
                        [(ngModel)]="currentArticle.libelle"
                        name="libelle"
                        type="text"
                        required
                        class="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        placeholder="Nom du produit"
                      />
                    </div>

                    <!-- Prix Vente Field -->
                    <div class="space-y-2 form-field">
                      <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        <i
                          class="fas fa-euro-sign mr-2 text-blue-500 dark:text-blue-400"
                        ></i>
                        Prix de vente (TND)
                      </label>
                      <input
                        [(ngModel)]="currentArticle.prix_Vente_TND"
                        name="prixVente"
                        type="number"
                        step="0.01"
                        class="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        placeholder="0.00"
                      />
                    </div>

                    <!-- Prix Achat Field -->
                    <div class="space-y-2 form-field">
                      <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        <i
                          class="fas fa-shopping-cart mr-2 text-blue-500 dark:text-blue-400"
                        ></i>
                        Prix d'achat (TND)
                      </label>
                      <input
                        [(ngModel)]="currentArticle.prix_Achat_TND"
                        name="prixAchat"
                        type="number"
                        step="0.01"
                        class="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        placeholder="0.00"
                      />
                    </div>

                    <!-- Fournisseur Field -->
                    <div class="space-y-2 form-field">
                      <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        <i
                          class="fas fa-truck mr-2 text-blue-500 dark:text-blue-400"
                        ></i>
                        Fournisseur
                      </label>
                      <input
                        [(ngModel)]="currentArticle.fournisseur"
                        name="fournisseur"
                        type="text"
                        class="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        placeholder="Nom du fournisseur"
                      />
                    </div>

                    <!-- Categorie Field -->
                    <div class="space-y-2 form-field">
                      <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        <i
                          class="fas fa-folder mr-2 text-blue-500 dark:text-blue-400"
                        ></i>
                        Categorie
                      </label>
                      <select
                        [(ngModel)]="currentArticle.idCategorie"
                        name="idCategorie"
                        class="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
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
                    class="flex space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700 form-field"
                  >
                    <button
                      type="button"
                      (click)="closeModal()"
                      class="flex-1 py-3 px-6 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-300"
                    >
                      <i class="fas fa-times mr-2"></i>
                      Annuler
                    </button>
                    <button
                      type="submit"
                      [disabled]="saving"
                      class="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
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
              class="relative w-full max-w-3xl mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl transform transition-all duration-300 ease-out"
              style="animation: modalSlideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)"
              [class.closing]="isClosingModal"
            >
              <div class="p-8">
                <div
                  class="flex items-center justify-between pb-6 border-b border-gray-200 dark:border-gray-700"
                >
                  <div class="flex items-center space-x-4">
                    <div
                      class="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center"
                    >
                      <i class="fas fa-upload text-white text-lg"></i>
                    </div>
                    <div>
                      <h3
                        class="text-2xl font-semibold text-gray-900 dark:text-white font-['Poppins']"
                      >
                        Importer des articles
                      </h3>
                      <p class="text-gray-600 dark:text-gray-400 text-sm">
                        Importer un fichier CSV avec vos articles
                      </p>
                    </div>
                  </div>
                  <button
                    (click)="closeImportModal()"
                    class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <i class="fas fa-times text-lg"></i>
                  </button>
                </div>

                <div class="space-y-6 mt-6">
                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3"
                    >
                      <i
                        class="fas fa-file-csv mr-2 text-green-500 dark:text-green-400"
                      ></i>
                      Selectionner un fichier CSV
                    </label>
                    <input
                      #fileInput
                      type="file"
                      accept=".csv"
                      (change)="onFileSelected($event)"
                      class="block w-full text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer focus:outline-none file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:transition-colors"
                    />
                    <div class="mt-6 space-y-4">
                      <!-- Format Information -->
                      <div
                        class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4"
                      >
                        <p
                          class="font-medium text-blue-700 dark:text-blue-300 mb-2 flex items-center"
                        >
                          <i class="fas fa-info-circle mr-2"></i>
                          Format CSV requis (20 colonnes):
                        </p>
                        <div
                          class="text-xs bg-gray-100 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-mono overflow-x-auto"
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
                        class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4"
                      >
                        <p
                          class="font-medium text-blue-700 dark:text-blue-300 flex items-center mb-2"
                        >
                          <i class="fas fa-info-circle mr-2"></i>
                          IMPORTANT
                        </p>
                        <p class="text-sm text-blue-600 dark:text-blue-300">
                          Les categories doivent etre importees en premier !
                        </p>
                      </div>

                      <!-- Danger Warning -->
                      <div
                        class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4"
                      >
                        <p
                          class="font-medium text-red-700 dark:text-red-300 flex items-center mb-2"
                        >
                          <i class="fas fa-exclamation-triangle mr-2"></i>
                          ATTENTION
                        </p>
                        <div
                          class="text-sm text-red-600 dark:text-red-300 space-y-1"
                        >
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
                    class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4"
                  >
                    <div
                      class="flex items-center text-green-700 dark:text-green-300"
                    >
                      <i class="fas fa-file-check mr-2"></i>
                      <strong>Fichier selectionne :</strong>
                    </div>
                    <p class="text-green-600 dark:text-green-400 mt-1">
                      {{ selectedFile.name }}
                      <span class="text-green-500 dark:text-green-400 ml-2">
                        ({{ (selectedFile.size / 1024).toFixed(2) }} KB)
                      </span>
                    </p>
                  </div>

                  <!-- Action Buttons -->
                  <div
                    class="flex flex-wrap gap-3 pt-6 border-t border-gray-200 dark:border-gray-700"
                  >
                    <button
                      (click)="checkCategories()"
                      class="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-300"
                    >
                      <i class="fas fa-check mr-2"></i>
                      Verifier Categories
                    </button>
                    <button
                      (click)="testCsvFormat()"
                      [disabled]="!selectedFile"
                      class="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      <i class="fas fa-vial mr-2"></i>
                      Test CSV
                    </button>
                    <div class="flex-1"></div>
                    <button
                      (click)="closeImportModal()"
                      class="px-6 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-300"
                    >
                      Annuler
                    </button>
                    <button
                      (click)="importArticles()"
                      [disabled]="!selectedFile || importing"
                      class="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all duration-300"
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
    private viewContainerRef: ViewContainerRef,
    private confirmationService: ConfirmationService
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
    const articleName = article ? article.libelle : 'this article';

    this.confirmationService
      .confirmDelete(`"${articleName}"`)
      .subscribe((confirmed) => {
        if (confirmed) {
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

              let errorMessage = "Impossible de supprimer l'article";
              let errorTitle = 'Erreur de suppression';

              if (error.status === 400 && error.error?.details?.message) {
                // Handle foreign key constraint error
                errorTitle = 'Suppression impossible';
                errorMessage =
                  error.error.details.message +
                  ". Vous devez d'abord supprimer les données associées.";
              } else if (error.status === 404) {
                errorMessage = 'Article non trouvé';
              } else if (error.status === 500) {
                errorMessage = 'Erreur serveur lors de la suppression';
              } else if (error.error?.error) {
                errorMessage = error.error.error;
              }

              this.showToast('error', errorTitle, errorMessage);
            },
          });
        }
      });
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

    // Show warning confirmation using custom modal
    this.confirmationService
      .confirmDangerousAction(
        "ATTENTION: REMPLACEMENT DES DONNEES D'ARTICLES !",
        `Cette action va :

- Supprimer TOUS les articles existants
- Supprimer TOUS les stocks existants  
- Supprimer TOUTES les ventes existantes

Et les remplacer par les donnees d'articles du fichier : ${this.selectedFile.name}

Les categories resteront inchangees.
Cette action NE PEUT PAS etre annulee !

Etes-vous absolument sur de vouloir continuer ?`,
        'Oui, Remplacer Tout'
      )
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }

        console.log(
          'Starting article import for file:',
          this.selectedFile!.name
        );
        console.log('File size:', this.selectedFile!.size, 'bytes');
        console.log('File type:', this.selectedFile!.type);

        this.importing = true;
        this.showToast(
          'info',
          'Import en cours',
          'Import des articles en cours...'
        );

        this.articleService.importArticles(this.selectedFile!).subscribe({
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
    this.confirmationService
      .confirmAction(
        'Categories manquantes detectees !',
        `Les categories suivantes sont manquantes :

${missingCategories?.join('\n') || 'Categories inconnues'}

Voulez-vous les creer automatiquement ?

Cela creera les categories manquantes avec des valeurs par defaut.`,
        'Creer les categories'
      )
      .subscribe((autoCreate) => {
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
      });
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
