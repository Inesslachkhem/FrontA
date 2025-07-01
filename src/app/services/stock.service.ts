import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Stock, Article } from '../models/article.model';

interface StockStatistics {
  totalStockEntries: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalQuantity: number;
  totalValue: number;
  averageValue: number;
}

@Injectable({
  providedIn: 'root',
})
export class StockService {
  private apiUrl = 'http://localhost:5256/api/Stock'; // Adjust URL as needed

  constructor(private http: HttpClient) {}

  // Calculate stock value
  calculateStockValue(stock: Stock, article?: Article | null): number {
    if (!article || !stock.quantitePhysique) return 0;
    return stock.quantitePhysique * article.prix_Achat_TND;
  }

  // Get all stocks
  getAll(): Observable<Stock[]> {
    const stocks = this.http.get<Stock[]>(this.apiUrl);
    console.log(stocks);
    return stocks;
  }

  // Get stock by ID
  getById(id: number): Observable<Stock> {
    return this.http.get<Stock>(`${this.apiUrl}/${id}`);
  }

  // Get stocks by article ID
  getByArticleId(articleId: number): Observable<Stock[]> {
    return this.http.get<Stock[]>(`${this.apiUrl}/by-article/${articleId}`);
  }

  // Get low stock items
  getLowStock(): Observable<Stock[]> {
    return this.http.get<Stock[]>(`${this.apiUrl}/low-stock`);
  }

  // Get stock by article code
  getByArticleCode(codeArticle: string): Observable<Stock[]> {
    return this.http.get<Stock[]>(
      `${this.apiUrl}/by-article-code/${codeArticle}`
    );
  }

  // Create new stock
  create(stock: Stock): Observable<Stock> {
    return this.http.post<Stock>(this.apiUrl, stock);
  }

  // Update stock
  update(id: number, stock: Stock): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, stock);
  }

  // Delete stock
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Import stocks from CSV
  importStocks(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/import-stocks`, formData);
  }

  // Clear all stocks
  clearAll(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clear-all`);
  }

  // Get stock statistics
  getStatistics(): Observable<StockStatistics> {
    return this.http.get<StockStatistics>(`${this.apiUrl}/statistics`);
  }
}
