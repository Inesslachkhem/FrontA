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
import { Article } from '../../models/article.model';
import { Vente } from '../../models/vente.model';
import { VenteService } from '../../services/vente.service';
import { ArticleService } from '../../services/article.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-vente-list',
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
                class="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg"
              >
                <i class="fas fa-shopping-cart text-white text-2xl"></i>
              </div>
              <div>
                <h1
                  class="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent font-poppins"
                >
                  Gestion des Ventes
                </h1>
                <p class="text-gray-600 dark:text-gray-400 font-medium">
                  Gérez vos ventes et commandes
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
                class="group relative bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-medium font-poppins transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg"
              >
                <div class="flex items-center">
                  <i
                    class="fas fa-plus mr-2 group-hover:rotate-90 transition-transform duration-300"
                  ></i>
                  Ajouter Vente
                </div>
                <div
                  class="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                ></div>
              </button>
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
                <i class="fas fa-shopping-cart text-white text-2xl"></i>
              </div>
              <div class="ml-4">
                <p
                  class="text-sm font-medium text-gray-600 dark:text-gray-400 font-poppins"
                >
                  Total Ventes
                </p>
                <p
                  class="text-3xl font-bold text-gray-900 dark:text-white font-poppins"
                >
                  {{ getTotalSales() }}
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
                <i class="fas fa-coins text-white text-2xl"></i>
              </div>
              <div class="ml-4">
                <p
                  class="text-sm font-medium text-gray-600 dark:text-gray-400 font-poppins"
                >
                  Chiffre d'Affaires
                </p>
                <p
                  class="text-3xl font-bold text-gray-900 dark:text-white font-poppins"
                >
                  {{ getTotalRevenue() | currency : 'TND' }}
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
                class="p-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300"
              >
                <i class="fas fa-chart-line text-white text-2xl"></i>
              </div>
              <div class="ml-4">
                <p
                  class="text-sm font-medium text-gray-600 dark:text-gray-400 font-poppins"
                >
                  Valeur Moyenne
                </p>
                <p
                  class="text-3xl font-bold text-gray-900 dark:text-white font-poppins"
                >
                  {{ getAverageSaleValue() | currency : 'TND' }}
                </p>
              </div>
            </div>
            <div
              class="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            ></div>
          </div>

          <div
            class="group relative backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div class="flex items-center">
              <div
                class="p-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300"
              >
                <i class="fas fa-boxes text-white text-2xl"></i>
              </div>
              <div class="ml-4">
                <p
                  class="text-sm font-medium text-gray-600 dark:text-gray-400 font-poppins"
                >
                  Articles Vendus
                </p>
                <p
                  class="text-3xl font-bold text-gray-900 dark:text-white font-poppins"
                >
                  {{ getTotalQuantitySold() }}
                </p>
              </div>
            </div>
            <div
              class="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            ></div>
          </div>
        </div>

        <!-- Filters with glassmorphism -->
        <div
          class="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6 mb-8"
        >
          <div class="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <i class="fas fa-search text-gray-400 dark:text-gray-500"></i>
              </div>
              <input
                [(ngModel)]="searchTerm"
                (input)="filterVentes()"
                type="text"
                placeholder="Rechercher par article..."
                class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 font-poppins"
              />
            </div>

            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <i class="fas fa-calendar text-gray-400 dark:text-gray-500"></i>
              </div>
              <input
                [(ngModel)]="startDate"
                (change)="filterVentes()"
                type="date"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 font-poppins"
              />
            </div>

            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
              >
                <i class="fas fa-calendar text-gray-400 dark:text-gray-500"></i>
              </div>
              <input
                [(ngModel)]="endDate"
                (change)="filterVentes()"
                type="date"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 font-poppins"
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
                [(ngModel)]="minAmount"
                (input)="filterVentes()"
                type="number"
                placeholder="Montant Min (TND)"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 font-poppins"
              />
            </div>

            <button
              (click)="clearFilters()"
              class="group relative bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium font-poppins transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md"
            >
              <div class="flex items-center justify-center">
                <i
                  class="fas fa-times mr-2 group-hover:rotate-90 transition-transform duration-300"
                ></i>
                Effacer
              </div>
              <div
                class="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              ></div>
            </button>
          </div>
        </div>
        <!-- Sales Table with enhanced dark mode design -->
        <div
          class="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl overflow-hidden"
        >
          <!-- Loading State -->
          <div *ngIf="isLoading" class="flex items-center justify-center py-12">
            <div
              class="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"
            ></div>
            <span
              class="ml-4 text-gray-600 dark:text-gray-400 font-medium font-poppins"
              >Chargement des données de vente...</span
            >
          </div>

          <!-- Empty State -->
          <div
            *ngIf="!isLoading && paginatedVentes.length === 0"
            class="text-center py-16"
          >
            <div
              class="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6"
            >
              <i
                class="fas fa-shopping-cart text-gray-400 dark:text-gray-500 text-4xl"
              ></i>
            </div>
            <h3
              class="text-xl font-bold text-gray-900 dark:text-white mb-2 font-poppins"
            >
              {{
                filteredVentes.length === 0 && ventes.length === 0
                  ? 'Aucune vente trouvée'
                  : 'Aucun résultat'
              }}
            </h3>
            <p class="text-gray-500 dark:text-gray-400 font-poppins">
              {{
                ventes.length === 0
                  ? 'Commencez par enregistrer votre première vente.'
                  : 'Essayez d'ajuster vos filtres de recherche.'
              }}
            </p>
          </div>

          <!-- Data Table -->
          <div
            *ngIf="!isLoading && paginatedVentes.length > 0"
            class="overflow-x-auto"
          >
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
                    <i class="fas fa-hashtag mr-2"></i>ID Vente
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider font-poppins"
                  >
                    <i class="fas fa-cube mr-2"></i>Article
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider font-poppins"
                  >
                    <i class="fas fa-boxes mr-2"></i>Quantité
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider font-poppins"
                  >
                    <i class="fas fa-coins mr-2"></i>Montant
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider font-poppins"
                  >
                    <i class="fas fa-tag mr-2"></i>Prix Unitaire
                  </th>
                  <th
                    class="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider font-poppins"
                  >
                    <i class="fas fa-calendar mr-2"></i>Date
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
                  *ngFor="let vente of paginatedVentes; trackBy: trackByVente"
                  class="hover:bg-green-50/70 dark:hover:bg-gray-700/70 transition-all duration-200 group"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div
                        class="p-2 bg-green-100 dark:bg-green-900 rounded-lg mr-3 group-hover:scale-105 transition-transform duration-200"
                      >
                        <i
                          class="fas fa-hashtag text-green-600 dark:text-green-400"
                        ></i>
                      </div>
                      <div
                        class="text-sm font-bold text-gray-900 dark:text-white font-poppins"
                      >
                        #{{ vente.id }}
                      </div>
                    </div>
                  </td>
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
                          {{ vente.articleId }}
                        </div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">
                          {{ vente.article?.codeArticle || 'N/A' }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div
                      class="text-sm font-bold text-gray-900 dark:text-white font-poppins"
                    >
                      {{ vente.quantiteFacturee }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div
                      class="text-sm font-bold text-green-600 dark:text-green-400 font-poppins"
                    >
                      {{
                        vente.prix_Vente_TND * vente.quantiteFacturee
                          | currency : 'TND'
                      }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div
                      class="text-sm font-medium text-gray-900 dark:text-white font-poppins"
                    >
                      {{ getUnitPrice(vente) | currency : 'TND' }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div
                      class="text-sm text-gray-900 dark:text-white font-poppins"
                    >
                      {{ vente.date | date : 'short' }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center space-x-2">
                      <button
                        (click)="editVente(vente)"
                        class="group relative p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-all duration-200 transform hover:scale-110"
                      >
                        <i
                          class="fas fa-edit text-indigo-600 dark:text-indigo-400 group-hover:rotate-12 transition-transform duration-200"
                        ></i>
                      </button>
                      <button
                        (click)="deleteVente(vente.id)"
                        class="group relative p-2 bg-red-100 dark:bg-red-900 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-all duration-200 transform hover:scale-110"
                      >
                        <i
                          class="fas fa-trash text-red-600 dark:text-red-400 group-hover:animate-pulse"
                        ></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination with enhanced design -->
        <div
          class="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6 mt-8"
        >
          <div class="flex flex-col sm:flex-row justify-between items-center">
            <div
              class="text-sm text-gray-700 dark:text-gray-300 font-medium font-poppins mb-4 sm:mb-0"
            >
              Affichage de {{ (currentPage - 1) * pageSize + 1 }} à
              {{ Math.min(currentPage * pageSize, filteredVentes.length) }} sur
              {{ filteredVentes.length }} résultats
            </div>
            <div class="flex items-center gap-2">
              <button
                (click)="previousPage()"
                [disabled]="currentPage === 1"
                class="group relative px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-medium font-poppins transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:opacity-50 shadow-lg hover:shadow-xl"
              >
                <i class="fas fa-chevron-left mr-2"></i>
                Précédent
              </button>
              <span
                class="px-4 py-2 text-gray-700 dark:text-gray-300 font-medium font-poppins"
                >Page {{ currentPage }} sur {{ totalPages }}</span
              >
              <button
                (click)="nextPage()"
                [disabled]="currentPage === totalPages"
                class="group relative px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-medium font-poppins transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:opacity-50 shadow-lg hover:shadow-xl"
              >
                Suivant
                <i class="fas fa-chevron-right ml-2"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div
      *ngIf="showToastMessage"
      class="fixed top-4 right-4 z-[10000] transform transition-all duration-300 ease-out"
      [class.translate-x-0]="showToastMessage"
      [class.translate-x-full]="!showToastMessage"
    >
      <div
        class="max-w-sm w-full backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
        [ngClass]="{
          'bg-green-500/90 dark:bg-green-600/90': toastType === 'success',
          'bg-red-500/90 dark:bg-red-600/90': toastType === 'error',
          'bg-blue-500/90 dark:bg-blue-600/90': toastType === 'info'
        }"
      >
        <div class="p-4">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <i
                class="text-white text-xl"
                [ngClass]="{
                  'fas fa-check-circle': toastType === 'success',
                  'fas fa-exclamation-circle': toastType === 'error',
                  'fas fa-info-circle': toastType === 'info'
                }"
              ></i>
            </div>
            <div class="ml-3 w-0 flex-1">
              <p class="text-sm font-medium text-white font-poppins">
                {{ toastMessage }}
              </p>
            </div>
            <div class="ml-4 flex-shrink-0 flex">
              <button
                (click)="hideToast()"
                class="inline-flex text-white hover:text-gray-200 focus:outline-none transition-colors duration-200"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Import Modal Template -->
    <ng-template #importModalTemplate>
      <div
        class="modal-content-wrapper  bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full mx-4 transform transition-all duration-300 ease-out scale-100 opacity-100 flex flex-col"
      >
        <!-- Modal Header -->
        <div
          class="w-full px-8 py-8 text-center bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-t-xl"
        >
          <div class="flex flex-col items-center space-y-4">
            <div class="p-4 bg-purple-100 dark:bg-purple-900 rounded-full">
              <i
                class="fas fa-upload text-purple-600 dark:text-purple-300 text-3xl"
              ></i>
            </div>
            <div>
              <h3 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Importer Données de Vente
              </h3>
              <p class="text-base text-gray-600 dark:text-gray-300 max-w-md">
                Importez vos données de vente en téléchargeant un fichier CSV
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
                      (click)="removeSelectedFile()"
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
                    quantiteFacturee, prix_Vente_TND, date</span
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
                    >Les dates doivent être au format YYYY-MM-DD ou YYYY-MM-DD
                    HH:mm:ss</span
                  >
                </p>
                <p class="flex items-start space-x-2">
                  <i
                    class="fas fa-check text-green-500 mt-0.5 flex-shrink-0"
                  ></i>
                  <span
                    >Les prix doivent être des nombres décimaux (ex:
                    25.50)</span
                  >
                </p>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="w-full bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <div class="flex justify-end space-x-4">
                <button
                  type="button"
                  (click)="closeImportModal()"
                  class="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors duration-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <i class="fas fa-times mr-2"></i>
                  Annuler
                </button>
                <button
                  (click)="importVentes()"
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

    <!-- Vente Modal Template -->
    <ng-template #venteModalTemplate>
      <div
        class="modal-content-wrapper bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full mx-4 transform transition-all duration-300 ease-out scale-100 opacity-100 flex flex-col"
      >
        <!-- Modal Header -->
        <div
          class="w-full px-8 py-8 text-center bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 rounded-t-xl"
        >
          <div class="flex flex-col items-center space-y-4">
            <div class="p-4 bg-green-100 dark:bg-green-900 rounded-full">
              <i
                class="fas fa-shopping-cart text-green-600 dark:text-green-300 text-3xl"
              ></i>
            </div>
            <div>
              <h3 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {{ isEditMode ? 'Modifier Vente' : 'Ajouter Vente' }}
              </h3>
              <p class="text-base text-gray-600 dark:text-gray-300 max-w-md">
                {{
                  isEditMode
                    ? 'Modifiez les informations de la vente ci-dessous'
                    : 'Créez une nouvelle vente en remplissant tous les champs requis'
                }}
              </p>
            </div>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="flex-1 w-full px-8 py-8 max-h-[60vh] overflow-y-auto">
          <form (ngSubmit)="saveVente()" class="w-full">
            <div class="flex flex-col space-y-8">
              <!-- Section: Article Information -->
              <div class="w-full bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h4
                  class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center"
                >
                  <i class="fas fa-box text-blue-500 mr-2"></i>
                  Informations Article
                </h4>
                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Article <span class="text-red-500">*</span>
                  </label>
                  <select
                    [(ngModel)]="currentVente.articleId"
                    name="articleId"
                    required
                    (change)="onArticleSelected()"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-600 dark:text-white transition-all duration-200 text-sm"
                  >
                    <option value="">Sélectionner un article</option>
                    <option
                      *ngFor="let article of articles"
                      [value]="article.id"
                    >
                      {{ article.codeArticle }} - {{ article.libelle }} ({{
                        article.prix_Vente_TND | currency : 'TND'
                      }})
                    </option>
                  </select>
                </div>
              </div>

              <!-- Section: Sale Details -->
              <div class="w-full bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h4
                  class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center"
                >
                  <i class="fas fa-calculator text-purple-500 mr-2"></i>
                  Détails de la Vente
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Quantité Vendue <span class="text-red-500">*</span>
                    </label>
                    <input
                      [(ngModel)]="currentVente.quantiteFacturee"
                      name="quantiteVendue"
                      type="number"
                      min="1"
                      required
                      (input)="calculateTotal()"
                      class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-600 dark:text-white transition-all duration-200 text-sm"
                      placeholder="Ex: 5"
                    />
                  </div>

                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Prix Unitaire (TND)
                    </label>
                    <input
                      [(ngModel)]="unitPrice"
                      name="unitPrice"
                      type="number"
                      step="0.01"
                      [readonly]="true"
                      class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-500 text-gray-600 dark:text-gray-300 text-sm"
                    />
                  </div>

                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Montant Total (TND)
                    </label>
                    <input
                      [value]="(currentVente.quantiteFacturee || 0) * unitPrice"
                      name="montantTotal"
                      type="number"
                      step="0.01"
                      [readonly]="true"
                      class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-500 text-gray-600 dark:text-gray-300 text-sm font-semibold"
                    />
                  </div>
                </div>
              </div>

              <!-- Section: Date -->
              <div class="w-full bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h4
                  class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center"
                >
                  <i class="fas fa-calendar text-orange-500 mr-2"></i>
                  Date de Vente
                </h4>
                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Date et Heure <span class="text-red-500">*</span>
                  </label>
                  <input
                    [(ngModel)]="currentVente.date"
                    name="dateVente"
                    type="datetime-local"
                    required
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-600 dark:text-white transition-all duration-200 text-sm"
                  />
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
                    class="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-2"
                  >
                    <i class="fas fa-save"></i>
                    <span>{{ isEditMode ? 'Modifier' : 'Créer' }}</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </ng-template>
  `,
})
export class VenteListComponent implements OnInit {
  @ViewChild('venteModalTemplate', { static: true })
  venteModalTemplate!: TemplateRef<any>;
  @ViewChild('importModalTemplate', { static: true })
  importModalTemplate!: TemplateRef<any>;

  ventes: Vente[] = [];
  filteredVentes: Vente[] = [];
  paginatedVentes: Vente[] = [];
  articles: Article[] = [];

  // Loading states
  isLoading = true;
  isLoadingArticles = true;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  // Filters
  searchTerm = '';
  startDate = '';
  endDate = '';
  minAmount: number | null = null;

  // Modals
  isEditMode = false;

  // Current vente for add/edit
  currentVente: Partial<Vente> = {};
  unitPrice = 0;

  // Import
  selectedFile: File | null = null;
  importing = false;

  // Utility
  Math = Math;

  // Toast system
  showToastMessage = false;
  toastMessage = '';
  toastType: 'success' | 'error' | 'info' = 'info';

  constructor(
    private venteService: VenteService,
    private articleService: ArticleService,
    private modalService: ModalService,
    private viewContainerRef: ViewContainerRef
  ) {}

  ngOnInit() {
    this.loadVentes();
    this.loadArticles();
  }
  loadVentes() {
    console.log('Loading ventes...');
    this.isLoading = true;
    this.venteService.getAll().subscribe({
      next: (ventes) => {
        console.log('Ventes loaded:', ventes);
        this.ventes = ventes;
        this.filterVentes();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading ventes:', error);
        console.error('Error details:', {
          status: error.status,
          message: error.message,
          url: error.url,
        });
        this.isLoading = false;
      },
    });
  }

  loadArticles() {
    this.isLoadingArticles = true;
    this.articleService.getAll().subscribe({
      next: (articles) => {
        console.log('Articles loaded:', articles);
        this.articles = articles;
        this.isLoadingArticles = false;
      },
      error: (error) => {
        console.error('Error loading articles:', error);
        this.isLoadingArticles = false;
      },
    });
  }

  filterVentes() {
    let filtered = [...this.ventes];

    // Search term filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (vente) =>
          vente.article?.libelle?.toLowerCase().includes(term) ||
          vente.article?.codeArticle?.toLowerCase().includes(term)
      );
    } // Date range filter
    if (this.startDate) {
      const start = new Date(this.startDate);
      filtered = filtered.filter((vente) => new Date(vente.date) >= start);
    }
    if (this.endDate) {
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((vente) => new Date(vente.date) <= end);
    }

    // Amount filter
    if (this.minAmount !== null) {
      filtered = filtered.filter(
        (vente) =>
          vente.prix_Vente_TND * vente.quantiteFacturee >= this.minAmount!
      );
    }

    this.filteredVentes = filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredVentes.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedVentes = this.filteredVentes.slice(startIndex, endIndex);
  }

  clearFilters() {
    this.searchTerm = '';
    this.startDate = '';
    this.endDate = '';
    this.minAmount = null;
    this.filterVentes();
  }

  openAddModal() {
    this.isEditMode = false;
    this.currentVente = {};
    this.unitPrice = 0;
    this.modalService.openModal(this.venteModalTemplate, this.viewContainerRef);
  }

  openImportModal() {
    this.modalService.openModal(
      this.importModalTemplate,
      this.viewContainerRef
    );
  }

  closeImportModal() {
    this.modalService.closeModal();
    setTimeout(() => {
      this.selectedFile = null;
      this.importing = false;
    }, 300);
  }

  removeSelectedFile() {
    this.selectedFile = null;
  }

  editVente(vente: Vente) {
    this.isEditMode = true;
    this.currentVente = { ...vente };
    this.unitPrice = this.getUnitPrice(vente);
    this.modalService.openModal(this.venteModalTemplate, this.viewContainerRef);
  }

  deleteVente(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette vente ?')) {
      this.venteService.delete(id).subscribe({
        next: () => {
          this.showToast('Vente supprimée avec succès', 'success');
          this.loadVentes();
        },
        error: (error) => {
          console.error('Error deleting vente:', error);
          this.showToast('Erreur lors de la suppression de la vente', 'error');
        },
      });
    }
  }

  saveVente() {
    if (!this.currentVente.date) {
      this.currentVente.date = new Date();
    }

    if (this.isEditMode && this.currentVente.id) {
      this.venteService
        .update(this.currentVente.id, this.currentVente as Vente)
        .subscribe({
          next: () => {
            this.showToast('Vente modifiée avec succès', 'success');
            this.loadVentes();
            this.closeModal();
          },
          error: (error) => {
            console.error('Error updating vente:', error);
            this.showToast(
              'Erreur lors de la modification de la vente',
              'error'
            );
          },
        });
    } else {
      this.venteService.create(this.currentVente as Vente).subscribe({
        next: () => {
          this.showToast('Vente créée avec succès', 'success');
          this.loadVentes();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error creating vente:', error);
          this.showToast('Erreur lors de la création de la vente', 'error');
        },
      });
    }
  }

  closeModal() {
    this.modalService.closeModal();
    setTimeout(() => {
      this.isEditMode = false;
      this.currentVente = {};
      this.unitPrice = 0;
    }, 300);
  }

  onArticleSelected() {
    const selectedArticle = this.articles.find(
      (a) => a.id === this.currentVente.articleId
    );
    if (selectedArticle) {
      this.unitPrice = selectedArticle.prix_Vente_TND;
      this.calculateTotal();
    }
  }

  calculateTotal() {
    if (this.currentVente.quantiteFacturee && this.unitPrice) {
      // We don't need to set montantTotal as it's calculated from prix_Vente_TND * quantiteFacturee
      this.currentVente.prix_Vente_TND = this.unitPrice;
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  importVentes() {
    if (!this.selectedFile) return;

    this.importing = true;
    this.venteService.importVentes(this.selectedFile).subscribe({
      next: (response) => {
        console.log('Import successful:', response);
        this.showToast('Import des ventes réussi', 'success');
        this.closeImportModal();
        this.selectedFile = null;
        this.importing = false;
        this.loadVentes();
      },
      error: (error) => {
        console.error('Import error:', error);
        this.showToast("Erreur lors de l'import des ventes", 'error');
        this.importing = false;
      },
    });
  }

  // Toast methods
  showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToastMessage = true;

    // Auto hide after 3 seconds
    setTimeout(() => {
      this.hideToast();
    }, 3000);
  }

  hideToast() {
    this.showToastMessage = false;
    setTimeout(() => {
      this.toastMessage = '';
      this.toastType = 'info';
    }, 300);
  }

  // Utility methods
  getUnitPrice(vente: Vente): number {
    return vente.quantiteFacturee > 0 ? vente.prix_Vente_TND : 0;
  }

  getTotalSales(): number {
    return this.ventes.length;
  }
  getTotalRevenue(): number {
    return this.ventes.reduce(
      (total, vente) => total + vente.prix_Vente_TND * vente.quantiteFacturee,
      0
    );
  }

  getAverageSaleValue(): number {
    return this.ventes.length > 0
      ? this.getTotalRevenue() / this.ventes.length
      : 0;
  }
  getTotalQuantitySold(): number {
    return this.ventes.reduce(
      (total, vente) => total + vente.quantiteFacturee,
      0
    );
  }

  trackByVente(index: number, vente: Vente): number {
    return vente.id;
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }
}
