import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Categorie } from '../../models/article.model';
import { CategorieService } from '../../services/categorie.service';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800">Categories</h1>
        <div class="flex gap-4">
          <button
            (click)="showImportModal = true"
            class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <i class="fas fa-upload mr-2"></i>Import CSV
          </button>
          <button
            (click)="showAddModal = true"
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

      <!-- Add/Edit Modal -->
      <div
        *ngIf="showAddModal || showEditModal"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      >
        <div
          class="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white"
        >
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold">
              {{ showEditModal ? 'Edit' : 'Add' }} Category
            </h3>
            <button
              (click)="closeModal()"
              class="text-gray-400 hover:text-gray-600"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>

          <form (ngSubmit)="saveCategory()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700"
                >Category ID *</label
              >
              <input
                [(ngModel)]="currentCategory.idCategorie"
                name="idCategorie"
                type="text"
                required
                [readonly]="showEditModal"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                [class.bg-gray-50]="showEditModal"
              />
              <p class="text-xs text-gray-500 mt-1">
                Unique identifier for the category
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700"
                >Name *</label
              >
              <input
                [(ngModel)]="currentCategory.nom"
                name="nom"
                type="text"
                required
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700"
                >Description</label
              >
              <textarea
                [(ngModel)]="currentCategory.description"
                name="description"
                rows="3"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter category description..."
              ></textarea>
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
                class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                {{ showEditModal ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Import Modal -->
      <div
        *ngIf="showImportModal"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      >
        <div
          class="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white"
        >
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold">Import Categories</h3>
            <button
              (click)="showImportModal = false"
              class="text-gray-400 hover:text-gray-600"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Select CSV File</label
              >
              <input
                #fileInput
                type="file"
                accept=".csv"
                (change)="onFileSelected($event)"
                class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <div class="mt-2 text-xs text-gray-500">
                <p>
                  <strong>CSV should contain:</strong> IdCategorie, Nom,
                  Description
                </p>
                <div
                  class="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700"
                >
                  <p>
                    <strong>⚠️ WARNING:</strong> This will completely replace
                    ALL data in the database!
                  </p>
                  <p>
                    All existing categories, articles, stocks, and
                    sales will be deleted.
                  </p>
                </div>
              </div>
            </div>

            <div *ngIf="selectedFile" class="text-sm text-gray-600">
              Selected: {{ selectedFile.name }} ({{
                (selectedFile.size / 1024).toFixed(2)
              }}
              KB)
            </div>

            <div class="flex justify-end space-x-2">
              <button
                (click)="showImportModal = false"
                class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                (click)="importCategories()"
                [disabled]="!selectedFile || importing"
                class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
              >
                <span *ngIf="importing">
                  <i class="fas fa-spinner fa-spin mr-2"></i>Importing...
                </span>
                <span *ngIf="!importing">Import</span>
              </button>
            </div>
          </div>
        </div>
      </div>

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
  categories: Categorie[] = [];
  filteredCategories: Categorie[] = [];

  // Search
  searchTerm = '';

  // Modals
  showAddModal = false;
  showEditModal = false;
  showImportModal = false;

  // Current category for add/edit
  currentCategory: Partial<Categorie> = {};

  // Import
  selectedFile: File | null = null;
  importing = false;

  // Messages
  message = '';
  messageType: 'success' | 'error' = 'success';

  constructor(private categorieService: CategorieService) {}

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
    this.showAddModal = false;
    this.showEditModal = false;
    this.currentCategory = {};
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
        this.showImportModal = false;
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
