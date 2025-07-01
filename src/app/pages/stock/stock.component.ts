import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { StockService } from '../../services/stock.service';
import { Stock } from '../../models/article.model';

interface StockStatistics {
  totalStockEntries: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalQuantity: number;
  totalValue: number;
  averageValue: number;
}

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './stock.component.html',
  styleUrl: './stock.component.css',
})
export class StockComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  stocks: Stock[] = [];
  filteredStocks: Stock[] = [];
  searchTerm: string = '';
  loading: boolean = false;
  error: string | null = null;

  // Statistics
  statistics: StockStatistics = {
    totalStockEntries: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    totalQuantity: 0,
    totalValue: 0,
    averageValue: 0,
  };

  constructor(private stockService: StockService) {}

  ngOnInit(): void {
    this.loadStocks();
    this.loadStatistics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadStocks(): void {
    this.loading = true;
    this.error = null;

    this.stockService
      .getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stocks) => {
          this.stocks = stocks;
          this.filteredStocks = stocks;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading stocks:', error);
          this.error = 'Failed to load stock data';
          this.loading = false;
        },
      });
  }

  loadStatistics(): void {
    this.stockService
      .getStatistics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (statistics: StockStatistics) => {
          this.statistics = statistics;
        },
        error: (error: any) => {
          console.error('Error loading statistics:', error);
          // Fallback: calculate from loaded stocks
          this.calculateStatisticsFromStocks();
        },
      });
  }

  calculateStatisticsFromStocks(): void {
    if (this.stocks.length > 0) {
      this.statistics = {
        totalStockEntries: this.stocks.length,
        lowStockItems: this.stocks.filter(
          (s) => s.quantitePhysique <= s.stockMin
        ).length,
        outOfStockItems: this.stocks.filter((s) => s.quantitePhysique === 0)
          .length,
        totalQuantity: this.stocks.reduce(
          (sum, s) => sum + s.quantitePhysique,
          0
        ),
        totalValue: this.stocks.reduce((sum, s) => sum + s.valeur_Stock_TND, 0),
        averageValue:
          this.stocks.length > 0
            ? this.stocks.reduce((sum, s) => sum + s.valeur_Stock_TND, 0) /
              this.stocks.length
            : 0,
      };
    }
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredStocks = this.stocks;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredStocks = this.stocks.filter(
      (stock) =>
        stock.article?.libelle?.toLowerCase().includes(term) ||
        stock.article?.codeArticle?.toLowerCase().includes(term) ||
        stock.article?.codeBarre?.toLowerCase().includes(term)
    );
  }

  getStockStatusClass(stock: Stock): string {
    if (stock.quantitePhysique === 0) return 'text-red-600 dark:text-red-400';
    if (stock.quantitePhysique <= stock.stockMin)
      return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  }

  getStockStatusText(stock: Stock): string {
    if (stock.quantitePhysique === 0) return 'Out of Stock';
    if (stock.quantitePhysique <= stock.stockMin) return 'Low Stock';
    return 'In Stock';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 2,
    }).format(value);
  }
}
