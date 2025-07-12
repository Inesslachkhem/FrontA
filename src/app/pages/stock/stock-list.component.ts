import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { OverlayModule } from '@angular/cdk/overlay';
import { Stock, Article } from '../../models/article.model';
import { StockService } from '../../services/stock.service';
import { ArticleService } from '../../services/article.service';
import { ModalService } from '../../services/modal.service';
import { ConfirmationService } from '../../services/confirmation.service';

@Component({
  selector: 'app-stock-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, OverlayModule],
  template: `
    <div
      class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800"
    >
      <div class="container mx-auto px-4 py-8">
        <!-- Header with glassmorphism effect -->
        <div
          class="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6 mb-8"
        >
          <div class="flex justify-between items-center">
            <div class="flex items-center space-x-4">
              <div
                class="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg"
              >
                <i class="fas fa-boxes text-white text-2xl"></i>
              </div>
              <div>
                <h1
                  class="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent font-poppins"
                >
                  Gestion des Stocks
                </h1>
                <p class="text-gray-600 dark:text-gray-400 font-medium">
                  Gérez vos inventaires et niveaux de stock
                </p>
              </div>
            </div>
            <div class="flex gap-4">
              <button
                (click)="openImportModal()"
                class="group relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium font-poppins transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg"
              >
                <div class="flex items-center">
                  <i class="fas fa-upload mr-2 group-hover:animate-bounce"></i>
                  Importer CSV
                </div>
                <div
                  class="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                ></div>
              </button>
              <button
                (click)="openAddModal()"
                class="group relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium font-poppins transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg"
              >
                <div class="flex items-center">
                  <i
                    class="fas fa-plus mr-2 group-hover:rotate-90 transition-transform duration-300"
                  ></i>
                  Ajouter Stock
                </div>
                <div
                  class="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                ></div>
              </button>
            </div>
          </div>
        </div>

        <!-- Filter Tabs with enhanced design -->
        <div class="mb-8">
          <div
            class="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6"
          >
            <div class="flex flex-wrap gap-2">
              <button
                (click)="activeTab = 'all'; filterStocks()"
                [class]="getTabClasses('all')"
                class="px-6 py-3 rounded-xl font-medium font-poppins transition-all duration-300 transform hover:scale-105"
              >
                <i class="fas fa-list mr-2"></i>
                Tous les Stocks
              </button>
              <button
                (click)="activeTab = 'low'; filterStocks()"
                [class]="getTabClasses('low')"
                class="px-6 py-3 rounded-xl font-medium font-poppins transition-all duration-300 transform hover:scale-105"
              >
                <i class="fas fa-exclamation-triangle mr-2"></i>
                Stock Faible
                <span
                  class="ml-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 py-1 px-3 rounded-full text-xs font-bold"
                >
                  {{ lowStockCount }}
                </span>
              </button>
              <button
                (click)="activeTab = 'out'; filterStocks()"
                [class]="getTabClasses('out')"
                class="px-6 py-3 rounded-xl font-medium font-poppins transition-all duration-300 transform hover:scale-105"
              >
                <i class="fas fa-times-circle mr-2"></i>
                Rupture de Stock
                <span
                  class="ml-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 py-1 px-3 rounded-full text-xs font-bold"
                >
                  {{ outOfStockCount }}
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- Filters with glassmorphism -->
        <div
          class="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6 mb-8"
        >
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <i class="fas fa-search text-gray-400 dark:text-gray-500"></i>
              </div>
              <input
                [(ngModel)]="searchTerm"
                (input)="filterStocks()"
                type="text"
                placeholder="Rechercher par code ou nom..."
                class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-poppins"
              />
            </div>

            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <i
                  class="fas fa-arrow-down text-gray-400 dark:text-gray-500"
                ></i>
              </div>
              <input
                [(ngModel)]="minQuantity"
                (input)="filterStocks()"
                type="number"
                placeholder="Quantité Min"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-poppins"
              />
            </div>

            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <i class="fas fa-arrow-up text-gray-400 dark:text-gray-500"></i>
              </div>
              <input
                [(ngModel)]="maxQuantity"
                (input)="filterStocks()"
                type="number"
                placeholder="Quantité Max"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-poppins"
              />
            </div>

            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <i
                  class="fas fa-dollar-sign text-gray-400 dark:text-gray-500"
                ></i>
              </div>
              <input
                [(ngModel)]="minValue"
                (input)="filterStocks()"
                type="number"
                placeholder="Valeur Min (TND)"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 font-poppins"
              />
            </div>
          </div>
        </div>

        <!-- Summary Cards with enhanced design -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div
            class="group relative backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div class="flex items-center">
              <div
                class="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300"
              >
                <i class="fas fa-boxes text-white text-2xl"></i>
              </div>
              <div class="ml-4">
                <p
                  class="text-sm font-medium text-gray-600 dark:text-gray-400 font-poppins"
                >
                  Total Articles
                </p>
                <p
                  class="text-3xl font-bold text-gray-900 dark:text-white font-poppins"
                >
                  {{ getTotalItems() }}
                </p>
              </div>
            </div>
            <div
              class="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            ></div>
          </div>

          <div
            class="group relative backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div class="flex items-center">
              <div
                class="p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300"
              >
                <i class="fas fa-warehouse text-white text-2xl"></i>
              </div>
              <div class="ml-4">
                <p
                  class="text-sm font-medium text-gray-600 dark:text-gray-400 font-poppins"
                >
                  Quantité Totale
                </p>
                <p
                  class="text-3xl font-bold text-gray-900 dark:text-white font-poppins"
                >
                  {{ getTotalQuantity() }}
                </p>
              </div>
            </div>
            <div
              class="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            ></div>
          </div>

          <div
            class="group relative backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div class="flex items-center">
              <div
                class="p-4 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300"
              >
                <i class="fas fa-exclamation-triangle text-white text-2xl"></i>
              </div>
              <div class="ml-4">
                <p
                  class="text-sm font-medium text-gray-600 dark:text-gray-400 font-poppins"
                >
                  Stock Faible
                </p>
                <p
                  class="text-3xl font-bold text-yellow-600 dark:text-yellow-400 font-poppins"
                >
                  {{ lowStockCount }}
                </p>
              </div>
            </div>
            <div
              class="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            ></div>
          </div>

          <div
            class="group relative backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div class="flex items-center">
              <div
                class="p-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300"
              >
                <i class="fas fa-coins text-white text-2xl"></i>
              </div>
              <div class="ml-4">
                <p
                  class="text-sm font-medium text-gray-600 dark:text-gray-400 font-poppins"
                >
                  Valeur Totale
                </p>
                <p
                  class="text-3xl font-bold text-gray-900 dark:text-white font-poppins"
                >
                  {{ getTotalValue() | currency : 'TND' }}
                </p>
              </div>
            </div>
            <div
              class="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            ></div>
          </div>
        </div>

        <!-- Stock Table with enhanced dark mode design -->
        <div
          class="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl overflow-hidden"
        >
          <div class="overflow-x-auto">
            <table
              class="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
            >
              <thead
                class="bg-gradient-to-r from-slate-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
              >
                <tr>
                  <th
                    class="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider font-poppins"
                  >
                    <i class="fas fa-cube mr-2"></i>Article
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider font-poppins"
                  >
                    <i class="fas fa-boxes mr-2"></i>Quantité Physique
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider font-poppins"
                  >
                    <i class="fas fa-exclamation-triangle mr-2"></i>Stock Min
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider font-poppins"
                  >
                    <i class="fas fa-dollar-sign mr-2"></i>Valeur Stock
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider font-poppins"
                  >
                    <i class="fas fa-info-circle mr-2"></i>Statut
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider font-poppins"
                  >
                    <i class="fas fa-cogs mr-2"></i>Actions
                  </th>
                </tr>
              </thead>
              <tbody
                class="bg-white/50 dark:bg-gray-800/50 divide-y divide-gray-200 dark:divide-gray-700"
              >
                <tr
                  *ngFor="let stock of filteredStocks"
                  class="hover:bg-blue-50/70 dark:hover:bg-gray-700/70 transition-all duration-200 group"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div
                        class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-3 group-hover:scale-105 transition-transform duration-200"
                      >
                        <i
                          class="fas fa-cube text-blue-600 dark:text-blue-400"
                        ></i>
                      </div>
                      <div>
                        <div
                          class="text-sm font-bold text-gray-900 dark:text-white font-poppins"
                        >
                          ID: {{ stock.articleId }}
                        </div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">
                          {{ stock.article?.codeArticle || 'N/A' }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div
                      class="text-sm font-bold text-gray-900 dark:text-white font-poppins"
                    >
                      {{ stock.quantitePhysique }}
                    </div>
                    <div
                      class="text-xs text-gray-500 dark:text-gray-400 space-x-2"
                    >
                      <span
                        class="inline-flex items-center px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                      >
                        FFO: {{ stock.venteFFO || 0 }}
                      </span>
                      <span
                        class="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                      >
                        Livré: {{ stock.livreFou || 0 }}
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div
                      class="text-sm font-bold text-gray-900 dark:text-white font-poppins"
                    >
                      {{ stock.stockMin }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div
                      class="text-sm font-bold text-green-600 dark:text-green-400 font-poppins"
                    >
                      {{ stock.valeur_Stock_TND | currency : 'TND' }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      [class]="getEnhancedStockStatusClass(stock)"
                      class="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full font-poppins"
                    >
                      {{ getStockStatusFrench(stock) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                      <button
                        (click)="openEditModal(stock)"
                        class="group p-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-all duration-200 transform hover:scale-105"
                        title="Modifier"
                      >
                        <i
                          class="fas fa-edit group-hover:rotate-12 transition-transform duration-200"
                        ></i>
                      </button>
                      <button
                        (click)="deleteStock(stock.id)"
                        class="group p-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-all duration-200 transform hover:scale-105"
                        title="Supprimer"
                      >
                        <i class="fas fa-trash group-hover:animate-pulse"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Enhanced Empty State -->
        <div *ngIf="filteredStocks.length === 0" class="text-center py-16">
          <div
            class="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl p-12 max-w-md mx-auto"
          >
            <div class="mb-6">
              <div
                class="mx-auto w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center"
              >
                <i
                  class="fas fa-boxes text-4xl text-gray-400 dark:text-gray-500"
                ></i>
              </div>
            </div>
            <h3
              class="text-xl font-bold text-gray-600 dark:text-gray-300 mb-3 font-poppins"
            >
              Aucun stock trouvé
            </h3>
            <p class="text-gray-500 dark:text-gray-400 font-poppins">
              {{ getEmptyMessageFrench() }}
            </p>
            <button
              (click)="openAddModal()"
              class="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium font-poppins hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <i class="fas fa-plus mr-2"></i>Ajouter le premier stock
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div
      *ngIf="showToast"
      [ngClass]="getToastClasses()"
      class="fixed bottom-4 right-4 z-[60] p-4 rounded-xl shadow-2xl backdrop-blur-md border border-white/20 transition-all duration-500 ease-out transform font-poppins"
    >
      <div class="flex items-center text-white">
        <i [class]="getToastIconClass()" class="mr-3 text-lg animate-pulse"></i>
        <span class="font-medium">{{ toastMessage }}</span>
        <button
          (click)="hideToast()"
          class="ml-4 text-white/80 hover:text-white"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <!-- Stock Add/Edit Modal Template -->
    <ng-template #stockModalTemplate>
      <div
        class="modal-content-wrapper bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full mx-4 transform transition-all duration-300 ease-out scale-100 opacity-100 flex flex-col"
      >
        <!-- Modal Header -->
        <div
          class="w-full px-8 py-8 text-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-t-xl"
        >
          <div class="flex flex-col items-center space-y-4">
            <div class="p-4 bg-blue-100 dark:bg-blue-900 rounded-full">
              <i
                class="fas fa-boxes text-blue-600 dark:text-blue-300 text-3xl"
              ></i>
            </div>
            <div>
              <h3 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {{ isEditing ? 'Modifier Stock' : 'Ajouter Stock' }}
              </h3>
              <p class="text-base text-gray-600 dark:text-gray-300 max-w-md">
                {{
                  isEditing
                    ? 'Modifiez les informations du stock ci-dessous'
                    : 'Créez un nouveau stock en remplissant tous les champs requis'
                }}
              </p>
            </div>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="flex-1 w-full px-8 py-8 max-h-[60vh] overflow-y-auto">
          <form (ngSubmit)="saveStock()" class="w-full">
            <div class="flex flex-col space-y-8">
              <!-- Section: Article Information -->
              <div class="w-full bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h4
                  class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center"
                >
                  <i class="fas fa-cube text-blue-500 mr-2"></i>
                  Informations Article
                </h4>
                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Article <span class="text-red-500">*</span>
                  </label>
                  <select
                    [(ngModel)]="currentStock.articleId"
                    name="articleId"
                    required
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white transition-all duration-200 text-sm"
                  >
                    <option value="">Sélectionner un article</option>
                    <option
                      *ngFor="let article of articles"
                      [value]="article.id"
                    >
                      {{ article.codeArticle }} - {{ article.libelle }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Section: Basic Stock Information -->
              <div class="w-full bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h4
                  class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center"
                >
                  <i class="fas fa-boxes text-green-500 mr-2"></i>
                  Informations Stock de Base
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Quantité Physique <span class="text-red-500">*</span>
                    </label>
                    <input
                      [(ngModel)]="currentStock.quantitePhysique"
                      name="quantitePhysique"
                      type="number"
                      min="0"
                      required
                      class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white transition-all duration-200 text-sm"
                      placeholder="Ex: 100"
                    />
                  </div>
                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Stock Minimum <span class="text-red-500">*</span>
                    </label>
                    <input
                      [(ngModel)]="currentStock.stockMin"
                      name="stockMin"
                      type="number"
                      min="0"
                      required
                      class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white transition-all duration-200 text-sm"
                      placeholder="Ex: 10"
                    />
                  </div>
                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Valeur Stock (TND) <span class="text-red-500">*</span>
                    </label>
                    <input
                      [(ngModel)]="currentStock.valeur_Stock_TND"
                      name="valeurStock"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white transition-all duration-200 text-sm"
                      placeholder="Ex: 1500.00"
                    />
                  </div>
                </div>
              </div>

              <!-- Section: Stock Movement Details -->
              <div class="w-full bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h4
                  class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center"
                >
                  <i class="fas fa-exchange-alt text-purple-500 mr-2"></i>
                  Détails des Mouvements de Stock
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Vente FFO
                    </label>
                    <input
                      [(ngModel)]="currentStock.venteFFO"
                      name="venteFFO"
                      type="number"
                      min="0"
                      class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white transition-all duration-200 text-sm"
                      placeholder="Ex: 50"
                    />
                  </div>
                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Livré Fournisseur
                    </label>
                    <input
                      [(ngModel)]="currentStock.livreFou"
                      name="livreFou"
                      type="number"
                      min="0"
                      class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white transition-all duration-200 text-sm"
                      placeholder="Ex: 200"
                    />
                  </div>
                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Transfert
                    </label>
                    <input
                      [(ngModel)]="currentStock.transfert"
                      name="transfert"
                      type="number"
                      min="0"
                      class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white transition-all duration-200 text-sm"
                      placeholder="Ex: 25"
                    />
                  </div>
                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Annonce Transfert
                    </label>
                    <input
                      [(ngModel)]="currentStock.annonceTrf"
                      name="annonceTrf"
                      type="number"
                      min="0"
                      class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white transition-all duration-200 text-sm"
                      placeholder="Ex: 15"
                    />
                  </div>
                </div>
              </div>

              <!-- Modal Footer -->
              <div class="w-full bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <div class="flex justify-end space-x-4">
                  <button
                    type="button"
                    (click)="closeModal()"
                    class="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors duration-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <i class="fas fa-times mr-2"></i>
                    Annuler
                  </button>
                  <button
                    type="submit"
                    class="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-2"
                  >
                    <i class="fas fa-save"></i>
                    <span>{{ isEditing ? 'Modifier' : 'Créer' }}</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </ng-template>

    <!-- Stock Import Modal Template -->
    <ng-template #importModalTemplate>
      <div
        class="modal-content-wrapper bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full mx-4 transform transition-all duration-300 ease-out scale-100 opacity-100 flex flex-col"
      >
        <!-- Modal Header -->
        <div
          class="w-full px-8 py-8 text-center bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 rounded-t-xl"
        >
          <div class="flex flex-col items-center space-y-4">
            <div class="p-4 bg-purple-100 dark:bg-purple-900 rounded-full">
              <i
                class="fas fa-upload text-purple-600 dark:text-purple-300 text-3xl"
              ></i>
            </div>
            <div>
              <h3 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Importer Données de Stock
              </h3>
              <p class="text-base text-gray-600 dark:text-gray-300 max-w-md">
                Importez vos données de stock en téléchargeant un fichier CSV
                formaté
              </p>
            </div>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="flex-1 w-full px-8 py-8">
          <div class="flex flex-col space-y-8">
            <!-- Section: File Selection -->
            <div class="w-full bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h4
                class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center"
              >
                <i class="fas fa-file-csv text-green-500 mr-2"></i>
                Sélection du Fichier
              </h4>
              <div class="space-y-4">
                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Fichier CSV <span class="text-red-500">*</span>
                  </label>
                  <div class="flex items-center justify-center w-full">
                    <label
                      class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-700 transition-all duration-200"
                      (dragover)="onDragOver($event)"
                      (dragleave)="onDragLeave($event)"
                      (drop)="onFileDrop($event)"
                    >
                      <div
                        class="flex flex-col items-center justify-center pt-5 pb-6"
                      >
                        <i
                          class="fas fa-cloud-upload-alt text-gray-400 text-2xl mb-2"
                        ></i>
                        <p
                          class="mb-2 text-sm text-gray-500 dark:text-gray-400"
                        >
                          <span class="font-semibold"
                            >Cliquez pour télécharger</span
                          >
                          ou glissez-déposez
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                          CSV uniquement
                        </p>
                      </div>
                      <input
                        #fileInput
                        type="file"
                        accept=".csv"
                        (change)="onFileSelected($event)"
                        class="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div
                  *ngIf="selectedFile"
                  class="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
                >
                  <div class="flex items-center space-x-3">
                    <i
                      class="fas fa-file-csv text-blue-600 dark:text-blue-400 text-xl"
                    ></i>
                    <div class="flex-1">
                      <p
                        class="text-sm font-medium text-blue-900 dark:text-blue-100"
                      >
                        {{ selectedFile.name }}
                      </p>
                      <p class="text-xs text-blue-700 dark:text-blue-300">
                        {{ (selectedFile.size / 1024).toFixed(2) }} KB
                      </p>
                    </div>
                    <button
                      (click)="clearSelectedFile()"
                      class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section: Import Instructions -->
            <div class="w-full bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h4
                class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center"
              >
                <i class="fas fa-info-circle text-blue-500 mr-2"></i>
                Instructions d'Import
              </h4>
              <div class="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <p class="flex items-start space-x-2">
                  <i
                    class="fas fa-check text-green-500 mt-0.5 flex-shrink-0"
                  ></i>
                  <span
                    >Le fichier CSV doit contenir les colonnes: articleId,
                    quantitePhysique, stockMin, valeur_Stock_TND</span
                  >
                </p>
                <p class="flex items-start space-x-2">
                  <i
                    class="fas fa-check text-green-500 mt-0.5 flex-shrink-0"
                  ></i>
                  <span
                    >La première ligne doit contenir les en-têtes de
                    colonnes</span
                  >
                </p>
                <p class="flex items-start space-x-2">
                  <i
                    class="fas fa-check text-green-500 mt-0.5 flex-shrink-0"
                  ></i>
                  <span
                    >Les valeurs de stock doivent être des nombres décimaux
                    positifs</span
                  >
                </p>
                <p class="flex items-start space-x-2">
                  <i
                    class="fas fa-check text-green-500 mt-0.5 flex-shrink-0"
                  ></i>
                  <span
                    >Colonnes optionnelles: venteFFO, livreFou, transfert,
                    annonceTrf</span
                  >
                </p>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="w-full bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <div class="flex justify-end space-x-4">
                <button
                  type="button"
                  (click)="closeModal()"
                  class="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors duration-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <i class="fas fa-times mr-2"></i>
                  Annuler
                </button>
                <button
                  (click)="importStocks()"
                  [disabled]="!selectedFile || importing"
                  class="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-2 disabled:transform-none disabled:shadow-none"
                >
                  <i class="fas fa-spinner fa-spin mr-2" *ngIf="importing"></i>
                  <i class="fas fa-upload mr-2" *ngIf="!importing"></i>
                  <span>{{ importing ? 'Importation...' : 'Importer' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ng-template>
  `,
})
export class StockListComponent implements OnInit {
  @ViewChild('stockModalTemplate') stockModalTemplate!: TemplateRef<any>;
  @ViewChild('importModalTemplate') importModalTemplate!: TemplateRef<any>;

  stocks: Stock[] = [];
  filteredStocks: Stock[] = [];
  articles: Article[] = [];

  // Tabs
  activeTab = 'all';

  // Filters
  searchTerm = '';
  minQuantity: number | null = null;
  maxQuantity: number | null = null;
  minValue: number | null = null;

  // Modals state
  isEditing = false;

  // Current stock for add/edit
  currentStock: Partial<Stock> = {};

  // Import
  selectedFile: File | null = null;
  importing = false;

  // Computed values
  lowStockCount = 0;
  outOfStockCount = 0;

  // Toast properties
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' | 'info' = 'success';

  constructor(
    private stockService: StockService,
    private articleService: ArticleService,
    private modalService: ModalService,
    private viewContainer: ViewContainerRef,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadStocks();
    this.loadArticles();
  }
  loadStocks() {
    this.stockService.getAll().subscribe({
      next: (stocks) => {
        // Mettre à jour la valeur du stock pour chaque élément
        this.stocks = stocks.map((stock) => {
          this.articles.find((a) => a.id === stock.articleId);

          return stock;
        });
        console.log(stocks);
        this.calculateCounts();
        this.filterStocks();
      },
      error: (error) => {
        console.error('Error loading stocks:', error);
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

  calculateCounts() {
    this.lowStockCount = this.stocks.filter(
      (s) => s.quantitePhysique <= s.stockMin && s.quantitePhysique > 0
    ).length;
    this.outOfStockCount = this.stocks.filter(
      (s) => s.quantitePhysique === 0
    ).length;
  }

  filterStocks() {
    let filtered = [...this.stocks];

    // Tab filter
    if (this.activeTab === 'low') {
      filtered = filtered.filter(
        (stock) =>
          stock.quantitePhysique <= stock.stockMin && stock.quantitePhysique > 0
      );
    } else if (this.activeTab === 'out') {
      filtered = filtered.filter((stock) => stock.quantitePhysique === 0);
    }

    // Search term filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (stock) =>
          stock.article?.libelle?.toLowerCase().includes(term) ||
          stock.article?.codeArticle?.toLowerCase().includes(term)
      );
    }

    // Quantity range filter
    if (this.minQuantity !== null) {
      filtered = filtered.filter(
        (stock) => stock.quantitePhysique >= this.minQuantity!
      );
    }
    if (this.maxQuantity !== null) {
      filtered = filtered.filter(
        (stock) => stock.quantitePhysique <= this.maxQuantity!
      );
    }

    // Value filter
    if (this.minValue !== null) {
      filtered = filtered.filter(
        (stock) => stock.valeur_Stock_TND >= this.minValue!
      );
    }

    this.filteredStocks = filtered;
  }

  // Modal methods
  openAddModal() {
    this.isEditing = false;
    this.currentStock = {};
    this.modalService.openModal(this.stockModalTemplate, this.viewContainer);
  }

  openEditModal(stock: Stock) {
    this.isEditing = true;
    this.currentStock = { ...stock };
    this.modalService.openModal(this.stockModalTemplate, this.viewContainer);
  }

  openImportModal() {
    this.modalService.openModal(this.importModalTemplate, this.viewContainer);
  }

  closeModal() {
    this.modalService.closeModal();
    this.currentStock = {};
    this.selectedFile = null;
  }

  // Toast methods
  showToastMessage(message: string, type: 'success' | 'error' | 'info'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    // Auto-hide toast after 4 seconds
    setTimeout(() => {
      this.hideToast();
    }, 4000);
  }

  hideToast(): void {
    this.showToast = false;
    setTimeout(() => {
      this.toastMessage = '';
    }, 300);
  }

  // Toast helper methods
  getToastClasses(): string {
    const baseClasses = 'translate-y-0 opacity-100';
    switch (this.toastType) {
      case 'success':
        return `${baseClasses} bg-green-500/90`;
      case 'error':
        return `${baseClasses} bg-red-500/90`;
      case 'info':
        return `${baseClasses} bg-blue-500/90`;
      default:
        return `${baseClasses} bg-green-500/90`;
    }
  }

  getToastIconClass(): string {
    switch (this.toastType) {
      case 'success':
        return 'fas fa-check-circle';
      case 'error':
        return 'fas fa-exclamation-circle';
      case 'info':
        return 'fas fa-info-circle';
      default:
        return 'fas fa-check-circle';
    }
  }

  // File upload methods
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        this.selectedFile = file;
      } else {
        this.showToastMessage(
          'Veuillez sélectionner un fichier CSV valide.',
          'error'
        );
      }
    }
  }

  clearSelectedFile() {
    this.selectedFile = null;
  }

  editStock(stock: Stock) {
    this.openEditModal(stock);
  }

  deleteStock(id: number) {
    const stock = this.stocks.find((s) => s.id === id);
    const stockDescription = stock
      ? `stock de l'article ${stock.article?.libelle || 'ID ' + id}`
      : 'cet enregistrement de stock';

    this.confirmationService
      .confirmDelete(stockDescription)
      .subscribe((confirmed) => {
        if (confirmed) {
          this.stockService.delete(id).subscribe({
            next: () => {
              this.showToastMessage('Stock supprimé avec succès!', 'success');
              this.loadStocks();
            },
            error: (error) => {
              console.error('Error deleting stock:', error);
              let errorMessage = 'Erreur lors de la suppression du stock.';

              if (error.status === 400 && error.error?.details?.message) {
                errorMessage =
                  error.error.details.message +
                  ". Vous devez d'abord supprimer les données associées.";
              } else if (error.status === 404) {
                errorMessage = 'Enregistrement de stock non trouvé';
              } else if (error.status === 500) {
                errorMessage = 'Erreur serveur lors de la suppression';
              } else if (error.error?.error) {
                errorMessage = error.error.error;
              }

              this.showToastMessage(errorMessage, 'error');
            },
          });
        }
      });
  }
  saveStock() {
    // Calculer la valeur du stock avant de sauvegarder
    if (this.currentStock.articleId) {
      const article = this.articles.find(
        (a) => a.id === this.currentStock.articleId
      );
      if (article) {
        this.currentStock.valeur_Stock_TND =
          this.stockService.calculateStockValue(
            this.currentStock as Stock,
            article
          );
      }
    }

    if (this.isEditing && this.currentStock.id) {
      this.stockService
        .update(this.currentStock.id, this.currentStock as Stock)
        .subscribe({
          next: () => {
            this.showToastMessage('Stock mis à jour avec succès!', 'success');
            this.loadStocks();
            this.closeModal();
          },
          error: (error) => {
            console.error('Error updating stock:', error);
            this.showToastMessage(
              'Erreur lors de la mise à jour du stock.',
              'error'
            );
          },
        });
    } else {
      this.stockService.create(this.currentStock as Stock).subscribe({
        next: () => {
          this.showToastMessage('Stock créé avec succès!', 'success');
          this.loadStocks();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error creating stock:', error);
          this.showToastMessage(
            'Erreur lors de la création du stock.',
            'error'
          );
        },
      });
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  importStocks() {
    if (!this.selectedFile) return;

    this.importing = true;
    this.stockService.importStocks(this.selectedFile).subscribe({
      next: (response) => {
        console.log('Import successful:', response);
        this.showToastMessage('Import CSV réussi!', 'success');
        this.closeModal();
        this.selectedFile = null;
        this.importing = false;
        this.loadStocks();
      },
      error: (error) => {
        console.error('Import error:', error);
        this.showToastMessage("Erreur lors de l'import CSV.", 'error');
        this.importing = false;
      },
    });
  }

  getStockStatus(stock: Stock): string {
    if (stock.quantitePhysique === 0) {
      return 'Out of Stock';
    } else if (stock.quantitePhysique <= stock.stockMin) {
      return 'Low Stock';
    }
    return 'In Stock';
  }

  getStockStatusClass(stock: Stock): string {
    if (stock.quantitePhysique === 0) {
      return 'bg-red-100 text-red-800';
    } else if (stock.quantitePhysique <= stock.stockMin) {
      return 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-green-100 text-green-800';
  }

  getTotalItems(): number {
    return this.stocks.length;
  }

  getTotalQuantity(): number {
    return this.stocks.reduce(
      (total, stock) => total + stock.quantitePhysique,
      0
    );
  }

  getTotalValue(): number {
    return this.stocks.reduce(
      (total, stock) => total + stock.valeur_Stock_TND,
      0
    );
  }

  getEmptyMessage(): string {
    switch (this.activeTab) {
      case 'low':
        return 'No low stock items found.';
      case 'out':
        return 'No out of stock items found.';
      default:
        return 'Get started by adding your first stock item.';
    }
  }

  // Tab styling helper
  getTabClasses(tab: string): string {
    const baseClasses =
      'px-6 py-3 rounded-xl font-medium font-poppins transition-all duration-300 transform hover:scale-105';
    const activeClasses =
      'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg';
    const inactiveClasses =
      'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70';

    return this.activeTab === tab
      ? `${baseClasses} ${activeClasses}`
      : `${baseClasses} ${inactiveClasses}`;
  }

  // Enhanced stock status with better styling
  getEnhancedStockStatusClass(stock: Stock): string {
    if (stock.quantitePhysique === 0) {
      return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800';
    } else if (stock.quantitePhysique <= stock.stockMin) {
      return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800';
    }
    return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800';
  }

  // French stock status
  getStockStatusFrench(stock: Stock): string {
    if (stock.quantitePhysique === 0) {
      return 'Rupture';
    } else if (stock.quantitePhysique <= stock.stockMin) {
      return 'Stock Faible';
    }
    return 'En Stock';
  }

  // French empty message
  getEmptyMessageFrench(): string {
    switch (this.activeTab) {
      case 'low':
        return 'Aucun article avec stock faible trouvé.';
      case 'out':
        return 'Aucun article en rupture de stock trouvé.';
      default:
        return 'Commencez par ajouter votre premier article en stock.';
    }
  }
}
