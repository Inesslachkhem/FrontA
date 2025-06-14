import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Vente, Article } from '../../models/article.model';
import { VenteService } from '../../services/vente.service';
import { ArticleService } from '../../services/article.service';

@Component({
  selector: 'app-vente-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800">Sales Management</h1>
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
            <i class="fas fa-plus mr-2"></i>Add Sale
          </button>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="p-3 bg-blue-100 rounded-full">
              <i class="fas fa-shopping-cart text-blue-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Sales</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ getTotalSales() }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="p-3 bg-green-100 rounded-full">
              <i class="fas fa-coins text-green-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Revenue</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ getTotalRevenue() | currency : 'TND' }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="p-3 bg-purple-100 rounded-full">
              <i class="fas fa-chart-line text-purple-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Avg Sale Value</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ getAverageSaleValue() | currency : 'TND' }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="p-3 bg-orange-100 rounded-full">
              <i class="fas fa-boxes text-orange-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Items Sold</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ getTotalQuantitySold() }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-md p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            [(ngModel)]="searchTerm"
            (input)="filterVentes()"
            type="text"
            placeholder="Search by article..."
            class="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            [(ngModel)]="startDate"
            (change)="filterVentes()"
            type="date"
            class="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            [(ngModel)]="endDate"
            (change)="filterVentes()"
            type="date"
            class="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            [(ngModel)]="minAmount"
            (input)="filterVentes()"
            type="number"
            placeholder="Min Amount"
            class="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            (click)="clearFilters()"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <i class="fas fa-times mr-2"></i>Clear
          </button>
        </div>
      </div>

      <!-- Sales Table -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Sale ID
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Article
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Quantity
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Amount
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Unit Price
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
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
                *ngFor="let vente of paginatedVentes; trackBy: trackByVente"
                class="hover:bg-gray-50"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    #{{ vente.id }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ vente.article?.libelle || 'Loading...' }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ vente.article?.codeArticle }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ vente.quantiteVendue }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ vente.montantTotal | currency : 'TND' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ getUnitPrice(vente) | currency : 'TND' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    {{ vente.dateVente | date : 'short' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    (click)="editVente(vente)"
                    class="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    (click)="deleteVente(vente.id)"
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
          {{ Math.min(currentPage * pageSize, filteredVentes.length) }} of
          {{ filteredVentes.length }} results
        </div>
        <div class="flex gap-2">
          <button
            (click)="previousPage()"
            [disabled]="currentPage === 1"
            class="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          <span class="px-3 py-1"
            >Page {{ currentPage }} of {{ totalPages }}</span
          >
          <button
            (click)="nextPage()"
            [disabled]="currentPage === totalPages"
            class="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="filteredVentes.length === 0" class="text-center py-12">
        <i class="fas fa-receipt text-6xl text-gray-300 mb-4"></i>
        <h3 class="text-xl font-medium text-gray-600 mb-2">No sales found</h3>
        <p class="text-gray-500">
          {{
            searchTerm || startDate || endDate
              ? 'Try adjusting your filters.'
              : 'Get started by recording your first sale.'
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
              {{ showEditModal ? 'Edit' : 'Add' }} Sale
            </h3>
            <button
              (click)="closeModal()"
              class="text-gray-400 hover:text-gray-600"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>

          <form (ngSubmit)="saveVente()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700"
                >Article *</label
              >
              <select
                [(ngModel)]="currentVente.articleId"
                name="articleId"
                required
                (change)="onArticleSelected()"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Article</option>
                <option *ngFor="let article of articles" [value]="article.id">
                  {{ article.codeArticle }} - {{ article.libelle }} ({{
                    article.prix_Vente_TND | currency : 'TND'
                  }})
                </option>
              </select>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Quantity Sold *</label
                >
                <input
                  [(ngModel)]="currentVente.quantiteVendue"
                  name="quantiteVendue"
                  type="number"
                  min="1"
                  required
                  (input)="calculateTotal()"
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Unit Price (TND)</label
                >
                <input
                  [(ngModel)]="unitPrice"
                  name="unitPrice"
                  type="number"
                  step="0.01"
                  [readonly]="true"
                  class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700"
                >Total Amount (TND) *</label
              >
              <input
                [(ngModel)]="currentVente.montantTotal"
                name="montantTotal"
                type="number"
                step="0.01"
                required
                [readonly]="true"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700"
                >Sale Date *</label
              >
              <input
                [(ngModel)]="currentVente.dateVente"
                name="dateVente"
                type="datetime-local"
                required
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
            <h3 class="text-lg font-bold">Import Sales Data</h3>
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
                (click)="importVentes()"
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
export class VenteListComponent implements OnInit {
  ventes: Vente[] = [];
  filteredVentes: Vente[] = [];
  paginatedVentes: Vente[] = [];
  articles: Article[] = [];

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
  showAddModal = false;
  showEditModal = false;
  showImportModal = false;

  // Current vente for add/edit
  currentVente: Partial<Vente> = {};
  unitPrice = 0;

  // Import
  selectedFile: File | null = null;
  importing = false;

  // Utility
  Math = Math;

  constructor(
    private venteService: VenteService,
    private articleService: ArticleService
  ) {}

  ngOnInit() {
    this.loadVentes();
    this.loadArticles();
  }

  loadVentes() {
    this.venteService.getAll().subscribe({
      next: (ventes) => {
        this.ventes = ventes;
        this.filterVentes();
      },
      error: (error) => {
        console.error('Error loading ventes:', error);
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
    }

    // Date range filter
    if (this.startDate) {
      const start = new Date(this.startDate);
      filtered = filtered.filter((vente) => new Date(vente.dateVente) >= start);
    }
    if (this.endDate) {
      const end = new Date(this.endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((vente) => new Date(vente.dateVente) <= end);
    }

    // Amount filter
    if (this.minAmount !== null) {
      filtered = filtered.filter(
        (vente) => vente.montantTotal >= this.minAmount!
      );
    }

    this.filteredVentes = filtered.sort(
      (a, b) =>
        new Date(b.dateVente).getTime() - new Date(a.dateVente).getTime()
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

  editVente(vente: Vente) {
    this.currentVente = { ...vente };
    this.unitPrice = this.getUnitPrice(vente);
    this.showEditModal = true;
  }

  deleteVente(id: number) {
    if (confirm('Are you sure you want to delete this sale record?')) {
      this.venteService.delete(id).subscribe({
        next: () => {
          this.loadVentes();
        },
        error: (error) => {
          console.error('Error deleting vente:', error);
        },
      });
    }
  }

  saveVente() {
    if (!this.currentVente.dateVente) {
      this.currentVente.dateVente = new Date();
    }

    if (this.showEditModal && this.currentVente.id) {
      this.venteService
        .update(this.currentVente.id, this.currentVente as Vente)
        .subscribe({
          next: () => {
            this.loadVentes();
            this.closeModal();
          },
          error: (error) => {
            console.error('Error updating vente:', error);
          },
        });
    } else {
      this.venteService.create(this.currentVente as Vente).subscribe({
        next: () => {
          this.loadVentes();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error creating vente:', error);
        },
      });
    }
  }

  closeModal() {
    this.showAddModal = false;
    this.showEditModal = false;
    this.currentVente = {};
    this.unitPrice = 0;
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
    if (this.currentVente.quantiteVendue && this.unitPrice) {
      this.currentVente.montantTotal =
        this.currentVente.quantiteVendue * this.unitPrice;
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
        this.showImportModal = false;
        this.selectedFile = null;
        this.importing = false;
        this.loadVentes();
      },
      error: (error) => {
        console.error('Import error:', error);
        this.importing = false;
      },
    });
  }

  // Utility methods
  getUnitPrice(vente: Vente): number {
    return vente.quantiteVendue > 0
      ? vente.montantTotal / vente.quantiteVendue
      : 0;
  }

  getTotalSales(): number {
    return this.ventes.length;
  }

  getTotalRevenue(): number {
    return this.ventes.reduce((total, vente) => total + vente.montantTotal, 0);
  }

  getAverageSaleValue(): number {
    return this.ventes.length > 0
      ? this.getTotalRevenue() / this.ventes.length
      : 0;
  }

  getTotalQuantitySold(): number {
    return this.ventes.reduce(
      (total, vente) => total + vente.quantiteVendue,
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
