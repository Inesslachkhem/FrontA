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
import { Categorie } from '../../models/article.model';
import { CategorieService } from '../../services/categorie.service';
import { ModalService } from '../../services/modal.service';
import { ConfirmationService } from '../../services/confirmation.service';

@Component({
  selector: 'app-category-list',
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
          backdrop-filter: blur(8px);
        }
      }

      @keyframes modalBackdropFadeOut {
        0% {
          opacity: 1;
          backdrop-filter: blur(8px);
        }
        100% {
          opacity: 0;
          backdrop-filter: blur(0px);
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

      @keyframes modalSlideOut {
        0% {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0px);
        }
        100% {
          opacity: 0;
          transform: translateY(-30px) scale(0.95);
          filter: blur(2px);
        }
      }

      /* Enhanced backdrop blur */
      .modal-backdrop {
        backdrop-filter: blur(12px) saturate(180%);
        -webkit-backdrop-filter: blur(12px) saturate(180%);
        background: rgba(0, 0, 0, 0.6);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100vw;
        height: 100vh;
      }

      .modal-backdrop.closing {
        animation: modalBackdropFadeOut 0.3s cubic-bezier(0.4, 0, 0.6, 1);
      }

      /* Modal container with enhanced animation */
      .modal-container {
        animation: modalSlideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        will-change: transform, opacity, filter;
      }

      .modal-container.closing {
        animation: modalSlideOut 0.3s cubic-bezier(0.4, 0, 0.6, 1);
      }

      /* Micro interactions */
      .form-input {
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .form-input:focus {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
      }

      .btn-hover {
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .btn-hover:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .btn-hover:active {
        transform: translateY(0);
      }

      /* Stagger animations for form fields */
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

      /* Loading spinner */
      .spinner {
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      /* Theme Styles - Light/Dark Mode */
      .light-theme {
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        color: #1f2937;
      }

      .dark-theme {
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        color: #f8fafc;
      }

      /* Glass effects for both themes - Fixed Light Mode */
      .glass-light {
        background: rgba(255, 255, 255, 0.9) !important;
        backdrop-filter: blur(20px) saturate(150%);
        -webkit-backdrop-filter: blur(20px) saturate(150%);
        border: 1px solid rgba(59, 130, 246, 0.2);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      }

      .glass-dark {
        background: rgba(30, 41, 59, 0.85) !important;
        backdrop-filter: blur(16px) saturate(180%);
        -webkit-backdrop-filter: blur(16px) saturate(180%);
        border: 1px solid rgba(148, 163, 184, 0.3);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      }

      /* Glass buttons */
      .glass-btn-light {
        background: rgba(248, 250, 252, 0.9) !important;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(203, 213, 225, 0.6);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .glass-btn-light:hover {
        background: rgba(255, 255, 255, 0.95) !important;
        border-color: rgba(59, 130, 246, 0.6);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
      }

      .glass-btn-dark {
        background: rgba(148, 163, 184, 0.3) !important;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(148, 163, 184, 0.4);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .glass-btn-dark:hover {
        background: rgba(148, 163, 184, 0.5) !important;
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
      }

      /* Input styles for themes - Fixed Light Mode */
      .input-light {
        background: rgba(248, 250, 252, 0.9);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(203, 213, 225, 0.6);
        color: #1e293b;
      }

      .input-light:focus {
        background: rgba(255, 255, 255, 0.95);
        border-color: rgba(59, 130, 246, 0.6);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      .input-light::placeholder {
        color: #64748b;
      }

      .input-dark {
        background: rgba(30, 41, 59, 0.8);
        border: 1px solid #475569;
        color: #f8fafc;
      }

      .input-dark:focus {
        background: rgba(30, 41, 59, 0.9);
        border-color: #60a5fa;
        box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
      }

      /* Toast animation */
      @keyframes slideInFromRight {
        0% {
          opacity: 0;
          transform: translateX(100px);
        }
        100% {
          opacity: 1;
          transform: translateX(0);
        }
      }
    `,
  ],
  template: `
    <div
      class="min-h-screen transition-all duration-500 ease-in-out bg-gray-50 dark:bg-gray-900"
    >
      <div class="container mx-auto px-4 py-8">
        <!-- Header -->
        <div class="flex justify-between items-center mb-8">
          <div class="flex items-center space-x-4">
            <div
              class="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <i
                class="fas fa-layer-group text-xl text-gray-600 dark:text-gray-400"
              ></i>
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                Catégories
              </h1>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Gérer les catégories de produits
              </p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3">
            <button
              (click)="openImportModal()"
              class="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-green-600 dark:hover:text-green-400"
            >
              <i class="fas fa-upload"></i>
              <span>Importer CSV</span>
            </button>
            <button
              (click)="openAddModal()"
              class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-300 flex items-center space-x-2"
            >
              <i class="fas fa-plus"></i>
              <span>Nouvelle Catégorie</span>
            </button>
          </div>
        </div>

        <!-- Search Section -->
        <div
          class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 mb-8 shadow-sm"
        >
          <div class="flex items-center space-x-4">
            <div
              class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center"
            >
              <i class="fas fa-search text-blue-600 dark:text-blue-400"></i>
            </div>
            <div class="flex-1">
              <input
                [(ngModel)]="searchTerm"
                (input)="filterCategories()"
                type="text"
                placeholder="Rechercher par nom ou description..."
                class="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              />
            </div>
            <button
              (click)="clearSearch()"
              class="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-medium transition-all duration-300 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-red-600 dark:hover:text-red-400"
            >
              <i class="fas fa-times mr-2"></i>
              Effacer
            </button>
          </div>

          <!-- Search Stats -->
          <div
            class="mt-4 flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400"
          >
            <i class="fas fa-info-circle"></i>
            <span>{{ filteredCategories.length }} catégorie(s) trouvée(s)</span>
          </div>
        </div>

        <!-- Categories Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            *ngFor="
              let category of filteredCategories;
              trackBy: trackByCategory
            "
            class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-lg group"
          >
            <!-- Category Header -->
            <div class="flex justify-between items-start mb-4">
              <div class="flex-1">
                <h3
                  class="text-lg font-semibold mb-2 text-gray-900 dark:text-white"
                >
                  {{ category.nom }}
                </h3>
                <p class="text-sm mb-3 text-gray-600 dark:text-gray-300">
                  {{ category.description || 'Aucune description' }}
                </p>
                <div
                  class="flex items-center text-sm text-gray-500 dark:text-gray-400"
                >
                  <i class="fas fa-tag mr-2"></i>
                  <span>ID: {{ category.idCategorie }}</span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div
                class="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <button
                  (click)="editCategory(category)"
                  class="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                >
                  <i class="fas fa-edit text-sm"></i>
                </button>
                <button
                  (click)="deleteCategory(category.idCategorie)"
                  class="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
                >
                  <i class="fas fa-trash text-sm"></i>
                </button>
              </div>
            </div>

            <!-- Category Stats -->
            <div class="border-t border-gray-200 dark:border-gray-600 pt-4">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600 dark:text-gray-300"
                  >Articles</span
                >
                <div
                  class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-lg text-xs font-medium"
                >
                  {{ category.articles?.length || 0 }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          *ngIf="filteredCategories.length === 0"
          class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-center py-16 rounded-2xl shadow-sm"
        >
          <div
            class="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6"
          >
            <i
              class="fas fa-folder-open text-3xl text-gray-400 dark:text-gray-500"
            ></i>
          </div>
          <h3 class="text-xl font-medium mb-2 text-gray-600 dark:text-gray-300">
            Aucune catégorie trouvée
          </h3>
          <p class="text-gray-500 dark:text-gray-400">
            {{
              searchTerm
                ? 'Essayez d ajuster vos termes de recherche.'
                : 'Commencez par créer votre première catégorie.'
            }}
          </p>
          <button
            *ngIf="!searchTerm"
            (click)="openAddModal()"
            class="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-300"
          >
            <i class="fas fa-plus mr-2"></i>
            Créer une catégorie
          </button>
        </div>

        <!-- Modal Templates -->
        <!-- Add/Edit Modal Template -->
        <ng-template #addEditModalTemplate>
          <div class="modal-content-wrapper">
            <div
              class="relative w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transform transition-all duration-300 ease-out border border-gray-200 dark:border-gray-700"
              style="animation: modalSlideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)"
              [class.closing]="isClosingModal"
            >
              <!-- Modal Content -->
              <div class="p-8 space-y-6">
                <!-- Header -->
                <div
                  class="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-600"
                >
                  <div class="flex items-center space-x-3">
                    <!-- Icon -->
                    <div
                      class="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center transform transition-transform duration-200 hover:scale-110"
                    >
                      <i
                        class="fas fa-folder-plus text-gray-600 dark:text-gray-400 text-lg"
                        *ngIf="showAddModal"
                      ></i>
                      <i
                        class="fas fa-edit text-gray-600 dark:text-gray-400 text-lg"
                        *ngIf="showEditModal"
                      ></i>
                    </div>
                    <h3
                      class="text-xl font-semibold text-gray-900 dark:text-white"
                    >
                      {{
                        showEditModal
                          ? 'Modifier la catégorie'
                          : 'Nouvelle catégorie'
                      }}
                    </h3>
                  </div>
                  <button
                    (click)="closeModal()"
                    class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <i class="fas fa-times text-lg"></i>
                  </button>
                </div>

                <!-- Form -->
                <form (ngSubmit)="saveCategory()" class="space-y-6">
                  <!-- Category ID Field -->
                  <div class="space-y-2 form-field">
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      <i
                        class="fas fa-hashtag mr-2 text-gray-500 dark:text-gray-400"
                      ></i>
                      ID Catégorie *
                    </label>
                    <input
                      [(ngModel)]="currentCategory.idCategorie"
                      name="idCategorie"
                      type="text"
                      required
                      [readonly]="showEditModal"
                      class="form-input w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                      [ngClass]="{
                        'bg-gray-50 dark:bg-gray-600 cursor-not-allowed':
                          showEditModal
                      }"
                      placeholder="ex: CAT001"
                    />
                    <p class="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      Identifiant unique pour la catégorie
                    </p>
                  </div>

                  <!-- Name Field -->
                  <div class="space-y-2 form-field">
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      <i
                        class="fas fa-tag mr-2 text-gray-500 dark:text-gray-400"
                      ></i>
                      Nom *
                    </label>
                    <input
                      [(ngModel)]="currentCategory.nom"
                      name="nom"
                      type="text"
                      required
                      class="form-input w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                      placeholder="ex: Électronique"
                    />
                  </div>

                  <!-- Description Field -->
                  <div class="space-y-2 form-field">
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      <i
                        class="fas fa-align-left mr-2 text-gray-500 dark:text-gray-400"
                      ></i>
                      Description
                    </label>
                    <textarea
                      [(ngModel)]="currentCategory.description"
                      name="description"
                      rows="3"
                      class="form-input w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500 resize-none"
                      placeholder="Description de la catégorie..."
                    ></textarea>
                  </div>

                  <!-- Action Buttons -->
                  <div
                    class="flex space-x-3 pt-6 border-t border-gray-200 dark:border-gray-600 form-field"
                  >
                    <button
                      type="button"
                      (click)="closeModal()"
                      class="btn-hover flex-1 py-3 px-6 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 font-medium"
                    >
                      <i class="fas fa-times mr-2"></i>
                      Annuler
                    </button>
                    <button
                      type="submit"
                      class="btn-hover flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
                    >
                      <i class="fas fa-save mr-2"></i>
                      {{ showEditModal ? 'Mettre à jour' : 'Créer' }}
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
              class="relative w-full max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transform transition-all duration-300 ease-out border border-gray-200 dark:border-gray-700"
              style="animation: modalSlideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)"
              [class.closing]="isClosingModal"
            >
              <div class="p-6">
                <div
                  class="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-600"
                >
                  <div class="flex items-center space-x-3">
                    <div
                      class="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center"
                    >
                      <i
                        class="fas fa-upload text-green-600 dark:text-green-400 text-lg"
                      ></i>
                    </div>
                    <h3
                      class="text-xl font-semibold text-gray-900 dark:text-white"
                    >
                      Importer des catégories
                    </h3>
                  </div>
                  <button
                    (click)="closeImportModal()"
                    class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <i class="fas fa-times text-lg"></i>
                  </button>
                </div>

                <div class="space-y-4 mt-6">
                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Sélectionner un fichier CSV
                    </label>
                    <input
                      #fileInput
                      type="file"
                      accept=".csv"
                      (change)="onFileSelected($event)"
                      class="block w-full text-sm text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50"
                    />
                    <div
                      class="mt-3 text-xs text-gray-500 dark:text-gray-400 space-y-2"
                    >
                      <p>
                        <strong>Le CSV doit contenir :</strong> IdCategorie,
                        Nom, Description
                      </p>
                      <div
                        class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400"
                      >
                        <p class="font-medium">⚠️ ATTENTION :</p>
                        <p class="text-sm mt-1">
                          Ceci remplacera complètement TOUTES les données de la
                          base !
                        </p>
                        <p class="text-sm">
                          Toutes les catégories, articles, stocks et ventes
                          existants seront supprimés.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    *ngIf="selectedFile"
                    class="text-sm text-gray-600 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <strong>Fichier sélectionné :</strong>
                    {{ selectedFile.name }}
                    <span class="text-gray-500 dark:text-gray-400"
                      >({{ (selectedFile.size / 1024).toFixed(2) }} KB)</span
                    >
                  </div>

                  <div
                    class="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600"
                  >
                    <button
                      (click)="closeImportModal()"
                      class="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-all duration-200"
                    >
                      Annuler
                    </button>
                    <button
                      (click)="importCategories()"
                      [disabled]="!selectedFile || importing"
                      class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 flex items-center justify-center"
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

      <!-- Toast Notifications -->
      <div
        *ngIf="message"
        class="fixed bottom-6 right-6 max-w-sm w-full z-50 animate-pulse"
      >
        <div
          class="px-6 py-4 rounded-2xl shadow-2xl backdrop-filter backdrop-blur-sm transition-all duration-300"
          [ngClass]="{
            'bg-green-500/90 text-white border border-green-400':
              messageType === 'success',
            'bg-red-500/90 text-white border border-red-400':
              messageType === 'error'
          }"
          style="animation: slideInFromRight 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <i
                class="text-lg"
                [ngClass]="{
                  'fas fa-check-circle': messageType === 'success',
                  'fas fa-exclamation-circle': messageType === 'error'
                }"
              ></i>
              <span class="font-medium">{{ message }}</span>
            </div>
            <button
              (click)="message = ''"
              class="text-white/80 hover:text-white transition-colors duration-200 ml-4"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CategoryListComponent implements OnInit {
  @ViewChild('addEditModalTemplate', { static: false })
  addEditModalTemplate!: TemplateRef<any>;
  @ViewChild('importModalTemplate', { static: false })
  importModalTemplate!: TemplateRef<any>;

  categories: Categorie[] = [];
  filteredCategories: Categorie[] = [];

  // Search
  searchTerm = '';

  // Modals
  showAddModal = false;
  showEditModal = false;
  showImportModal = false;

  // Modal animation states
  isClosingModal = false;

  // Current category for add/edit
  currentCategory: Partial<Categorie> = {};

  // Import
  selectedFile: File | null = null;
  importing = false;

  // Messages
  message = '';
  messageType: 'success' | 'error' = 'success';

  // Theme
  isDarkMode = false;

  constructor(
    private categorieService: CategorieService,
    private modalService: ModalService,
    private viewContainerRef: ViewContainerRef,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadCategories();
    // Load theme preference from localStorage and listen for changes
    this.initializeTheme();
    this.listenForThemeChanges();
  }

  private initializeTheme() {
    const savedTheme = localStorage.getItem('isDarkMode');
    this.isDarkMode = savedTheme === 'true';

    // Debug logging
    console.log('localStorage isDarkMode value:', savedTheme);
    console.log('Initial theme loaded:', this.isDarkMode ? 'dark' : 'light');

    // If no theme is set, default to light mode
    if (savedTheme === null) {
      this.isDarkMode = false;
      localStorage.setItem('isDarkMode', 'false');
      console.log('No theme found, defaulting to light mode');
    }
  }

  private listenForThemeChanges() {
    // Listen for storage changes (theme toggle from navbar)
    window.addEventListener('storage', (e) => {
      if (e.key === 'isDarkMode') {
        this.isDarkMode = e.newValue === 'true';
        console.log(
          'Theme changed via storage event:',
          this.isDarkMode ? 'dark' : 'light'
        );
      }
    });

    // Also check for changes every 500ms (more responsive)
    setInterval(() => {
      const currentTheme = localStorage.getItem('isDarkMode') === 'true';
      if (currentTheme !== this.isDarkMode) {
        this.isDarkMode = currentTheme;
        console.log(
          'Theme changed via polling:',
          this.isDarkMode ? 'dark' : 'light'
        );
      }
    }, 500);
  }

  loadCategories() {
    this.categorieService.getAll().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.filterCategories();
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.showMessage('Error loading categories', 'error');
      },
    });
  }

  filterCategories() {
    if (!this.searchTerm) {
      this.filteredCategories = [...this.categories];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredCategories = this.categories.filter(
        (category) =>
          category.nom.toLowerCase().includes(term) ||
          category.idCategorie.toLowerCase().includes(term) ||
          (category.description &&
            category.description.toLowerCase().includes(term))
      );
    }
  }

  clearSearch() {
    this.searchTerm = '';
    this.filterCategories();
  }

  editCategory(category: Categorie) {
    this.currentCategory = { ...category };
    this.showEditModal = true;
    this.openAddEditModal();
  }

  openAddModal() {
    console.log('Opening add modal...');
    this.showAddModal = true;
    this.currentCategory = {};
    // Use setTimeout to ensure ViewChild is available
    setTimeout(() => {
      this.openAddEditModal();
    }, 0);
  }

  openImportModal() {
    console.log('Opening import modal...');
    this.showImportModal = true;
    // Use setTimeout to ensure ViewChild is available
    setTimeout(() => {
      if (this.importModalTemplate) {
        this.modalService.openModal(
          this.importModalTemplate,
          this.viewContainerRef
        );
      } else {
        console.error('Import modal template not found!');
      }
    }, 0);
  }

  openAddEditModal() {
    console.log('Opening add/edit modal template...');
    if (this.addEditModalTemplate) {
      console.log('Template found, opening modal...');
      this.modalService.openModal(
        this.addEditModalTemplate,
        this.viewContainerRef
      );
    } else {
      console.error('Add/Edit modal template not found!');
    }
  }

  deleteCategory(id: string) {
    this.confirmationService
      .confirmDelete('this category')
      .subscribe((confirmed) => {
        if (confirmed) {
          this.categorieService.delete(id).subscribe({
            next: () => {
              this.loadCategories();
              this.showMessage('Category deleted successfully', 'success');
            },
            error: (error) => {
              console.error('Error deleting category:', error);

              let errorMessage = 'Error deleting category';

              // Handle specific error cases
              if (error.status === 400 && error.error?.error) {
                // Category has associated articles
                errorMessage = error.error.error;

                // Show detailed confirmation for categories with articles
                this.confirmationService
                  .confirmInfo('Cannot Delete Category', errorMessage, 'OK')
                  .subscribe();
              } else if (error.status === 404) {
                errorMessage = 'Category not found';
              } else if (error.status === 500) {
                errorMessage =
                  error.error?.error || 'Internal server error occurred';
              } else if (error.error?.message) {
                errorMessage = error.error.message;
              }

              this.showMessage(errorMessage, 'error');
            },
          });
        }
      });
  }

  saveCategory() {
    if (this.showEditModal && this.currentCategory.idCategorie) {
      this.categorieService
        .update(
          this.currentCategory.idCategorie,
          this.currentCategory as Categorie
        )
        .subscribe({
          next: () => {
            this.loadCategories();
            this.closeModal();
            this.showMessage('Category updated successfully', 'success');
          },
          error: (error) => {
            console.error('Error updating category:', error);
            this.showMessage('Error updating category', 'error');
          },
        });
    } else {
      this.categorieService
        .create(this.currentCategory as Categorie)
        .subscribe({
          next: () => {
            this.loadCategories();
            this.closeModal();
            this.showMessage('Category created successfully', 'success');
          },
          error: (error) => {
            console.error('Error creating category:', error);
            this.showMessage('Error creating category', 'error');
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
      this.currentCategory = {};
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
  importCategories() {
    if (!this.selectedFile) return;

    // Show warning confirmation using custom modal
    this.confirmationService
      .confirmDangerousAction(
        '⚠️ COMPLETE DATABASE REPLACEMENT WARNING!',
        `This action will:
      
✗ Delete ALL existing categories
✗ Delete ALL existing articles  
✗ Delete ALL existing stocks
✗ Delete ALL existing sales

And replace everything with data from: ${this.selectedFile.name}

This action CANNOT be undone!

Are you absolutely sure you want to proceed?`,
        'Yes, Replace Everything'
      )
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }

        console.log('Starting import for file:', this.selectedFile!.name);
        console.log('File size:', this.selectedFile!.size, 'bytes');
        console.log('File type:', this.selectedFile!.type);

        this.importing = true;
        this.categorieService.importCategories(this.selectedFile!).subscribe({
          next: (response) => {
            console.log('Import successful:', response);
            this.closeImportModal();
            this.selectedFile = null;
            this.importing = false;
            this.loadCategories();
            this.showMessage(
              response.Message || 'Categories imported successfully',
              'success'
            );
          },
          error: (error) => {
            console.error('Import error details:', error);
            this.importing = false;

            let errorMessage = 'Error importing categories';
            let detailedErrors: string[] = [];

            if (error.error) {
              if (error.error.error) {
                errorMessage = error.error.error;
              } else if (error.error.Error) {
                errorMessage = error.error.Error;
              } else if (error.error.details) {
                detailedErrors = error.error.details;
                errorMessage = `CSV Validation Errors (${
                  detailedErrors.length
                } issues found):\n${detailedErrors.join('\n')}`;
              } else if (typeof error.error === 'string') {
                errorMessage = error.error;
              }
            } else if (error.message) {
              errorMessage = error.message;
            }

            console.error('Processed error message:', errorMessage);
            console.error('Detailed errors:', detailedErrors);

            // Show detailed errors in custom confirmation for debugging
            if (detailedErrors.length > 0) {
              this.confirmationService
                .confirmInfo(
                  'CSV Import Errors',
                  `CSV Import Errors:\n\n${detailedErrors.join(
                    '\n'
                  )}\n\nPlease fix these issues and try again.`,
                  'OK'
                )
                .subscribe();
            }

            this.showMessage(errorMessage, 'error');
          },
        });
      });
  }

  showMessage(message: string, type: 'success' | 'error') {
    this.message = message;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }

  trackByCategory(index: number, category: Categorie): string {
    return category.idCategorie;
  }
}
