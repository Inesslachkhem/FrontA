import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Stock, Article } from '../../models/article.model';
import { StockService } from '../../services/stock.service';
import { ArticleService } from '../../services/article.service';

@Component({
  selector: 'app-stock-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800">Stock Management</h1>
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
            <i class="fas fa-plus mr-2"></i>Add Stock
          </button>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="mb-6">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button
              (click)="activeTab = 'all'; filterStocks()"
              [class]="
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
              "
            >
              All Stock
            </button>
            <button
              (click)="activeTab = 'low'; filterStocks()"
              [class]="
                activeTab === 'low'
                  ? 'border-red-500 text-red-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
              "
            >
              Low Stock
              <span
                class="ml-2 bg-red-100 text-red-900 py-0.5 px-2.5 rounded-full text-xs"
              >
                {{ lowStockCount }}
              </span>
            </button>
            <button
              (click)="activeTab = 'out'; filterStocks()"
              [class]="
                activeTab === 'out'
                  ? 'border-red-500 text-red-600 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
              "
            >
              Out of Stock
              <span
                class="ml-2 bg-red-100 text-red-900 py-0.5 px-2.5 rounded-full text-xs"
              >
                {{ outOfStockCount }}
              </span>
            </button>
          </nav>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-md p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            [(ngModel)]="searchTerm"
            (input)="filterStocks()"
            type="text"
            placeholder="Search by article code or name..."
            class="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            [(ngModel)]="minQuantity"
            (input)="filterStocks()"
            type="number"
            placeholder="Min Quantity"
            class="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            [(ngModel)]="maxQuantity"
            (input)="filterStocks()"
            type="number"
            placeholder="Max Quantity"
            class="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            [(ngModel)]="minValue"
            (input)="filterStocks()"
            type="number"
            placeholder="Min Value (TND)"
            class="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="p-3 bg-blue-100 rounded-full">
              <i class="fas fa-boxes text-blue-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Items</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ getTotalItems() }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="p-3 bg-green-100 rounded-full">
              <i class="fas fa-warehouse text-green-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Quantity</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ getTotalQuantity() }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="p-3 bg-yellow-100 rounded-full">
              <i
                class="fas fa-exclamation-triangle text-yellow-600 text-xl"
              ></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Low Stock</p>
              <p class="text-2xl font-bold text-yellow-600">
                {{ lowStockCount }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="p-3 bg-purple-100 rounded-full">
              <i class="fas fa-coins text-purple-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Value</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ getTotalValue() | currency : 'TND' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Stock Table -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Article
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Physical Qty
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Min Stock
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Stock Value
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let stock of filteredStocks" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ stock.articleId }}
                  </div>
                  <!-- <div class="text-sm text-gray-500">
                    Code: {{ stock.article?.codeArticle }}
                  </div> -->
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ stock.quantitePhysique }}
                  </div>
                  <div class="text-xs text-gray-500">
                    <span>FFO: {{ stock.venteFFO }}</span> |
                    <span>Livré: {{ stock.livreFou }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ stock.stockMin }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ stock.valeur_Stock_TND | currency : 'TND' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    [class]="getStockStatusClass(stock)"
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  >
                    {{ getStockStatus(stock) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    (click)="editStock(stock)"
                    class="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    (click)="deleteStock(stock.id)"
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

      <!-- Empty State -->
      <div *ngIf="filteredStocks.length === 0" class="text-center py-12">
        <i class="fas fa-boxes text-6xl text-gray-300 mb-4"></i>
        <h3 class="text-xl font-medium text-gray-600 mb-2">
          No stock items found
        </h3>
        <p class="text-gray-500">{{ getEmptyMessage() }}</p>
      </div>

      <!-- Add/Edit Modal -->
      <div
        *ngIf="showAddModal || showEditModal"
        class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      >
        <div
          class="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 shadow-lg rounded-md bg-white"
        >
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold">
              {{ showEditModal ? 'Edit' : 'Add' }} Stock
            </h3>
            <button
              (click)="closeModal()"
              class="text-gray-400 hover:text-gray-600"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>

          <form (ngSubmit)="saveStock()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700"
                >Article *</label
              >
              <select
                [(ngModel)]="currentStock.articleId"
                name="articleId"
                required
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Article</option>
                <option *ngFor="let article of articles" [value]="article.id">
                  {{ article.codeArticle }} - {{ article.libelle }}
                </option>
              </select>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Physical Quantity *</label
                >
                <input
                  [(ngModel)]="currentStock.quantitePhysique"
                  name="quantitePhysique"
                  type="number"
                  min="0"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Minimum Stock *</label
                >
                <input
                  [(ngModel)]="currentStock.stockMin"
                  name="stockMin"
                  type="number"
                  min="0"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Stock Value (TND) *</label
                >
                <input
                  [(ngModel)]="currentStock.valeur_Stock_TND"
                  name="valeurStock"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Vente FFO</label
                >
                <input
                  [(ngModel)]="currentStock.venteFFO"
                  name="venteFFO"
                  type="number"
                  min="0"
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Livré Fournisseur</label
                >
                <input
                  [(ngModel)]="currentStock.livreFou"
                  name="livreFou"
                  type="number"
                  min="0"
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Transfert</label
                >
                <input
                  [(ngModel)]="currentStock.transfert"
                  name="transfert"
                  type="number"
                  min="0"
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Annonce Transfert</label
                >
                <input
                  [(ngModel)]="currentStock.annonceTrf"
                  name="annonceTrf"
                  type="number"
                  min="0"
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
            <h3 class="text-lg font-bold">Import Stock Data</h3>
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
                (click)="importStocks()"
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
export class StockListComponent implements OnInit {
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

  // Modals
  showAddModal = false;
  showEditModal = false;
  showImportModal = false;

  // Current stock for add/edit
  currentStock: Partial<Stock> = {};

  // Import
  selectedFile: File | null = null;
  importing = false;

  // Computed values
  lowStockCount = 0;
  outOfStockCount = 0;

  constructor(
    private stockService: StockService,
    private articleService: ArticleService
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

  editStock(stock: Stock) {
    this.currentStock = { ...stock };
    this.showEditModal = true;
  }

  deleteStock(id: number) {
    if (confirm('Are you sure you want to delete this stock record?')) {
      this.stockService.delete(id).subscribe({
        next: () => {
          this.loadStocks();
        },
        error: (error) => {
          console.error('Error deleting stock:', error);
        },
      });
    }
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

    if (this.showEditModal && this.currentStock.id) {
      this.stockService
        .update(this.currentStock.id, this.currentStock as Stock)
        .subscribe({
          next: () => {
            this.loadStocks();
            this.closeModal();
          },
          error: (error) => {
            console.error('Error updating stock:', error);
          },
        });
    } else {
      this.stockService.create(this.currentStock as Stock).subscribe({
        next: () => {
          this.loadStocks();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error creating stock:', error);
        },
      });
    }
  }

  closeModal() {
    this.showAddModal = false;
    this.showEditModal = false;
    this.currentStock = {};
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
        this.showImportModal = false;
        this.selectedFile = null;
        this.importing = false;
        this.loadStocks();
      },
      error: (error) => {
        console.error('Import error:', error);
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
}
