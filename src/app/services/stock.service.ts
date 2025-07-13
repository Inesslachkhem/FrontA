import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
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
  private apiUrl = 'http://localhost:5256/api/Stock';

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
  create(stock: any): Observable<Stock> {
    return this.http.post<Stock>(this.apiUrl, stock);
  }

  // Update stock
  update(id: number, stock: any): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, stock);
  }

  // Delete stock
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Import stocks from CSV with comprehensive debugging
  importStocks(file: File): Observable<any> {
    console.log('🔧 StockService: Starting import process...');
    console.log('📁 File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified),
    });

    // Validate file before sending
    if (!file.name.toLowerCase().endsWith('.csv')) {
      console.error('❌ Invalid file type:', file.type);
      return throwError(() => new Error('Le fichier doit être au format CSV.'));
    }

    // Validate file is not empty
    if (file.size === 0) {
      console.error('❌ File is empty');
      return throwError(() => new Error('Le fichier est vide.'));
    }

    // Read file content for debugging
    this.debugFileContent(file);

    const formData = new FormData();
    formData.append('file', file);

    // Debug FormData contents
    console.log('📦 FormData created successfully');
    console.log('📦 FormData has file:', formData.has('file'));

    const attachedFile = formData.get('file') as File;
    if (attachedFile) {
      console.log('✅ File attached to FormData:', {
        name: attachedFile.name,
        size: attachedFile.size,
        type: attachedFile.type,
      });
    } else {
      console.error('❌ File not found in FormData!');
    }

    console.log('🔗 API endpoint:', `${this.apiUrl}/import-stocks`);
    console.log('🚀 Sending HTTP POST request...');

    return this.http.post(`${this.apiUrl}/import-stocks`, formData).pipe(
      tap({
        next: (response) => {
          console.log('✅ HTTP Request successful:', response);
        },
        error: (error) => {
          console.error('❌ HTTP Request failed:', error);
          console.error('📊 Detailed error:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            error: error.error,
            url: error.url,
          });
        },
      }),
      catchError((error) => {
        console.error('🔥 CRITICAL ERROR ANALYSIS:');
        console.error('Status Code:', error.status);
        console.error('Status Text:', error.statusText);
        console.error('Error Body:', error.error);
        console.error('Request URL:', error.url);

        // Network connectivity check
        if (error.status === 0) {
          console.error('🚨 NETWORK ERROR: Request did not reach server');
          console.error('Possible causes:');
          console.error('- Backend not running on http://localhost:5256');
          console.error('- CORS configuration issues');
          console.error('- Firewall blocking request');
          console.error('- Wrong API URL');
        }

        let userMessage = "Erreur lors de l'import du fichier CSV.";

        if (error.status === 0) {
          userMessage =
            "❌ Serveur inaccessible! Vérifiez que l'API backend est démarrée sur http://localhost:5256";
        } else if (error.status === 400) {
          userMessage =
            error.error?.message ||
            error.error ||
            'Format de fichier CSV invalide';
        } else if (error.status === 500) {
          userMessage = 'Erreur serveur lors du traitement';
        }

        return throwError(() => new Error(userMessage));
      })
    );
  }

  // Debug file content
  private debugFileContent(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const lines = content.split('\n');

      console.log('📄 FILE CONTENT ANALYSIS:');
      console.log('Total lines:', lines.length);
      console.log('Header:', lines[0]);
      console.log('First data line:', lines[1]);
      console.log('Sample (first 3 lines):');
      lines.slice(0, 3).forEach((line, index) => {
        console.log(`Line ${index + 1}: "${line}"`);
      });

      // Separator analysis
      const firstDataLine = lines[1] || '';
      const commaCount = (firstDataLine.match(/,/g) || []).length;
      const tabCount = (firstDataLine.match(/\t/g) || []).length;

      console.log('📊 SEPARATOR ANALYSIS:');
      console.log('Comma count:', commaCount);
      console.log('Tab count:', tabCount);

      if (tabCount > commaCount) {
        console.warn(
          '⚠️  WARNING: File uses TAB separators, backend expects COMMA separators!'
        );
      }

      // Column structure analysis
      const header = lines[0];
      const csvFormat =
        'Id,ArticleId,QuantitePhysique,StockMin,VenteFFO,LivreFou,Transfert,AnnonceTrf,Valeur_Stock_TND,DepotId';
      const backendFormat =
        'Id,QuantitePhysique,StockMin,VenteFFO,LivreFou,Transfert,AnnonceTrf,Valeur_Stock_TND,ArticleId,DepotId';

      console.log('📋 COLUMN FORMAT ANALYSIS:');
      console.log('CSV header:', header);
      console.log('Expected CSV format:', csvFormat);
      console.log('Backend expects:', backendFormat);
      console.log('CSV matches expected:', header.trim() === csvFormat);
      console.log('CSV matches backend:', header.trim() === backendFormat);
    };
    reader.readAsText(file);
  }

  // Clear all stocks
  clearAll(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clear-all`);
  }

  // Get stock statistics
  getStatistics(): Observable<StockStatistics> {
    return this.http.get<StockStatistics>(`${this.apiUrl}/statistics`);
  }

  // Send stock alert email
  sendStockAlert(alert: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-alert`, alert);
  }
}
