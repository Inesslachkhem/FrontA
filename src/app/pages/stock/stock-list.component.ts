import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  ViewContainerRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClient } from '@angular/common/http';

// Import services
import { ArticleService } from '../../services/article.service';
import { DepotService } from '../../services/depot.service';
import { ModalService } from '../../services/modal.service';
import { ConfirmationService } from '../../services/confirmation.service';
import { NotificationService } from '../../services/notification.service';

// Import models
import { Stock, Article, Depot } from '../../models/article.model';

// Stock Alert Interface
export interface StockAlert {
  id: string;
  type: 'low_stock' | 'out_of_stock';
  title: string;
  message: string;
  stock: Stock;
  timestamp: Date;
  emailSent: boolean;
  dismissed: boolean;
}

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
                class="group relative bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium font-poppins transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg"
              >
                <div class="flex items-center">
                  <i
                    class="fas fa-sync-alt mr-2 group-hover:animate-spin transition-transform duration-500"
                  ></i>
                  Synchroniser
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
                  *ngFor="let stock of paginatedStocks"
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

        <!-- Pagination Controls -->
        <div
          *ngIf="paginatedStocks.length > 0"
          class="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6 mt-8"
        >
          <div
            class="flex flex-col sm:flex-row justify-between items-center gap-4"
          >
            <!-- Results Info -->
            <div
              class="text-sm text-gray-700 dark:text-gray-300 font-medium font-poppins"
            >
              Affichage de {{ getStartIndex() }} à {{ getEndIndex() }} sur
              {{ filteredStocks.length }} résultats
            </div>

            <!-- Page Size Selector -->
            <div class="flex items-center gap-2">
              <span
                class="text-sm text-gray-700 dark:text-gray-300 font-medium font-poppins"
                >Afficher:</span
              >
              <select
                [(ngModel)]="pageSize"
                (change)="changePageSize(pageSize)"
                class="px-3 py-2 bg-white/80 dark:bg-gray-700/80 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium font-poppins focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option [value]="5">5</option>
                <option [value]="10">10</option>
                <option [value]="25">25</option>
                <option [value]="50">50</option>
              </select>
              <span
                class="text-sm text-gray-700 dark:text-gray-300 font-medium font-poppins"
                >par page</span
              >
            </div>

            <!-- Navigation Controls -->
            <div class="flex items-center gap-2">
              <button
                (click)="previousPage()"
                [disabled]="currentPage === 1"
                class="group relative px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-medium font-poppins transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:opacity-50 shadow-lg hover:shadow-xl"
              >
                <i class="fas fa-chevron-left mr-2"></i>
                Précédent
              </button>

              <span
                class="px-4 py-2 text-gray-700 dark:text-gray-300 font-medium font-poppins"
              >
                Page {{ currentPage }} sur {{ totalPages }}
              </span>

              <button
                (click)="nextPage()"
                [disabled]="currentPage === totalPages"
                class="group relative px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-medium font-poppins transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:opacity-50 shadow-lg hover:shadow-xl"
              >
                Suivant
                <i class="fas fa-chevron-right ml-2"></i>
              </button>
            </div>
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

        <!-- Stock Alerts Section - Awesome Alerts -->
        <div *ngIf="stockAlerts.length > 0" class="mb-8">
          <div
            class="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6"
          >
            <div class="flex items-center mb-6">
              <div
                class="p-3 bg-gradient-to-r from-red-500 to-orange-600 rounded-xl shadow-lg mr-4"
              >
                <i
                  class="fas fa-exclamation-triangle text-white text-2xl animate-pulse"
                ></i>
              </div>
              <div>
                <h2
                  class="text-2xl font-bold text-gray-900 dark:text-white font-poppins"
                >
                  Alertes de Stock Critiques
                </h2>
                <p class="text-gray-600 dark:text-gray-400">
                  {{ stockAlerts.length }} article(s) nécessitent votre
                  attention immédiate
                </p>
              </div>
            </div>

            <div class="space-y-4">
              <div
                *ngFor="let alert of stockAlerts"
                class="group relative overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-lg"
                [ngClass]="getAlertClasses(alert)"
              >
                <!-- Background pattern -->
                <div class="absolute inset-0 opacity-5">
                  <div
                    class="absolute -top-4 -right-4 w-24 h-24 rounded-full border-4"
                    [class.border-red-500]="alert.type === 'out_of_stock'"
                    [class.border-yellow-500]="alert.type === 'low_stock'"
                  ></div>
                  <div
                    class="absolute -bottom-4 -left-4 w-32 h-32 rounded-full border-4"
                    [class.border-red-500]="alert.type === 'out_of_stock'"
                    [class.border-yellow-500]="alert.type === 'low_stock'"
                  ></div>
                </div>

                <div class="relative p-6">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                      <div
                        class="p-3 rounded-xl"
                        [class.bg-red-100]="alert.type === 'out_of_stock'"
                        [class.bg-yellow-100]="alert.type === 'low_stock'"
                        [class.dark:bg-red-900]="alert.type === 'out_of_stock'"
                        [class.dark:bg-yellow-900]="alert.type === 'low_stock'"
                      >
                        <i
                          class="text-2xl"
                          [class.fas]="true"
                          [class.fa-times-circle]="
                            alert.type === 'out_of_stock'
                          "
                          [class.fa-exclamation-triangle]="
                            alert.type === 'low_stock'
                          "
                          [class.text-red-600]="alert.type === 'out_of_stock'"
                          [class.text-yellow-600]="alert.type === 'low_stock'"
                          [class.dark:text-red-400]="
                            alert.type === 'out_of_stock'
                          "
                          [class.dark:text-yellow-400]="
                            alert.type === 'low_stock'
                          "
                        ></i>
                      </div>
                      <div>
                        <h3
                          class="text-lg font-bold font-poppins"
                          [class.text-red-900]="alert.type === 'out_of_stock'"
                          [class.text-yellow-900]="alert.type === 'low_stock'"
                          [class.dark:text-red-200]="
                            alert.type === 'out_of_stock'
                          "
                          [class.dark:text-yellow-200]="
                            alert.type === 'low_stock'
                          "
                        >
                          {{ alert.title }}
                        </h3>
                        <p
                          class="text-sm opacity-90 font-poppins"
                          [class.text-red-700]="alert.type === 'out_of_stock'"
                          [class.text-yellow-700]="alert.type === 'low_stock'"
                          [class.dark:text-red-300]="
                            alert.type === 'out_of_stock'
                          "
                          [class.dark:text-yellow-300]="
                            alert.type === 'low_stock'
                          "
                        >
                          {{ alert.message }}
                        </p>
                      </div>
                    </div>

                    <div class="flex items-center space-x-4">
                      <div class="text-right">
                        <div
                          class="text-2xl font-bold font-poppins"
                          [class.text-red-800]="alert.type === 'out_of_stock'"
                          [class.text-yellow-800]="alert.type === 'low_stock'"
                          [class.dark:text-red-200]="
                            alert.type === 'out_of_stock'
                          "
                          [class.dark:text-yellow-200]="
                            alert.type === 'low_stock'
                          "
                        >
                          {{ alert.stock.quantitePhysique }}
                        </div>
                        <div
                          class="text-xs opacity-75"
                          [class.text-red-600]="alert.type === 'out_of_stock'"
                          [class.text-yellow-600]="alert.type === 'low_stock'"
                          [class.dark:text-red-400]="
                            alert.type === 'out_of_stock'
                          "
                          [class.dark:text-yellow-400]="
                            alert.type === 'low_stock'
                          "
                        >
                          Min: {{ alert.stock.stockMin }}
                        </div>
                      </div>

                      <div class="flex flex-col space-y-2">
                        <button
                          (click)="openEditModal(alert.stock)"
                          class="px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                          [class.bg-red-50]="alert.type === 'out_of_stock'"
                          [class.text-red-700]="alert.type === 'out_of_stock'"
                          [class.hover:bg-red-100]="
                            alert.type === 'out_of_stock'
                          "
                          [class.bg-yellow-50]="alert.type === 'low_stock'"
                          [class.text-yellow-700]="alert.type === 'low_stock'"
                          [class.hover:bg-yellow-100]="
                            alert.type === 'low_stock'
                          "
                          [class.dark:bg-red-900]="
                            alert.type === 'out_of_stock'
                          "
                          [class.dark:text-red-200]="
                            alert.type === 'out_of_stock'
                          "
                          [class.dark:hover:bg-red-800]="
                            alert.type === 'out_of_stock'
                          "
                          [class.dark:bg-yellow-900]="
                            alert.type === 'low_stock'
                          "
                          [class.dark:text-yellow-200]="
                            alert.type === 'low_stock'
                          "
                          [class.dark:hover:bg-yellow-800]="
                            alert.type === 'low_stock'
                          "
                        >
                          <i class="fas fa-edit mr-2"></i>
                          Réapprovisionner
                        </button>

                        <button
                          (click)="dismissAlert(alert)"
                          class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                        >
                          <i class="fas fa-times mr-2"></i>
                          Ignorer
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Email notification status -->
                  <div
                    class="mt-4 pt-4 border-t border-current border-opacity-20"
                  >
                    <div class="flex items-center justify-between text-sm">
                      <div class="flex items-center space-x-2">
                        <i class="fas fa-envelope opacity-60"></i>
                        <span class="opacity-75">
                          {{
                            alert.emailSent
                              ? 'Email envoyé automatiquement'
                              : 'Email en cours d envoi...'
                          }}
                        </span>
                      </div>
                      <div class="flex items-center space-x-2 opacity-60">
                        <i class="fas fa-clock"></i>
                        <span>{{ formatAlertTime(alert.timestamp) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Global action buttons -->
            <div class="mt-6 flex justify-end space-x-4">
              <button
                (click)="dismissAllAlerts()"
                class="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
              >
                <i class="fas fa-times-circle mr-2"></i>
                Ignorer Toutes
              </button>
              <button
                (click)="resendAlertEmails()"
                class="px-6 py-3 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-xl font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition-all duration-200"
              >
                <i class="fas fa-envelope mr-2"></i>
                Renvoyer Emails
              </button>
            </div>
          </div>
        </div>

        <!-- Toast Modal Notification -->
        <div
          *ngIf="showToast"
          class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-300"
        >
          <div
            class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 flex flex-col items-center border border-gray-200 dark:border-gray-700 animate-fadeInModal"
          >
            <div class="absolute top-4 right-4">
              <button
                (click)="hideToast()"
                class="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors text-xl"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="mb-4 flex flex-col items-center">
              <i
                [class]="getToastIconClass()"
                class="text-4xl mb-2 animate-pulse"
              ></i>
              <span
                class="text-lg font-semibold text-gray-900 dark:text-white text-center"
                >{{ toastMessage }}</span
              >
            </div>
            <button
              (click)="hideToast()"
              class="mt-6 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg shadow transition-all duration-200"
            >
              Fermer
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
                  <h3
                    class="text-3xl font-bold text-gray-900 dark:text-white mb-2"
                  >
                    {{ isEditing ? 'Modifier Stock' : 'Ajouter Stock' }}
                  </h3>
                  <p
                    class="text-base text-gray-600 dark:text-gray-300 max-w-md"
                  >
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
                  <div
                    class="w-full bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
                  >
                    <h4
                      class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center"
                    >
                      <i class="fas fa-cube text-blue-500 mr-2"></i>
                      Informations Article
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <div>
                        <label
                          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          Dépôt <span class="text-red-500">*</span>
                        </label>
                        <select
                          [(ngModel)]="currentStock.depotId"
                          name="depotId"
                          required
                          class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white transition-all duration-200 text-sm"
                        >
                          <option value="">Sélectionner un dépôt</option>
                          <option
                            *ngFor="let depot of depots"
                            [value]="depot.id"
                          >
                            {{ depot.code }} - {{ depot.libelle }}
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <!-- Section: Basic Stock Information -->
                  <div
                    class="w-full bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
                  >
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
                  <div
                    class="w-full bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
                  >
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
                  <div
                    class="w-full bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
                  >
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

          <!-- Stock Import Modal Template -->
          <ng-template #stockImportModal>
            <div
              class="modal-content-wrapper bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] transform transition-all duration-300 ease-out scale-100 opacity-100 flex flex-col overflow-hidden"
            >
              <!-- Modal Header -->
              <div
                class="w-full px-8 py-8 text-center bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 rounded-t-xl"
              >
                <div class="flex flex-col items-center space-y-4">
                  <div
                    class="p-4 bg-purple-100 dark:bg-purple-900 rounded-full"
                  >
                    <i
                      class="fas fa-upload text-purple-600 dark:text-purple-300 text-3xl"
                    ></i>
                  </div>
                  <div>
                    <h3
                      class="text-3xl font-bold text-gray-900 dark:text-white mb-2"
                    >
                      Importer Données de Stock
                    </h3>
                    <p
                      class="text-base text-gray-600 dark:text-gray-300 max-w-md"
                    >
                      Téléchargez et importez vos données de stock depuis un
                      fichier CSV formaté
                    </p>
                  </div>
                </div>
                <div class="absolute top-4 right-4">
                  <button
                    (click)="closeModal()"
                    class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <i class="fas fa-times text-lg"></i>
                  </button>
                </div>
              </div>

              <!-- Modal Body -->
              <div class="flex-1 overflow-y-auto p-8">
                <!-- File Upload Section -->
                <div class="mb-8">
                  <div
                    class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    (dragover)="onDragOver($event)"
                    (dragleave)="onDragLeave($event)"
                    (drop)="onFileDrop($event)"
                  >
                    <div class="flex flex-col items-center space-y-4">
                      <div
                        class="p-6 bg-purple-100 dark:bg-purple-900/50 rounded-full"
                      >
                        <i
                          class="fas fa-cloud-upload-alt text-purple-600 dark:text-purple-400 text-4xl"
                        ></i>
                      </div>
                      <div>
                        <h4
                          class="text-xl font-semibold text-gray-900 dark:text-white mb-2"
                        >
                          Télécharger un fichier CSV
                        </h4>
                        <p
                          class="text-gray-600 dark:text-gray-400 text-sm mb-4"
                        >
                          Glissez-déposez votre fichier ou cliquez pour
                          sélectionner
                        </p>
                        <input
                          #fileInput
                          type="file"
                          accept=".csv"
                          (change)="onFileSelected($event)"
                          class="hidden"
                          id="file-upload"
                        />
                        <label
                          for="file-upload"
                          class="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg cursor-pointer transition-colors duration-200 shadow-lg hover:shadow-xl"
                        >
                          <i class="fas fa-file-upload mr-2"></i>
                          Choisir un fichier
                        </label>
                      </div>
                    </div>

                    <!-- File Preview -->
                    <div
                      *ngIf="selectedFile"
                      class="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                          <i
                            class="fas fa-file-csv text-green-600 dark:text-green-400 text-2xl"
                          ></i>
                          <div>
                            <p
                              class="font-medium text-gray-900 dark:text-white"
                            >
                              {{ selectedFile.name }}
                            </p>
                            <p class="text-sm text-gray-600 dark:text-gray-400">
                              {{ (selectedFile.size / 1024).toFixed(2) }} KB
                            </p>
                          </div>
                        </div>
                        <button
                          (click)="clearSelectedFile()"
                          class="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        >
                          <i class="fas fa-trash text-lg"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Format Information -->
                <div class="mb-8">
                  <h5
                    class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center"
                  >
                    <i
                      class="fas fa-info-circle text-blue-600 dark:text-blue-400 mr-2"
                    ></i>
                    Format CSV Requis
                  </h5>
                  <div
                    class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4"
                  >
                    <p
                      class="text-sm text-blue-800 dark:text-blue-300 mb-3 font-medium"
                    >
                      Votre fichier CSV doit contenir les colonnes suivantes :
                    </p>
                    <div
                      class="grid grid-cols-2 gap-2 text-xs text-blue-700 dark:text-blue-400 font-mono"
                    >
                      <div>• Id (optionnel)</div>
                      <div>• ArticleId</div>
                      <div>• QuantitePhysique</div>
                      <div>• StockMin</div>
                      <div>• VenteFFO</div>
                      <div>• LivreFou</div>
                      <div>• Transfert</div>
                      <div>• AnnonceTrf</div>
                      <div>• Valeur_Stock_TND</div>
                      <div>• DepotId</div>
                    </div>
                  </div>
                </div>

                <!-- Warning Section -->
                <div class="mb-6">
                  <div
                    class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4"
                  >
                    <div class="flex items-start space-x-3">
                      <i
                        class="fas fa-exclamation-triangle text-red-600 dark:text-red-400 text-xl mt-0.5"
                      ></i>
                      <div>
                        <h6
                          class="font-semibold text-red-800 dark:text-red-300 mb-2"
                        >
                          Attention : Remplacement Complet
                        </h6>
                        <p class="text-sm text-red-700 dark:text-red-400">
                          Cette action remplacera TOUTES les données de stock
                          existantes. Cette opération ne peut pas être annulée.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Modal Footer -->
              <div
                class="border-t border-gray-200 dark:border-gray-700 px-8 py-6 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl"
              >
                <div class="flex justify-between items-center">
                  <button
                    type="button"
                    (click)="closeModal()"
                    class="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors duration-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <i class="fas fa-times mr-2"></i>
                    Annuler
                  </button>

                  <!-- Debug buttons -->
                  <div class="flex space-x-2" *ngIf="selectedFile">
                    <button
                      type="button"
                      (click)="testApiConnection()"
                      class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg"
                    >
                      🔍 Test API
                    </button>
                    <button
                      type="button"
                      (click)="analyzeFileFormat()"
                      class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded-lg"
                    >
                      📋 Analyze CSV
                    </button>
                  </div>

                  <button
                    (click)="showImportWarning()"
                    [disabled]="!selectedFile || importing"
                    class="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-2 disabled:transform-none disabled:shadow-none"
                  >
                    <i
                      class="fas fa-spinner fa-spin mr-2"
                      *ngIf="importing"
                    ></i>
                    <i class="fas fa-upload mr-2" *ngIf="!importing"></i>
                    <span>{{ importing ? 'Importation...' : 'Importer' }}</span>
                  </button>
                </div>
              </div>
            </div>
          </ng-template>
        </ng-template>

        <!-- Toast Modal Notification -->
        <div
          *ngIf="showToast"
          class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-300"
        >
          <div
            class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 flex flex-col items-center border border-gray-200 dark:border-gray-700 animate-fadeInModal"
          >
            <div class="absolute top-4 right-4">
              <button
                (click)="hideToast()"
                class="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors text-xl"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="mb-4 flex flex-col items-center">
              <i
                [class]="getToastIconClass()"
                class="text-4xl mb-2 animate-pulse"
              ></i>
              <span
                class="text-lg font-semibold text-gray-900 dark:text-white text-center"
                >{{ toastMessage }}</span
              >
            </div>
            <button
              (click)="hideToast()"
              class="mt-6 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg shadow transition-all duration-200"
            >
              Fermer
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
                  <h3
                    class="text-3xl font-bold text-gray-900 dark:text-white mb-2"
                  >
                    {{ isEditing ? 'Modifier Stock' : 'Ajouter Stock' }}
                  </h3>
                  <p
                    class="text-base text-gray-600 dark:text-gray-300 max-w-md"
                  >
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
                  <div
                    class="w-full bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
                  >
                    <h4
                      class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center"
                    >
                      <i class="fas fa-cube text-blue-500 mr-2"></i>
                      Informations Article
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <div>
                        <label
                          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                          Dépôt <span class="text-red-500">*</span>
                        </label>
                        <select
                          [(ngModel)]="currentStock.depotId"
                          name="depotId"
                          required
                          class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:text-white transition-all duration-200 text-sm"
                        >
                          <option value="">Sélectionner un dépôt</option>
                          <option
                            *ngFor="let depot of depots"
                            [value]="depot.id"
                          >
                            {{ depot.code }} - {{ depot.libelle }}
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <!-- Section: Basic Stock Information -->
                  <div
                    class="w-full bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
                  >
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
                          Quantité Physique
                          <span class="text-red-500">*</span>
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
                          Valeur Stock (TND)
                          <span class="text-red-500">*</span>
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
                  <div
                    class="w-full bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
                  >
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
                  <div
                    class="w-full bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
                  >
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

          <!-- Stock Import Modal Template -->
          <ng-template #stockImportModal>
            <div
              class="modal-content-wrapper bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] transform transition-all duration-300 ease-out scale-100 opacity-100 flex flex-col overflow-hidden"
            >
              <!-- Modal Header -->
              <div
                class="w-full px-8 py-8 text-center bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 rounded-t-xl"
              >
                <div class="flex flex-col items-center space-y-4">
                  <div
                    class="p-4 bg-purple-100 dark:bg-purple-900 rounded-full"
                  >
                    <i
                      class="fas fa-upload text-purple-600 dark:text-purple-300 text-3xl"
                    ></i>
                  </div>
                  <div>
                    <h3
                      class="text-3xl font-bold text-gray-900 dark:text-white mb-2"
                    >
                      Importer Données de Stock
                    </h3>
                    <p
                      class="text-base text-gray-600 dark:text-gray-300 max-w-md"
                    >
                      Téléchargez et importez vos données de stock depuis un
                      fichier CSV formaté
                    </p>
                  </div>
                </div>
                <div class="absolute top-4 right-4">
                  <button
                    (click)="closeModal()"
                    class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <i class="fas fa-times text-lg"></i>
                  </button>
                </div>
              </div>

              <!-- Modal Body -->
              <div class="flex-1 overflow-y-auto p-8">
                <!-- File Upload Section -->
                <div class="mb-8">
                  <div
                    class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    (dragover)="onDragOver($event)"
                    (dragleave)="onDragLeave($event)"
                    (drop)="onFileDrop($event)"
                  >
                    <div class="flex flex-col items-center space-y-4">
                      <div
                        class="p-6 bg-purple-100 dark:bg-purple-900/50 rounded-full"
                      >
                        <i
                          class="fas fa-cloud-upload-alt text-purple-600 dark:text-purple-400 text-4xl"
                        ></i>
                      </div>
                      <div>
                        <h4
                          class="text-xl font-semibold text-gray-900 dark:text-white mb-2"
                        >
                          Télécharger un fichier CSV
                        </h4>
                        <p
                          class="text-gray-600 dark:text-gray-400 text-sm mb-4"
                        >
                          Glissez-déposez votre fichier ou cliquez pour
                          sélectionner
                        </p>
                        <input
                          #fileInput
                          type="file"
                          accept=".csv"
                          (change)="onFileSelected($event)"
                          class="hidden"
                          id="file-upload"
                        />
                        <label
                          for="file-upload"
                          class="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg cursor-pointer transition-colors duration-200 shadow-lg hover:shadow-xl"
                        >
                          <i class="fas fa-file-upload mr-2"></i>
                          Choisir un fichier
                        </label>
                      </div>
                    </div>

                    <!-- File Preview -->
                    <div
                      *ngIf="selectedFile"
                      class="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                          <i
                            class="fas fa-file-csv text-green-600 dark:text-green-400 text-2xl"
                          ></i>
                          <div>
                            <p
                              class="font-medium text-gray-900 dark:text-white"
                            >
                              {{ selectedFile.name }}
                            </p>
                            <p class="text-sm text-gray-600 dark:text-gray-400">
                              {{ (selectedFile.size / 1024).toFixed(2) }} KB
                            </p>
                          </div>
                        </div>
                        <button
                          (click)="clearSelectedFile()"
                          class="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        >
                          <i class="fas fa-trash text-lg"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Format Information -->
                <div class="mb-8">
                  <h5
                    class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center"
                  >
                    <i
                      class="fas fa-info-circle text-blue-600 dark:text-blue-400 mr-2"
                    ></i>
                    Format CSV Requis
                  </h5>
                  <div
                    class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4"
                  >
                    <p
                      class="text-sm text-blue-800 dark:text-blue-300 mb-3 font-medium"
                    >
                      Votre fichier CSV doit contenir les colonnes suivantes :
                    </p>
                    <div
                      class="grid grid-cols-2 gap-2 text-xs text-blue-700 dark:text-blue-400 font-mono"
                    >
                      <div>• Id (optionnel)</div>
                      <div>• ArticleId</div>
                      <div>• QuantitePhysique</div>
                      <div>• StockMin</div>
                      <div>• VenteFFO</div>
                      <div>• LivreFou</div>
                      <div>• Transfert</div>
                      <div>• AnnonceTrf</div>
                      <div>• Valeur_Stock_TND</div>
                      <div>• DepotId</div>
                    </div>
                  </div>
                </div>

                <!-- Warning Section -->
                <div class="mb-6">
                  <div
                    class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4"
                  >
                    <div class="flex items-start space-x-3">
                      <i
                        class="fas fa-exclamation-triangle text-red-600 dark:text-red-400 text-xl mt-0.5"
                      ></i>
                      <div>
                        <h6
                          class="font-semibold text-red-800 dark:text-red-300 mb-2"
                        >
                          Attention : Remplacement Complet
                        </h6>
                        <p class="text-sm text-red-700 dark:text-red-400">
                          Cette action remplacera TOUTES les données de stock
                          existantes. Cette opération ne peut pas être annulée.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Modal Footer -->
              <div
                class="border-t border-gray-200 dark:border-gray-700 px-8 py-6 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl"
              >
                <div class="flex justify-between items-center">
                  <button
                    type="button"
                    (click)="closeModal()"
                    class="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors duration-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <i class="fas fa-times mr-2"></i>
                    Annuler
                  </button>

                  <!-- Debug buttons -->
                  <div class="flex space-x-2" *ngIf="selectedFile">
                    <button
                      type="button"
                      (click)="testApiConnection()"
                      class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg"
                    >
                      🔍 Test API
                    </button>
                    <button
                      type="button"
                      (click)="analyzeFileFormat()"
                      class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded-lg"
                    >
                      📋 Analyze CSV
                    </button>
                  </div>

                  <button
                    (click)="showImportWarning()"
                    [disabled]="!selectedFile || importing"
                    class="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-2 disabled:transform-none disabled:shadow-none"
                  >
                    <i
                      class="fas fa-spinner fa-spin mr-2"
                      *ngIf="importing"
                    ></i>
                    <i class="fas fa-upload mr-2" *ngIf="!importing"></i>
                    <span>{{ importing ? 'Importation...' : 'Importer' }}</span>
                  </button>
                </div>
              </div>
            </div>
          </ng-template>
        </ng-template>
      </div>
    </div>
  `,
})
export class StockListComponent implements OnInit {
  @ViewChild('stockModalTemplate') stockModalTemplate!: TemplateRef<any>;
  @ViewChild('stockImportModal') stockImportModal!: TemplateRef<any>;

  // Inject services using the inject function
  private http = inject(HttpClient);
  private articleService = inject(ArticleService);
  private depotService = inject(DepotService);
  private modalService = inject(ModalService);
  private confirmationService = inject(ConfirmationService);
  private notificationService = inject(NotificationService);
  private viewContainerRef = inject(ViewContainerRef);

  // API URL
  private apiUrl = 'http://localhost:5256/api/Stock';

  // Component properties
  stocks: Stock[] = [];
  filteredStocks: Stock[] = [];
  paginatedStocks: Stock[] = [];
  articles: Article[] = [];
  depots: Depot[] = [];
  searchTerm: string = '';
  minValue: number = 0;
  maxValue: number = 0;
  minQuantity: number = 0;
  maxQuantity: number = 0;

  // Pagination properties
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  // Modal states
  isEditing: boolean = false;
  showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' | 'warning' | 'info' = 'info';
  importing: boolean = false;
  selectedFile: File | null = null;

  // Tab management
  activeTab: 'all' | 'low' | 'out' = 'all';

  // Current stock being edited
  currentStock: any = this.getEmptyStock();

  // Stock alerts
  stockAlerts: StockAlert[] = [];

  ngOnInit() {
    this.loadStocks();
    this.loadArticles();
    this.loadDepots();
    this.generateStockAlerts();
  }

  // Load data methods
  loadStocks() {
    this.http.get<Stock[]>(this.apiUrl).subscribe({
      next: (stocks: Stock[]) => {
        this.stocks = stocks;
        this.filterStocks();
        this.generateStockAlerts();
      },
      error: (error: any) => {
        console.error('Error loading stocks:', error);
        this.showToastMessage('Erreur lors du chargement des stocks', 'error');
      },
    });
  }

  loadArticles() {
    this.articleService.getAll().subscribe({
      next: (articles: Article[]) => {
        this.articles = articles;
      },
      error: (error) => {
        console.error('Error loading articles:', error);
      },
    });
  }

  loadDepots() {
    this.depotService.getAll().subscribe({
      next: (depots) => {
        this.depots = depots;
      },
      error: (error) => {
        console.error('Error loading depots:', error);
      },
    });
  }

  // Stock management methods
  filterStocks() {
    let filtered = this.stocks;

    // Filter by tab
    if (this.activeTab === 'low') {
      filtered = filtered.filter(
        (stock) =>
          stock.quantitePhysique <= stock.stockMin && stock.quantitePhysique > 0
      );
    } else if (this.activeTab === 'out') {
      filtered = filtered.filter((stock) => stock.quantitePhysique === 0);
    }

    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (stock) =>
          stock.article?.libelle?.toLowerCase().includes(term) ||
          stock.article?.codeArticle?.toLowerCase().includes(term)
      );
    }

    // Filter by value range
    if (this.minValue > 0) {
      filtered = filtered.filter(
        (stock) => stock.valeur_Stock_TND >= this.minValue
      );
    }
    if (this.maxValue > 0) {
      filtered = filtered.filter(
        (stock) => stock.valeur_Stock_TND <= this.maxValue
      );
    }

    this.filteredStocks = filtered;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredStocks.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedStocks = this.filteredStocks.slice(startIndex, endIndex);
  }

  // Pagination methods
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  changePageSize(newPageSize: number) {
    this.pageSize = newPageSize;
    this.currentPage = 1;
    this.updatePagination();
  }

  getStartIndex(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getEndIndex(): number {
    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredStocks.length
    );
  }

  // Modal management
  openAddModal() {
    this.isEditing = false;
    this.currentStock = this.getEmptyStock();
    this.modalService.openModal(this.stockModalTemplate, this.viewContainerRef);
  }

  openEditModal(stock: Stock) {
    this.isEditing = true;
    this.currentStock = { ...stock };
    this.modalService.openModal(this.stockModalTemplate, this.viewContainerRef);
  }

  openImportModal() {
    this.selectedFile = null;
    this.importing = false;
    this.modalService.openModal(this.stockImportModal, this.viewContainerRef);
  }

  closeModal() {
    this.modalService.closeModal();
  }

  // Helper methods
  getEmptyStock() {
    return {
      id: 0,
      quantitePhysique: 0,
      stockMin: 0,
      venteFFO: 0,
      livreFou: 0,
      transfert: 0,
      annonceTrf: 0,
      valeur_Stock_TND: 0,
      articleId: null,
      depotId: null,
      article: null,
      depot: null,
    };
  }

  // Save stock
  saveStock() {
    if (this.isEditing) {
      this.http
        .put<Stock>(`${this.apiUrl}/${this.currentStock.id}`, this.currentStock)
        .subscribe({
          next: () => {
            this.showToastMessage('Stock modifié avec succès!', 'success');
            this.closeModal();
            this.loadStocks();
          },
          error: (error: any) => {
            console.error('Error updating stock:', error);
            this.showToastMessage('Erreur lors de la modification', 'error');
          },
        });
    } else {
      this.http.post<Stock>(this.apiUrl, this.currentStock).subscribe({
        next: () => {
          this.showToastMessage('Stock créé avec succès!', 'success');
          this.closeModal();
          this.loadStocks();
        },
        error: (error: any) => {
          console.error('Error creating stock:', error);
          this.showToastMessage('Erreur lors de la création', 'error');
        },
      });
    }
  }

  // Delete stock
  deleteStock(id: number) {
    this.confirmationService
      .confirmDangerousAction(
        'Confirmer la suppression',
        'Êtes-vous sûr de vouloir supprimer ce stock? Cette action ne peut pas être annulée.'
      )
      .subscribe((confirmed) => {
        if (confirmed) {
          this.http.delete(`${this.apiUrl}/${id}`).subscribe({
            next: () => {
              this.showToastMessage('Stock supprimé avec succès!', 'success');
              this.loadStocks();
            },
            error: (error: any) => {
              console.error('Error deleting stock:', error);
              this.showToastMessage('Erreur lors de la suppression', 'error');
            },
          });
        }
      });
  }

  // File upload methods
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      console.log('File selected:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
      });

      // Validate file type
      if (!file.name.toLowerCase().endsWith('.csv')) {
        this.showToastMessage('Veuillez sélectionner un fichier CSV.', 'error');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.showToastMessage(
          'Le fichier est trop volumineux (max 10MB).',
          'error'
        );
        return;
      }

      this.selectedFile = file;
    }
  }

  showImportWarning() {
    if (!this.selectedFile) {
      this.showToastMessage('Veuillez sélectionner un fichier CSV.', 'error');
      return;
    }

    // Store filename to avoid null reference issues
    const fileName = this.selectedFile.name;

    // Close the import modal first
    this.closeModal();

    // Show warning confirmation using custom modal
    this.confirmationService
      .confirmDangerousAction(
        '⚠️ ATTENTION: REMPLACEMENT DES DONNEES DE STOCK !',
        'Cette action va remplacer TOUTES les données de stock existantes avec le contenu du fichier "' +
          fileName +
          '". Cette opération NE PEUT PAS être annulée. Voulez-vous vraiment continuer?'
      )
      .subscribe((confirmed) => {
        if (confirmed) {
          this.importStocks();
        } else {
          // If user cancels, reopen the import modal
          setTimeout(() => {
            this.openImportModal();
          }, 300);
        }
      });
  }

  importStocks() {
    if (!this.selectedFile) {
      this.showToastMessage('Veuillez sélectionner un fichier CSV.', 'error');
      return;
    }

    // Store file reference to prevent loss during async operations
    const fileToImport = this.selectedFile;

    console.log('🚀 Component: Starting import with file:', fileToImport);
    console.log('📋 File details:', {
      name: fileToImport.name,
      size: fileToImport.size,
      type: fileToImport.type,
    });

    // Test API connectivity first to ensure backend is running
    console.log('🔍 Testing API connectivity...');
    this.http.get<Stock[]>(this.apiUrl).subscribe({
      next: (stocks: Stock[]) => {
        console.log('✅ API is reachable, current stocks:', stocks.length);
        this.performImport(fileToImport);
      },
      error: (error: any) => {
        console.error('❌ API connectivity test failed:', error);
        this.importing = false;
        this.showToastMessage(
          "Impossible de contacter le serveur. Vérifiez que l'API est en cours d'exécution sur http://localhost:5256",
          'error'
        );
      },
    });
  }

  private performImport(file: File) {
    this.importing = true;
    this.showToastMessage('Import en cours...', 'info');

    console.log('📤 Component: Calling direct HTTP import...');

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', file);

    this.http.post<any>(`${this.apiUrl}/import-stocks`, formData).subscribe({
      next: (response: any) => {
        console.log('✅ Component: Import successful:', response);
        this.importing = false;
        this.selectedFile = null;
        this.showToastMessage('Import réussi!', 'success');
        this.closeModal();
        this.loadStocks();
      },
      error: (error: any) => {
        console.error('❌ Component: Import error details:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error body:', error.error);

        this.importing = false;

        let errorMessage = "Erreur lors de l'import.";

        // Handle specific HTTP status codes with more detailed messages
        if (error.status === 0) {
          errorMessage =
            "Impossible de contacter le serveur. Vérifiez que l'API est en cours d'exécution sur http://localhost:5256";
        } else if (error.status === 400) {
          errorMessage =
            error.error?.message ||
            error.error ||
            'Fichier CSV invalide. Vérifiez le format des colonnes.';
        } else if (error.status === 500) {
          errorMessage =
            "Erreur serveur lors de l'import. Vérifiez les logs du serveur.";
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.showToastMessage(errorMessage, 'error');
      },
    });
  }

  clearSelectedFile() {
    this.selectedFile = null;
  }

  // Toast management
  showToastMessage(
    message: string,
    type: 'success' | 'error' | 'warning' | 'info'
  ) {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    // Auto-hide after 5 seconds for success/info, keep errors visible
    if (type === 'success' || type === 'info') {
      setTimeout(() => {
        this.hideToast();
      }, 5000);
    }
  }

  hideToast() {
    this.showToast = false;
  }

  getToastIconClass(): string {
    switch (this.toastType) {
      case 'success':
        return 'fas fa-check-circle text-green-500';
      case 'error':
        return 'fas fa-times-circle text-red-500';
      case 'warning':
        return 'fas fa-exclamation-triangle text-yellow-500';
      case 'info':
      default:
        return 'fas fa-info-circle text-blue-500';
    }
  }

  // Stock statistics and helpers
  getTotalItems(): number {
    return this.stocks.length;
  }

  get lowStockCount(): number {
    return this.stocks.filter(
      (stock) =>
        stock.quantitePhysique <= stock.stockMin && stock.quantitePhysique > 0
    ).length;
  }

  get outOfStockCount(): number {
    return this.stocks.filter((stock) => stock.quantitePhysique === 0).length;
  }

  getTotalValue(): number {
    return this.stocks.reduce(
      (total, stock) => total + stock.valeur_Stock_TND,
      0
    );
  }

  getTotalQuantity(): number {
    return this.stocks.reduce(
      (total, stock) => total + stock.quantitePhysique,
      0
    );
  }

  // Alert management methods
  formatAlertTime(timestamp: Date): string {
    return timestamp.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  dismissAlert(alert: StockAlert) {
    this.stockAlerts = this.stockAlerts.filter((a) => a.id !== alert.id);
  }

  dismissAllAlerts() {
    this.stockAlerts = [];
  }

  resendAlertEmails() {
    // Implementation for resending alert emails
    this.showToastMessage("Emails d'alerte renvoyés!", 'success');
  }

  // Drag and drop methods
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
      if (file.name.toLowerCase().endsWith('.csv')) {
        this.selectedFile = file;
        this.showToastMessage(
          'Fichier ' + file.name + ' sélectionné',
          'success'
        );
      } else {
        this.showToastMessage('Veuillez sélectionner un fichier CSV', 'error');
      }
    }
  }

  // Stock alerts management
  generateStockAlerts() {
    this.stockAlerts = [];

    this.stocks.forEach((stock) => {
      if (stock.quantitePhysique === 0) {
        this.stockAlerts.push({
          id: 'out_' + stock.id,
          type: 'out_of_stock',
          title: 'Rupture de Stock',
          message:
            "L'article " +
            (stock.article?.libelle || 'Unknown') +
            ' est en rupture de stock',
          stock: stock,
          timestamp: new Date(),
          emailSent: false,
          dismissed: false,
        });
      } else if (stock.quantitePhysique <= stock.stockMin) {
        this.stockAlerts.push({
          id: 'low_' + stock.id,
          type: 'low_stock',
          title: 'Stock Faible',
          message:
            "L'article " +
            (stock.article?.libelle || 'Unknown') +
            ' a un niveau de stock faible',
          stock: stock,
          timestamp: new Date(),
          emailSent: false,
          dismissed: false,
        });
      }
    });
  }

  getAlertClasses(alert: StockAlert): string {
    const baseClasses = 'border-l-4';
    if (alert.type === 'out_of_stock') {
      return baseClasses + ' border-red-500 bg-red-50 dark:bg-red-900/20';
    } else if (alert.type === 'low_stock') {
      return (
        baseClasses + ' border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
      );
    }
    return baseClasses;
  }

  // Tab styling
  getTabClasses(tab: string): string {
    const baseClasses =
      'px-6 py-3 rounded-xl font-medium font-poppins transition-all duration-300 transform hover:scale-105';
    if (this.activeTab === tab) {
      return (
        baseClasses +
        ' bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
      );
    }
    return (
      baseClasses +
      ' bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70'
    );
  }

  // Enhanced stock status with better styling
  getEnhancedStockStatusClass(stock: Stock): string {
    if (stock.quantitePhysique === 0) {
      return 'bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900 dark:to-red-800 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-600';
    } else if (stock.quantitePhysique <= stock.stockMin) {
      return 'bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-800 text-yellow-800 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-600';
    }
    return 'bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-600';
  }

  // French stock status
  getStockStatusFrench(stock: Stock): string {
    if (stock.quantitePhysique === 0) {
      return 'Rupture de Stock';
    } else if (stock.quantitePhysique <= stock.stockMin) {
      return 'Stock Faible';
    }
    return 'En Stock';
  }

  // French empty message
  getEmptyMessageFrench(): string {
    switch (this.activeTab) {
      case 'low':
        return 'Aucun article avec un stock faible. Tous vos niveaux de stock sont optimaux.';
      case 'out':
        return 'Aucun article en rupture de stock. Tous vos articles sont disponibles.';
      default:
        return 'Aucun stock trouvé. Commencez par créer votre premier stock.';
    }
  }

  // Debug methods for troubleshooting CSV import
  testApiConnection() {
    console.log('Testing API connection...');
    this.http.get<Stock[]>(this.apiUrl).subscribe({
      next: (stocks: Stock[]) => {
        console.log(
          'API connection successful:',
          stocks.length,
          'stocks found'
        );
        this.showToastMessage(
          'API connectee! ' + stocks.length + ' stocks trouves.',
          'success'
        );
      },
      error: (error: any) => {
        console.error('API connection failed:', error);
        this.showToastMessage("Impossible de contacter l'API!", 'error');
      },
    });
  }

  analyzeFileFormat() {
    if (!this.selectedFile) {
      this.showToastMessage('Aucun fichier selectionne', 'error');
      return;
    }

    console.log('Analyzing file format...');
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const lines = content.split('\n');

      console.log('File Analysis Results:');
      console.log('File name:', this.selectedFile?.name);
      console.log('File size:', this.selectedFile?.size, 'bytes');
      console.log('Total lines:', lines.length);
      console.log('Header:', lines[0]);
      console.log('First data line:', lines[1]);

      // Check separators
      const firstDataLine = lines[1] || '';
      const commaCount = (firstDataLine.match(/,/g) || []).length;
      const tabCount = (firstDataLine.match(/\t/g) || []).length;

      let message = 'Analyse du fichier: ';
      message += 'Lignes: ' + lines.length + ', ';
      message += 'Virgules: ' + commaCount + ', Tabs: ' + tabCount + ', ';
      message += 'En-tete: ' + lines[0] + '';

      if (tabCount > commaCount) {
        message +=
          ' ATTENTION: Fichier separe par des TABS, mais le backend attend des VIRGULES!';
        this.showToastMessage(message, 'warning');
      } else {
        message += ' Format correct (separe par des virgules)';
        this.showToastMessage(message, 'success');
      }
    };
    reader.readAsText(this.selectedFile);
  }
}
