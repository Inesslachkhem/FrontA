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

// Import services
import { StockService } from '../../services/stock.service';
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
          <ng-template #importModalTemplate>
            <div
              class="modal-content-wrapper bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full mx-4 transform transition-all duration-300 ease-out scale-100 opacity-100 flex flex-col"
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
                      Importez vos données de stock en téléchargeant un fichier
                      CSV formaté
                    </p>
                  </div>
                </div>
              </div>

              <!-- Modal Body -->
              <div class="flex-1 w-full px-8 py-8">
                <div class="flex flex-col space-y-8">
                  <!-- Section: File Selection -->
                  <div
                    class="w-full bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
                  >
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
                              <p
                                class="text-xs text-gray-500 dark:text-gray-400"
                              >
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
                  <div
                    class="w-full bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
                  >
                    <h4
                      class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center"
                    >
                      <i class="fas fa-info-circle text-blue-500 mr-2"></i>
                      Instructions d'Import
                    </h4>
                    <div
                      class="space-y-3 text-sm text-gray-600 dark:text-gray-300"
                    >
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
                          >Les valeurs de stock doivent être des nombres
                          décimaux positifs</span
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
                        (click)="importStocks()"
                        [disabled]="!selectedFile || importing"
                        class="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-2 disabled:transform-none disabled:shadow-none"
                      >
                        <i
                          class="fas fa-spinner fa-spin mr-2"
                          *ngIf="importing"
                        ></i>
                        <i class="fas fa-upload mr-2" *ngIf="!importing"></i>
                        <span>{{
                          importing ? 'Importation...' : 'Importer'
                        }}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
            <ng-template #importModalTemplate>
              <div
                class="modal-content-wrapper bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full mx-4 transform transition-all duration-300 ease-out scale-100 opacity-100 flex flex-col"
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
                        Importez vos données de stock en téléchargeant un
                        fichier CSV formaté
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Modal Body -->
                <div class="flex-1 w-full px-8 py-8">
                  <div class="flex flex-col space-y-8">
                    <!-- Section: File Selection -->
                    <div
                      class="w-full bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
                    >
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
                                <p
                                  class="text-xs text-gray-500 dark:text-gray-400"
                                >
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
                              <p
                                class="text-xs text-blue-700 dark:text-blue-300"
                              >
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
                    <div
                      class="w-full bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
                    >
                      <h4
                        class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center"
                      >
                        <i class="fas fa-info-circle text-blue-500 mr-2"></i>
                        Instructions d'Import
                      </h4>
                      <div
                        class="space-y-3 text-sm text-gray-600 dark:text-gray-300"
                      >
                        <p class="flex items-start space-x-2">
                          <i
                            class="fas fa-check text-green-500 mt-0.5 flex-shrink-0"
                          ></i>
                          <span
                            >Le fichier CSV doit contenir les colonnes:
                            articleId, quantitePhysique, stockMin,
                            valeur_Stock_TND</span
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
                            >Les valeurs de stock doivent être des nombres
                            décimaux positifs</span
                          >
                        </p>
                        <p class="flex items-start space-x-2">
                          <i
                            class="fas fa-check text-green-500 mt-0.5 flex-shrink-0"
                          ></i>
                          <span
                            >Colonnes optionnelles: venteFFO, livreFou,
                            transfert, annonceTrf</span
                          >
                        </p>
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
                          (click)="importStocks()"
                          [disabled]="!selectedFile || importing"
                          class="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-2 disabled:transform-none disabled:shadow-none"
                        >
                          <i
                            class="fas fa-spinner fa-spin mr-2"
                            *ngIf="importing"
                          ></i>
                          <i class="fas fa-upload mr-2" *ngIf="!importing"></i>
                          <span>{{
                            importing ? 'Importation...' : 'Importer'
                          }}</span>
                        </button>
                      </div>
                    </div>
                  </div>

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
                              Importez vos données de stock en téléchargeant un
                              fichier CSV formaté
                            </p>
                          </div>
                        </div>
                      </div>

                      <!-- Modal Body -->
                      <div class="flex-1 w-full px-8 py-8">
                        <div class="flex flex-col space-y-8">
                          <!-- Section: File Selection -->
                          <div
                            class="w-full bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
                          >
                            <h4
                              class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center"
                            >
                              <i
                                class="fas fa-file-csv text-green-500 mr-2"
                              ></i>
                              Sélection du Fichier
                            </h4>
                            <div class="space-y-4">
                              <div>
                                <label
                                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                >
                                  Fichier CSV
                                  <span class="text-red-500">*</span>
                                </label>
                                <div
                                  class="flex items-center justify-center w-full"
                                >
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
                                      <p
                                        class="text-xs text-gray-500 dark:text-gray-400"
                                      >
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
                                    <p
                                      class="text-xs text-blue-700 dark:text-blue-300"
                                    >
                                      {{
                                        (selectedFile.size / 1024).toFixed(2)
                                      }}
                                      KB
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
                          <div
                            class="w-full bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
                          >
                            <h4
                              class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center"
                            >
                              <i
                                class="fas fa-info-circle text-blue-500 mr-2"
                              ></i>
                              Instructions d'Import
                            </h4>
                            <div
                              class="space-y-3 text-sm text-gray-600 dark:text-gray-300"
                            >
                              <p class="flex items-start space-x-2">
                                <i
                                  class="fas fa-check text-green-500 mt-0.5 flex-shrink-0"
                                ></i>
                                <span
                                  >Le fichier CSV doit contenir les colonnes:
                                  articleId, quantitePhysique, stockMin,
                                  valeur_Stock_TND</span
                                >
                              </p>
                              <p class="flex items-start space-x-2">
                                <i
                                  class="fas fa-check text-green-500 mt-0.5 flex-shrink-0"
                                ></i>
                                <span
                                  >La première ligne doit contenir les en-têtes
                                  de colonnes</span
                                >
                              </p>
                              <p class="flex items-start space-x-2">
                                <i
                                  class="fas fa-check text-green-500 mt-0.5 flex-shrink-0"
                                ></i>
                                <span
                                  >Les valeurs de stock doivent être des nombres
                                  décimaux positifs</span
                                >
                              </p>
                              <p class="flex items-start space-x-2">
                                <i
                                  class="fas fa-check text-green-500 mt-0.5 flex-shrink-0"
                                ></i>
                                <span
                                  >Colonnes optionnelles: venteFFO, livreFou,
                                  transfert, annonceTrf</span
                                >
                              </p>
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
                                (click)="importStocks()"
                                [disabled]="!selectedFile || importing"
                                class="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-2 disabled:transform-none disabled:shadow-none"
                              >
                                <i
                                  class="fas fa-spinner fa-spin mr-2"
                                  *ngIf="importing"
                                ></i>
                                <i
                                  class="fas fa-upload mr-2"
                                  *ngIf="!importing"
                                ></i>
                                <span>{{
                                  importing ? 'Importation...' : 'Importer'
                                }}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div></ng-template
                  >
                </div>
              </div></ng-template
            ></ng-template
          ></ng-template
        >
      </div>
    </div>
  `,
})
export class StockListComponent implements OnInit {
  @ViewChild('stockModalTemplate') stockModalTemplate!: TemplateRef<any>;
  @ViewChild('importModalTemplate') importModalTemplate!: TemplateRef<any>;

  stocks: Stock[] = [];
  filteredStocks: Stock[] = [];
  articles: Article[] = [];
  depots: Depot[] = [];

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

  // Stock alerts
  stockAlerts: StockAlert[] = [];

  constructor(
    private stockService: StockService,
    private articleService: ArticleService,
    private depotService: DepotService,
    private modalService: ModalService,
    private viewContainer: ViewContainerRef,
    private confirmationService: ConfirmationService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadStocks();
    this.loadArticles();
    this.loadDepots();
  }

  loadStocks() {
    this.stockService.getAll().subscribe({
      next: (stocks) => {
        this.stocks = stocks;
        this.filterStocks();
        this.calculateCounts();
        this.checkStockAlerts();
      },
      error: (error) => {
        console.error('Error loading stocks:', error);
        this.showToastMessage('Erreur lors du chargement des stocks.', 'error');
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
        this.showToastMessage(
          'Erreur lors du chargement des articles.',
          'error'
        );
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
        this.showToastMessage('Erreur lors du chargement des dépôts.', 'error');
      },
    });
  }

  calculateCounts() {
    this.lowStockCount = this.stocks.filter(
      (s) => s.quantitePhysique > 0 && s.quantitePhysique <= s.stockMin
    ).length;
    this.outOfStockCount = this.stocks.filter(
      (s) => s.quantitePhysique === 0
    ).length;
  }

  // Stock Alert Methods
  checkStockAlerts() {
    const newAlerts: StockAlert[] = [];

    this.stocks.forEach((stock) => {
      // Check for out of stock
      if (stock.quantitePhysique === 0) {
        const alert: StockAlert = {
          id: `out_of_stock_${stock.id}`,
          type: 'out_of_stock',
          title: 'RUPTURE DE STOCK CRITIQUE',
          message: `L'article ${
            stock.article?.libelle || 'ID: ' + stock.articleId
          } est en rupture de stock complète !`,
          stock,
          timestamp: new Date(),
          emailSent: false,
          dismissed: false,
        };
        newAlerts.push(alert);
      }
      // Check for low stock
      else if (stock.quantitePhysique <= stock.stockMin) {
        const alert: StockAlert = {
          id: `low_stock_${stock.id}`,
          type: 'low_stock',
          title: 'STOCK FAIBLE - ATTENTION',
          message: `L'article ${
            stock.article?.libelle || 'ID: ' + stock.articleId
          } a un stock critique (${
            stock.quantitePhysique
          } restant, minimum requis: ${stock.stockMin})`,
          stock,
          timestamp: new Date(),
          emailSent: false,
          dismissed: false,
        };
        newAlerts.push(alert);
      }
    });

    // Update alerts and send emails
    this.stockAlerts = newAlerts;
    if (this.stockAlerts.length > 0) {
      this.sendStockAlertEmails();
      this.showStockAlertNotifications();
    }
  }

  sendStockAlertEmails() {
    this.stockAlerts.forEach((alert) => {
      if (!alert.emailSent) {
        // Call backend email service
        this.stockService.sendStockAlert(alert).subscribe({
          next: () => {
            alert.emailSent = true;
            console.log(
              `Email alert sent for ${alert.type}: ${alert.stock.id}`
            );
          },
          error: (error) => {
            console.error('Error sending email alert:', error);
          },
        });
      }
    });
  }

  showStockAlertNotifications() {
    this.stockAlerts.forEach((alert) => {
      if (alert.type === 'out_of_stock') {
        this.notificationService.error(
          'RUPTURE DE STOCK !',
          `Article ${
            alert.stock.article?.libelle || 'ID: ' + alert.stock.articleId
          } en rupture complète`,
          0 // Don't auto-hide critical alerts
        );
      } else {
        this.notificationService.warning(
          'Stock Faible',
          `Article ${
            alert.stock.article?.libelle || 'ID: ' + alert.stock.articleId
          } nécessite un réapprovisionnement`,
          8000
        );
      }
    });
  }

  getAlertClasses(alert: StockAlert): string {
    if (alert.type === 'out_of_stock') {
      return 'border-red-300 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 dark:border-red-600';
    } else {
      return 'border-yellow-300 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 dark:border-yellow-600';
    }
  }

  formatAlertTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes} min`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;

    const days = Math.floor(hours / 24);
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  }

  dismissAlert(alert: StockAlert) {
    alert.dismissed = true;
    this.stockAlerts = this.stockAlerts.filter((a) => !a.dismissed);
    this.notificationService.info(
      'Alerte ignorée',
      "L'alerte de stock a été supprimée"
    );
  }

  dismissAllAlerts() {
    this.stockAlerts = [];
    this.notificationService.info(
      'Alertes ignorées',
      'Toutes les alertes de stock ont été supprimées'
    );
  }

  resendAlertEmails() {
    this.stockAlerts.forEach((alert) => (alert.emailSent = false));
    this.sendStockAlertEmails();
    this.notificationService.success(
      'Emails renvoyés',
      'Les alertes de stock ont été renvoyées par email'
    );
  }

  filterStocks() {
    let filtered = [...this.stocks];

    // Apply search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (stock) =>
          stock.article?.codeArticle?.toLowerCase().includes(searchLower) ||
          stock.article?.libelle?.toLowerCase().includes(searchLower) ||
          stock.id.toString().includes(searchLower)
      );
    }

    // Apply quantity filters
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

    // Apply value filter
    if (this.minValue !== null) {
      filtered = filtered.filter(
        (stock) => stock.valeur_Stock_TND >= this.minValue!
      );
    }

    // Apply tab filter
    switch (this.activeTab) {
      case 'low':
        filtered = filtered.filter(
          (stock) =>
            stock.quantitePhysique > 0 &&
            stock.quantitePhysique <= stock.stockMin
        );
        break;
      case 'out':
        filtered = filtered.filter((stock) => stock.quantitePhysique === 0);
        break;
    }

    this.filteredStocks = filtered;
  }

  // Modal methods
  openAddModal() {
    this.currentStock = {
      depotId: this.depots.length > 0 ? this.depots[0].id : 1,
    };
    this.modalService.openModal(this.stockModalTemplate, this.viewContainer);
  }

  openEditModal(stock: Stock) {
    this.isEditing = true;
    this.currentStock = {
      ...stock,
      depotId:
        stock.depotId || (this.depots.length > 0 ? this.depots[0].id : 1),
    };
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
        return baseClasses + ' bg-gradient-to-r from-green-500 to-green-600';
      case 'error':
        return baseClasses + ' bg-gradient-to-r from-red-500 to-red-600';
      case 'info':
        return baseClasses + ' bg-gradient-to-r from-blue-500 to-blue-600';
      default:
        return baseClasses + ' bg-gradient-to-r from-gray-500 to-gray-600';
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
        return 'fas fa-bell';
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
      this.selectedFile = files[0];
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
              this.showToastMessage(
                'Erreur lors de la suppression du stock.',
                'error'
              );
            },
          });
        }
      });
  }

  saveStock() {
    // Validate required fields
    if (
      !this.currentStock.articleId ||
      this.currentStock.quantitePhysique === undefined ||
      this.currentStock.stockMin === undefined ||
      this.currentStock.valeur_Stock_TND === undefined ||
      !this.currentStock.depotId
    ) {
      this.showToastMessage(
        'Veuillez remplir tous les champs requis.',
        'error'
      );
      return;
    }

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

    // Prepare the stock data by ensuring all required fields are present and properly typed
    const stockData: any = {
      ArticleId: parseInt(String(this.currentStock.articleId), 10),
      QuantitePhysique: parseInt(
        String(this.currentStock.quantitePhysique || 0),
        10
      ),
      StockMin: parseInt(String(this.currentStock.stockMin || 0), 10),
      VenteFFO: parseInt(String(this.currentStock.venteFFO || 0), 10),
      LivreFou: parseInt(String(this.currentStock.livreFou || 0), 10),
      Transfert: parseInt(String(this.currentStock.transfert || 0), 10),
      AnnonceTrf: parseInt(String(this.currentStock.annonceTrf || 0), 10),
      Valeur_Stock_TND: parseFloat(
        String(this.currentStock.valeur_Stock_TND || 0)
      ),
      DepotId: parseInt(
        String(
          this.currentStock.depotId ||
            (this.depots.length > 0 ? this.depots[0].id : 1)
        ),
        10
      ),
    };

    // Include ID for updates
    if (this.isEditing && this.currentStock.id) {
      stockData.Id = this.currentStock.id;
    }

    // Validate that depotId is valid
    if (
      !this.depots.find((d) => d.id === stockData.DepotId) ||
      isNaN(stockData.DepotId)
    ) {
      this.showToastMessage(
        'Dépôt non valide. Veuillez sélectionner un dépôt existant.',
        'error'
      );
      return;
    }

    // Validate that articleId is valid
    if (
      !this.articles.find((a) => a.id === stockData.ArticleId) ||
      isNaN(stockData.ArticleId)
    ) {
      this.showToastMessage(
        'Article non valide. Veuillez sélectionner un article existant.',
        'error'
      );
      return;
    }

    // Validate that all numeric values are valid
    if (
      isNaN(stockData.QuantitePhysique) ||
      isNaN(stockData.StockMin) ||
      isNaN(stockData.VenteFFO) ||
      isNaN(stockData.LivreFou) ||
      isNaN(stockData.Transfert) ||
      isNaN(stockData.AnnonceTrf) ||
      isNaN(stockData.Valeur_Stock_TND)
    ) {
      this.showToastMessage(
        'Toutes les valeurs numériques doivent être valides.',
        'error'
      );
      return;
    }

    console.log('Stock data being sent:', stockData);

    if (this.isEditing && this.currentStock.id) {
      this.stockService.update(this.currentStock.id, stockData).subscribe({
        next: () => {
          this.showToastMessage('Stock mis à jour avec succès!', 'success');
          this.loadStocks();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error updating stock:', error);
          console.error(
            'Full error object:',
            JSON.stringify(error.error, null, 2)
          );

          let errorMessage = 'Erreur lors de la mise à jour du stock.';

          if (error.status === 400) {
            if (error.error?.errors) {
              // Handle validation errors
              console.error('Validation errors:', error.error.errors);
              const validationErrors = Object.keys(error.error.errors)
                .map((key) => `${key}: ${error.error.errors[key].join(', ')}`)
                .join('\n');
              errorMessage = `Erreurs de validation:\n${validationErrors}`;
            } else if (error.error?.message) {
              errorMessage = error.error.message;
            } else if (error.error?.title) {
              errorMessage = error.error.title;
            } else if (typeof error.error === 'string') {
              errorMessage = error.error;
            } else {
              // Log the full error structure for debugging
              console.error('Unknown 400 error structure:', error.error);
              errorMessage = `Erreur de validation: ${
                error.error?.title || "Structure d'erreur inconnue"
              }`;
            }
          } else if (error.status === 404) {
            errorMessage = 'Stock non trouvé.';
          } else if (error.status === 500) {
            errorMessage = 'Erreur serveur lors de la mise à jour.';
          }

          this.showToastMessage(errorMessage, 'error');
        },
      });
    } else {
      this.stockService.create(stockData).subscribe({
        next: () => {
          this.showToastMessage('Stock créé avec succès!', 'success');
          this.loadStocks();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error creating stock:', error);
          console.error(
            'Full error object:',
            JSON.stringify(error.error, null, 2)
          );

          let errorMessage = 'Erreur lors de la création du stock.';

          if (error.status === 400) {
            if (error.error?.errors) {
              // Handle validation errors
              console.error('Validation errors:', error.error.errors);
              const validationErrors = Object.keys(error.error.errors)
                .map((key) => `${key}: ${error.error.errors[key].join(', ')}`)
                .join('\n');
              errorMessage = `Erreurs de validation:\n${validationErrors}`;
            } else if (error.error?.message) {
              errorMessage = error.error.message;
            } else if (error.error?.title) {
              errorMessage = error.error.title;
            } else if (typeof error.error === 'string') {
              errorMessage = error.error;
            } else {
              // Log the full error structure for debugging
              console.error('Unknown 400 error structure:', error.error);
              errorMessage = `Erreur de validation: ${
                error.error?.title || "Structure d'erreur inconnue"
              }`;
            }
          } else if (error.status === 500) {
            errorMessage = 'Erreur serveur lors de la création.';
          }

          this.showToastMessage(errorMessage, 'error');
        },
      });
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  importStocks() {
    if (!this.selectedFile) {
      this.showToastMessage('Veuillez sélectionner un fichier CSV.', 'error');
      return;
    }

    this.importing = true;
    this.stockService.importStocks(this.selectedFile).subscribe({
      next: (response) => {
        this.importing = false;
        this.showToastMessage('Import réussi!', 'success');
        this.loadStocks();
        this.closeModal();
      },
      error: (error) => {
        this.importing = false;
        console.error('Error importing stocks:', error);
        this.showToastMessage("Erreur lors de l'import.", 'error');
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
        return 'Aucun stock faible trouvé.';
      case 'out':
        return 'Aucune rupture de stock trouvée.';
      default:
        return 'Aucun stock trouvé.';
    }
  }

  // Tab styling helper
  getTabClasses(tab: string): string {
    const baseClasses =
      'px-6 py-3 rounded-xl font-medium font-poppins transition-all duration-300 transform hover:scale-105';
    if (this.activeTab === tab) {
      return `${baseClasses} bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg`;
    }
    return `${baseClasses} bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70`;
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
        return 'Aucune rupture de stock détectée. Excellent travail de gestion !';
      default:
        if (
          this.searchTerm ||
          this.minQuantity ||
          this.maxQuantity ||
          this.minValue
        ) {
          return 'Aucun stock ne correspond à vos critères de recherche.';
        }
        return 'Votre inventaire est vide. Commencez par ajouter des stocks.';
    }
  }
}
