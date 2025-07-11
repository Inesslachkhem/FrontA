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
    `,
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800">Categories</h1>
        <div class="flex gap-4">
          <button
            (click)="openImportModal()"
            class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <i class="fas fa-upload mr-2"></i>Import CSV
          </button>
          <button
            (click)="openAddModal()"
            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <i class="fas fa-plus mr-2"></i>Add Category
          </button>
        </div>
      </div>

      <!-- Search -->
      <div class="bg-white rounded-lg shadow-md p-4 mb-6">
        <div class="flex gap-4">
          <div class="flex-1">
            <input
              [(ngModel)]="searchTerm"
              (input)="filterCategories()"
              type="text"
              placeholder="Search categories by name or description..."
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            (click)="clearSearch()"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </div>

      <!-- Categories Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          *ngFor="let category of filteredCategories"
          class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div class="p-6">
            <div class="flex justify-between items-start mb-4">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">
                  {{ category.nom }}
                </h3>
                <p class="text-sm text-gray-600 mb-3">
                  {{ category.description || 'No description' }}
                </p>
                <div class="flex items-center text-sm text-gray-500">
                  <i class="fas fa-tag mr-2"></i>
                  <span>ID: {{ category.idCategorie }}</span>
                </div>
              </div>
              <div class="flex space-x-2">
                <button
                  (click)="editCategory(category)"
                  class="text-indigo-600 hover:text-indigo-900 p-1"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  (click)="deleteCategory(category.idCategorie)"
                  class="text-red-600 hover:text-red-900 p-1"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>

            <!-- Category Stats -->
            <div class="border-t pt-4">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Articles</span>
                <span class="text-sm font-medium text-gray-900">
                  {{ category.articles?.length || 0 }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="filteredCategories.length === 0" class="text-center py-12">
        <i class="fas fa-folder-open text-6xl text-gray-300 mb-4"></i>
        <h3 class="text-xl font-medium text-gray-600 mb-2">
          No categories found
        </h3>
        <p class="text-gray-500">
          {{
            searchTerm
              ? 'Try adjusting your search terms.'
              : 'Get started by creating your first category.'
          }}
        </p>
      </div>

      <!-- Modal Templates -->
      <!-- Add/Edit Modal Template -->
      <ng-template #addEditModalTemplate>
        <div class="modal-content-wrapper">
          <div
            class="relative w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl transform transition-all duration-300 ease-out"
            style="animation: modalSlideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)"
            [class.closing]="isClosingModal"
          >
            <!-- Modal Content -->
            <div class="p-8 space-y-6">
              <!-- Header -->
              <div
                class="flex items-center justify-between pb-4 border-b border-gray-200"
              >
                <div class="flex items-center space-x-3">
                  <!-- Icon -->
                  <div
                    class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center transform transition-transform duration-200 hover:scale-110"
                  >
                    <i
                      class="fas fa-folder-plus text-gray-600 text-lg"
                      *ngIf="showAddModal"
                    ></i>
                    <i
                      class="fas fa-edit text-gray-600 text-lg"
                      *ngIf="showEditModal"
                    ></i>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-900">
                    {{
                      showEditModal
                        ? 'Modifier la catégorie'
                        : 'Nouvelle catégorie'
                    }}
                  </h3>
                </div>
                <button
                  (click)="closeModal()"
                  class="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-lg"
                >
                  <i class="fas fa-times text-lg"></i>
                </button>
              </div>

              <!-- Form -->
              <form (ngSubmit)="saveCategory()" class="space-y-6">
                <!-- Category ID Field -->
                <div class="space-y-2 form-field">
                  <label class="block text-sm font-medium text-gray-700">
                    <i class="fas fa-hashtag mr-2 text-gray-500"></i>
                    ID Catégorie *
                  </label>
                  <input
                    [(ngModel)]="currentCategory.idCategorie"
                    name="idCategorie"
                    type="text"
                    required
                    [readonly]="showEditModal"
                    class="form-input w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 focus:bg-blue-50/30"
                    [ngClass]="{
                      'bg-gray-50 cursor-not-allowed': showEditModal
                    }"
                    placeholder="ex: CAT001"
                  />
                  <p class="text-xs text-gray-500 ml-1">
                    Identifiant unique pour la catégorie
                  </p>
                </div>

                <!-- Name Field -->
                <div class="space-y-2 form-field">
                  <label class="block text-sm font-medium text-gray-700">
                    <i class="fas fa-tag mr-2 text-gray-500"></i>
                    Nom *
                  </label>
                  <input
                    [(ngModel)]="currentCategory.nom"
                    name="nom"
                    type="text"
                    required
                    class="form-input w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 focus:bg-blue-50/30"
                    placeholder="ex: Électronique"
                  />
                </div>

                <!-- Description Field -->
                <div class="space-y-2 form-field">
                  <label class="block text-sm font-medium text-gray-700">
                    <i class="fas fa-align-left mr-2 text-gray-500"></i>
                    Description
                  </label>
                  <textarea
                    [(ngModel)]="currentCategory.description"
                    name="description"
                    rows="3"
                    class="form-input w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 resize-none focus:bg-blue-50/30"
                    placeholder="Description de la catégorie..."
                  ></textarea>
                </div>

                <!-- Action Buttons -->
                <div
                  class="flex space-x-3 pt-6 border-t border-gray-200 form-field"
                >
                  <button
                    type="button"
                    (click)="closeModal()"
                    class="btn-hover flex-1 py-3 px-6 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
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
            class="relative w-full max-w-lg mx-auto bg-white rounded-2xl shadow-2xl transform transition-all duration-300 ease-out"
            style="animation: modalSlideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)"
            [class.closing]="isClosingModal"
          >
            <div class="p-6">
              <div
                class="flex items-center justify-between pb-4 border-b border-gray-200"
              >
                <div class="flex items-center space-x-3">
                  <div
                    class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center"
                  >
                    <i class="fas fa-upload text-green-600 text-lg"></i>
                  </div>
                  <h3 class="text-xl font-semibold text-gray-900">
                    Importer des catégories
                  </h3>
                </div>
                <button
                  (click)="closeImportModal()"
                  class="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-lg"
                >
                  <i class="fas fa-times text-lg"></i>
                </button>
              </div>

              <div class="space-y-4 mt-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Sélectionner un fichier CSV
                  </label>
                  <input
                    #fileInput
                    type="file"
                    accept=".csv"
                    (change)="onFileSelected($event)"
                    class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <div class="mt-3 text-xs text-gray-500 space-y-2">
                    <p>
                      <strong>Le CSV doit contenir :</strong> IdCategorie, Nom,
                      Description
                    </p>
                    <div
                      class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700"
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
                  class="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg"
                >
                  <strong>Fichier sélectionné :</strong> {{ selectedFile.name }}
                  <span class="text-gray-500"
                    >({{ (selectedFile.size / 1024).toFixed(2) }} KB)</span
                  >
                </div>

                <div class="flex space-x-3 pt-4 border-t border-gray-200">
                  <button
                    (click)="closeImportModal()"
                    class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all duration-200"
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

      <!-- Success/Error Messages -->
      <div *ngIf="message" class="fixed bottom-4 right-4 max-w-sm w-full z-50">
        <div
          [class]="messageType === 'success' ? 'bg-green-500' : 'bg-red-500'"
          class="text-white px-4 py-3 rounded-lg shadow-lg"
        >
          <div class="flex items-center justify-between">
            <span>{{ message }}</span>
            <button
              (click)="message = ''"
              class="text-white hover:text-gray-200"
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

  constructor(
    private categorieService: CategorieService,
    private modalService: ModalService,
    private viewContainerRef: ViewContainerRef
  ) {}

  ngOnInit() {
    this.loadCategories();
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
    if (
      confirm(
        'Are you sure you want to delete this category? This action cannot be undone.'
      )
    ) {
      this.categorieService.delete(id).subscribe({
        next: () => {
          this.loadCategories();
          this.showMessage('Category deleted successfully', 'success');
        },
        error: (error) => {
          console.error('Error deleting category:', error);
          this.showMessage('Error deleting category', 'error');
        },
      });
    }
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

    // Show warning confirmation
    const confirmed = confirm(
      `⚠️ COMPLETE DATABASE REPLACEMENT WARNING!\n\nThis action will:\n✗ Delete ALL existing categories\n✗ Delete ALL existing articles\n✗ Delete ALL existing stocks\n✗ Delete ALL existing sales\n\nAnd replace everything with data from: ${this.selectedFile.name}\n\nThis action CANNOT be undone!\n\nAre you absolutely sure you want to proceed?`
    );

    if (!confirmed) {
      return;
    }

    console.log('Starting import for file:', this.selectedFile.name);
    console.log('File size:', this.selectedFile.size, 'bytes');
    console.log('File type:', this.selectedFile.type);

    this.importing = true;
    this.categorieService.importCategories(this.selectedFile).subscribe({
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

        // Show detailed errors in alert for debugging
        if (detailedErrors.length > 0) {
          alert(
            `CSV Import Errors:\n\n${detailedErrors.join(
              '\n'
            )}\n\nPlease fix these issues and try again.`
          );
        }

        this.showMessage(errorMessage, 'error');
      },
    });
  }

  showMessage(message: string, type: 'success' | 'error') {
    this.message = message;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }
}
