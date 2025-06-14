import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Article, Categorie } from '../../models/article.model';
import { ArticleService } from '../../services/article.service';
import { CategorieService } from '../../services/categorie.service';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800">Articles</h1>
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
            <i class="fas fa-plus mr-2"></i>Add Article
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-md p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            [(ngModel)]="searchTerm"
            (input)="filterArticles()"
            type="text"
            placeholder="Search articles..."
            class="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            [(ngModel)]="selectedCategory"
            (change)="filterArticles()"
            class="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            <option
              *ngFor="let category of categories"
              [value]="category.idCategorie"
            >
              {{ category.nom }}
            </option>
          </select>

          <input
            [(ngModel)]="minPrice"
            (input)="filterArticles()"
            type="number"
            placeholder="Min Price"
            class="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            [(ngModel)]="maxPrice"
            (input)="filterArticles()"
            type="number"
            placeholder="Max Price"
            class="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <!-- Articles Table -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Code
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Product
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Category
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Price
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Supplier
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                *ngFor="let article of filteredArticles"
                class="hover:bg-gray-50"
              >
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                >
                  {{ article.codeArticle }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ article.libelle }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ article.codeBarre }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ article.idCategorie }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ article.prix_Vente_TND | currency : 'TND' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ article.fournisseur }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    (click)="editArticle(article)"
                    class="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    (click)="deleteArticle(article.id)"
                    class="text-red-600 hover:text-red-900"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div class="flex justify-between items-center mt-6">
        <div class="text-sm text-gray-700">
          Showing {{ (currentPage - 1) * pageSize + 1 }} to
          {{ Math.min(currentPage * pageSize, filteredArticles.length) }} of
          {{ filteredArticles.length }} results
        </div>
        <div class="flex gap-2">
          <button
            (click)="previousPage()"
            [disabled]="currentPage === 1"
            class="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span class="px-3 py-1"
            >Page {{ currentPage }} of {{ totalPages }}</span
          >
          <button
            (click)="nextPage()"
            [disabled]="currentPage === totalPages"
            class="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div
        *ngIf="showAddModal || showEditModal"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      >
        <div
          class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white"
        >
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold">
              {{ showEditModal ? 'Edit' : 'Add' }} Article
            </h3>
            <button
              (click)="closeModal()"
              class="text-gray-400 hover:text-gray-600"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>

          <form (ngSubmit)="saveArticle()" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Code Article *</label
                >
                <input
                  [(ngModel)]="currentArticle.codeArticle"
                  name="codeArticle"
                  type="text"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Code Barre</label
                >
                <input
                  [(ngModel)]="currentArticle.codeBarre"
                  name="codeBarre"
                  type="text"
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700"
                  >Libellé *</label
                >
                <input
                  [(ngModel)]="currentArticle.libelle"
                  name="libelle"
                  type="text"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Prix Vente (TND)</label
                >
                <input
                  [(ngModel)]="currentArticle.prix_Vente_TND"
                  name="prixVente"
                  type="number"
                  step="0.01"
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Prix Achat (TND)</label
                >
                <input
                  [(ngModel)]="currentArticle.prix_Achat_TND"
                  name="prixAchat"
                  type="number"
                  step="0.01"
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Fournisseur</label
                >
                <input
                  [(ngModel)]="currentArticle.fournisseur"
                  name="fournisseur"
                  type="text"
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Catégorie</label
                >
                <select
                  [(ngModel)]="currentArticle.idCategorie"
                  name="idCategorie"
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  <option
                    *ngFor="let category of categories"
                    [value]="category.idCategorie"
                  >
                    {{ category.nom }}
                  </option>
                </select>
              </div>
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
            <h3 class="text-lg font-bold">Import Articles</h3>
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
                (click)="importArticles()"
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
    </div>
  `,
})
export class ArticleListComponent implements OnInit {
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

  // Current article for add/edit
  currentArticle: Partial<Article> = {};

  // Import
  selectedFile: File | null = null;
  importing = false;

  // Utility
  Math = Math;

  constructor(
    private articleService: ArticleService,
    private categorieService: CategorieService
  ) {}

  ngOnInit() {
    this.loadArticles();
    this.loadCategories();
  }

  loadArticles() {
    this.articleService.getAll().subscribe({
      next: (articles) => {
        this.articles = articles;
        this.filterArticles();
      },
      error: (error) => {
        console.error('Error loading articles:', error);
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
  }

  deleteArticle(id: number) {
    if (confirm('Are you sure you want to delete this article?')) {
      this.articleService.delete(id).subscribe({
        next: () => {
          this.loadArticles();
        },
        error: (error) => {
          console.error('Error deleting article:', error);
        },
      });
    }
  }

  saveArticle() {
    if (this.showEditModal && this.currentArticle.id) {
      this.articleService
        .update(this.currentArticle.id, this.currentArticle as Article)
        .subscribe({
          next: () => {
            this.loadArticles();
            this.closeModal();
          },
          error: (error) => {
            console.error('Error updating article:', error);
          },
        });
    } else {
      this.articleService.create(this.currentArticle as Article).subscribe({
        next: () => {
          this.loadArticles();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error creating article:', error);
        },
      });
    }
  }

  closeModal() {
    this.showAddModal = false;
    this.showEditModal = false;
    this.currentArticle = {};
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  importArticles() {
    if (!this.selectedFile) return;

    this.importing = true;
    this.articleService.importArticles(this.selectedFile).subscribe({
      next: (response) => {
        console.log('Import successful:', response);
        this.showImportModal = false;
        this.selectedFile = null;
        this.importing = false;
        this.loadArticles();
      },
      error: (error) => {
        console.error('Import error:', error);
        this.importing = false;
      },
    });
  }

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
