import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  Promotion,
  PromotionAnalysis,
  PromotionGeneration,
  Category,
  PromotionStats,
} from '../models/promotion.model';

@Injectable({
  providedIn: 'root',
})
export class PromotionService {
  private apiUrl = environment.apiUrl; // Use environment configuration
  private promotionsSubject = new BehaviorSubject<Promotion[]>([]);
  public promotions$ = this.promotionsSubject.asObservable();

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private http: HttpClient) {}

  // Get all active promotions
  getActivePromotions(): Observable<Promotion[]> {
    return this.http.get<any[]>(`${this.apiUrl}/promotion`).pipe(
      map((promotions) => {
        const mappedPromotions = promotions.map((promo: any) =>
          this.mapDotNetPromotionToAngular(promo)
        );
        this.promotionsSubject.next(mappedPromotions);
        return mappedPromotions;
      }),
      catchError((error) => {
        console.error('Error fetching promotions:', error);
        return of([]);
      })
    );
  }

  // Get only active promotions (not expired)
  getOnlyActivePromotions(): Observable<Promotion[]> {
    return this.http.get<any[]>(`${this.apiUrl}/promotion/active`).pipe(
      map((promotions) => {
        const mappedPromotions = promotions.map((promo: any) =>
          this.mapDotNetPromotionToAngular(promo)
        );
        return mappedPromotions;
      }),
      catchError((error) => {
        console.error('Error fetching active promotions:', error);
        return of([]);
      })
    );
  }

  // Get expired promotions
  getExpiredPromotions(): Observable<Promotion[]> {
    return this.http.get<any[]>(`${this.apiUrl}/promotion/expired`).pipe(
      map((promotions) => {
        const mappedPromotions = promotions.map((promo: any) =>
          this.mapDotNetPromotionToAngular(promo)
        );
        return mappedPromotions;
      }),
      catchError((error) => {
        console.error('Error fetching expired promotions:', error);
        return of([]);
      })
    );
  }

  // Get promotion statistics
  getPromotionStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/promotion/stats`).pipe(
      catchError((error) => {
        console.error('Error fetching promotion stats:', error);
        return of({
          TotalPromotions: 0,
          ActivePromotions: 0,
          ExpiredPromotions: 0,
          AverageReduction: 0,
          MaxReduction: 0,
          MinReduction: 0,
          TotalSavings: 0,
        });
      })
    );
  }

  // Get all categories
  getCategories(): Observable<Category[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categorie`).pipe(
      map((categories) => {
        return categories.map((cat: any) => ({
          id: cat.idCategorie, // Mapping correct : idCategorie -> id
          name: cat.nom, // Mapping correct : nom -> name
        }));
      }),
      catchError((error) => {
        console.error('Error fetching categories:', error);
        return of([]);
      })
    );
  }

  // Create a new promotion
  createPromotion(promotion: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/promotion`, promotion, this.httpOptions)
      .pipe(
        catchError((error) => {
          console.error('Error creating promotion:', error);
          return throwError(() => error);
        })
      );
  }

  // Update a promotion
  updatePromotion(id: number, promotion: any): Observable<any> {
    return this.http
      .put<any>(`${this.apiUrl}/promotion/${id}`, promotion, this.httpOptions)
      .pipe(
        catchError((error) => {
          console.error('Error updating promotion:', error);
          return throwError(() => error);
        })
      );
  }

  // Delete a promotion
  deletePromotion(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/promotion/${id}`).pipe(
      catchError((error) => {
        console.error('Error deleting promotion:', error);
        return throwError(() => error);
      })
    );
  }

  // Delete all promotions
  deleteAllPromotions(): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/promotion/clear-all`).pipe(
      catchError((error) => {
        console.error('Error deleting all promotions:', error);
        return throwError(() => error);
      })
    );
  }

  // Map .NET promotion model to Angular model
  private mapDotNetPromotionToAngular(dotNetPromo: any): Promotion {
    return {
      id: dotNetPromo.id,
      code_article: dotNetPromo.codeArticle,
      // Try both capitalized and camelCase versions for robustness
      product_name:
        dotNetPromo.article?.libelle ||
        dotNetPromo.article?.Libelle ||
        'Product Name Not Available',
      category_name:
        dotNetPromo.article?.categorie?.nom ||
        dotNetPromo.article?.categorie?.Nom ||
        'Category Not Available',
      discount_percentage: `${(dotNetPromo.tauxReduction * 100).toFixed(1)}%`,
      price_before: dotNetPromo.prix_Vente_TND_Avant?.toString() || '0',
      price_after: dotNetPromo.prix_Vente_TND_Apres?.toString() || '0',
      end_date: dotNetPromo.dateFin,
      created_at: dotNetPromo.dateCreation,
      status: this.getPromotionStatus(
        dotNetPromo.dateFin,
        dotNetPromo.isAccepted
      ),
      expected_volume_impact: this.normalizeVolumeImpact(
        dotNetPromo.expectedVolumeImpact
      ),
      expected_revenue_impact: dotNetPromo.expectedRevenueImpact,
      is_accepted: dotNetPromo.isAccepted,
      date_approval: dotNetPromo.dateApproval,
      validateur_id: dotNetPromo.validateurId,
      prediction_confidence: dotNetPromo.predictionConfidence,
      seasonal_adjustment: dotNetPromo.seasonalAdjustment,
      temporal_adjustment: dotNetPromo.temporalAdjustment,
    };
  }

  // Analyze category for promotion opportunities (placeholder for now)
  analyzeCategory(categoryId: string): Observable<PromotionAnalysis[]> {
    // For now, return empty array since the backend doesn't have this specific endpoint
    // This could be implemented by calling multiple endpoints and combining data
    return of([]);
  }

  // Generate promotions using AI (calls the AI optimal promotions endpoint)
  generatePromotions(categoryId?: string): Observable<PromotionGeneration> {
    return this.http.get<any>(`${this.apiUrl}/promotion/ai-optimal`).pipe(
      map((response) => {
        // Transform the response to match the expected format
        const generated: PromotionGeneration = {
          category_id: categoryId || '0',
          promotions_generated: response.length || 0,
          promotions_saved: response.length || 0,
          promotions: response.map((item: any) => ({
            product_id: item.articleId || 0,
            discount_percentage: `${item.recommendedDiscount || 0}%`,
            new_price: item.newPrice?.toString() || '0',
            projected_sales_increase:
              item.projectedSalesIncrease?.toString() || '0',
            projected_revenue_increase:
              item.projectedRevenueIncrease?.toString() || '0',
            start_date: new Date().toISOString(),
            end_date: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString(), // 30 days from now
          })),
        };
        // Refresh promotions list after generation
        this.getActivePromotions().subscribe();
        return generated;
      }),
      catchError((error) => {
        console.error('Error generating promotions:', error);
        return throwError(() => error);
      })
    );
  }

  // Get AI prediction for a specific article
  predictPromotion(codeArticle: string, targetDate?: Date): Observable<any> {
    const request = {
      codeArticle: codeArticle,
      targetDate: targetDate,
    };
    return this.http
      .post<any>(
        `${this.apiUrl}/promotion/ai-predict`,
        request,
        this.httpOptions
      )
      .pipe(
        catchError((error) => {
          console.error('Error predicting promotion:', error);
          return throwError(() => error);
        })
      );
  }

  // Update promotion acceptance status
  updatePromotionAcceptance(
    id: number,
    isAccepted: boolean,
    validateurId?: number
  ): Observable<any> {
    if (isAccepted) {
      // Use the existing approve endpoint
      return this.approvePromotion(id, validateurId);
    } else {
      // Use the reject functionality
      return this.rejectPromotion(id, validateurId);
    }
  }

  // Approve a promotion (wrapper for updatePromotionAcceptance)
  approvePromotion(id: number, validateurId?: number): Observable<any> {
    const approvalRequest = {
      ValidateurId: validateurId,
    };

    return this.http
      .post<any>(
        `${this.apiUrl}/promotion/${id}/approve`,
        approvalRequest,
        this.httpOptions
      )
      .pipe(
        map((response) => {
          // Refresh promotions list after update
          this.getActivePromotions().subscribe();
          return response;
        }),
        catchError((error) => {
          console.error('Error approving promotion:', error);
          return throwError(() => error);
        })
      );
  }

  // Reject a promotion
  rejectPromotion(id: number, validateurId?: number): Observable<any> {
    const rejectionRequest = {
      IsAccepted: false,
      ValidateurId: validateurId,
    };

    return this.http
      .patch<any>(
        `${this.apiUrl}/promotion/${id}/acceptance`,
        rejectionRequest,
        this.httpOptions
      )
      .pipe(
        map((response) => {
          // Refresh promotions list after update
          this.getActivePromotions().subscribe();
          return response;
        }),
        catchError((error) => {
          console.error('Error rejecting promotion:', error);
          return throwError(() => error);
        })
      );
  }

  // Bulk update promotions acceptance status
  bulkUpdateAcceptance(
    promotionIds: number[],
    isAccepted: boolean,
    validateurId?: number
  ): Observable<any> {
    const bulkRequest = {
      PromotionIds: promotionIds,
      IsAccepted: isAccepted,
      ValidateurId: validateurId,
    };

    return this.http
      .patch<any>(
        `${this.apiUrl}/promotion/bulk-acceptance`,
        bulkRequest,
        this.httpOptions
      )
      .pipe(
        map((response) => {
          // Refresh promotions list after bulk update
          this.getActivePromotions().subscribe();
          return response;
        }),
        catchError((error) => {
          console.error('Error bulk updating promotion acceptance:', error);
          return throwError(() => error);
        })
      );
  }

  // Bulk approve promotions
  bulkApprovePromotions(
    promotionIds: number[],
    validateurId?: number
  ): Observable<any> {
    return this.bulkUpdateAcceptance(promotionIds, true, validateurId);
  }

  // Bulk reject promotions
  bulkRejectPromotions(promotionIds: number[]): Observable<any> {
    return this.bulkUpdateAcceptance(promotionIds, false);
  }

  // Get pending promotions (not approved yet)
  getPendingPromotions(): Observable<Promotion[]> {
    return this.http.get<any[]>(`${this.apiUrl}/promotion/pending`).pipe(
      map((promotions) => {
        const mappedPromotions = promotions.map((promo: any) =>
          this.mapDotNetPromotionToAngular(promo)
        );
        return mappedPromotions;
      }),
      catchError((error) => {
        console.error('Error fetching pending promotions:', error);
        return of([]);
      })
    );
  }

  // Get approved promotions
  getApprovedPromotions(): Observable<Promotion[]> {
    return this.http.get<any[]>(`${this.apiUrl}/promotion/approved`).pipe(
      map((promotions) => {
        const mappedPromotions = promotions.map((promo: any) =>
          this.mapDotNetPromotionToAngular(promo)
        );
        return mappedPromotions;
      }),
      catchError((error) => {
        console.error('Error fetching approved promotions:', error);
        return of([]);
      })
    );
  }

  // Get rejected promotions
  getRejectedPromotions(): Observable<Promotion[]> {
    return this.http.get<any[]>(`${this.apiUrl}/promotion`).pipe(
      map((promotions) => {
        const mappedPromotions = promotions
          .filter((promo: any) => promo.isAccepted === false)
          .map((promo: any) => this.mapDotNetPromotionToAngular(promo));
        return mappedPromotions;
      }),
      catchError((error) => {
        console.error('Error fetching rejected promotions:', error);
        return of([]);
      })
    );
  }

  // Get promotions by status
  getPromotionsByStatus(
    status: 'pending' | 'approved' | 'rejected' | 'active' | 'expired'
  ): Observable<Promotion[]> {
    switch (status) {
      case 'pending':
        return this.getPendingPromotions();
      case 'approved':
        return this.getApprovedPromotions();
      case 'rejected':
        return this.getRejectedPromotions();
      case 'active':
        return this.getOnlyActivePromotions();
      case 'expired':
        return this.getExpiredPromotions();
      default:
        return this.getActivePromotions();
    }
  }

  // Get database structure (for debugging)
  getDatabaseStructure(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/database-structure`).pipe(
      catchError((error) => {
        console.error('Error fetching database structure:', error);
        return of({});
      })
    );
  }

  // Debug category data
  debugCategory(categoryId: number): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/debug-category/${categoryId}`)
      .pipe(
        catchError((error) => {
          console.error('Error debugging category:', error);
          return of({});
        })
      );
  }

  // Test sales data for a product
  testSalesData(productId: number): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/test-sales-data/${productId}`)
      .pipe(
        catchError((error) => {
          console.error('Error testing sales data:', error);
          return of({});
        })
      );
  }

  // Force generate promotions for testing
  forcePromotion(categoryId: number): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/force-promotion/${categoryId}`)
      .pipe(
        catchError((error) => {
          console.error('Error forcing promotion:', error);
          return of({});
        })
      );
  }

  // Calculate promotion statistics
  calculatePromotionStats(promotions: Promotion[]): PromotionStats {
    const now = new Date();
    const activePromotions = promotions.filter(
      (p) => new Date(p.end_date) > now
    );
    const expiredPromotions = promotions.filter(
      (p) => new Date(p.end_date) <= now
    );

    const totalDiscountValue = promotions.reduce((sum, promo) => {
      const discountPercent = parseFloat(
        promo.discount_percentage.replace('%', '')
      );
      const priceBefore = parseFloat(promo.price_before);
      return sum + (priceBefore * discountPercent) / 100;
    }, 0);

    const projectedRevenueIncrease = promotions.reduce((sum, promo) => {
      return sum + (promo.expected_revenue_impact || 0);
    }, 0);

    return {
      total_promotions: promotions.length,
      active_promotions: activePromotions.length,
      expired_promotions: expiredPromotions.length,
      total_discount_value: totalDiscountValue,
      projected_revenue_increase: projectedRevenueIncrease,
    };
  }

  // Helper method to determine promotion status
  private getPromotionStatus(
    endDate: string,
    isAccepted?: boolean
  ): 'active' | 'expired' | 'pending' | 'rejected' {
    const now = new Date();
    const end = new Date(endDate);

    // Check acceptance status first
    if (isAccepted === false) {
      return 'rejected';
    }

    if (isAccepted === undefined || isAccepted === null) {
      return 'pending';
    }

    // If accepted, check if it's still active or expired
    if (isAccepted === true) {
      if (end > now) {
        return 'active';
      } else {
        return 'expired';
      }
    }

    // Default to pending
    return 'pending';
  }

  // Format currency
  formatCurrency(amount: number | string): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 2,
    }).format(num);
  }

  // Format percentage
  formatPercentage(percentage: string): string {
    return percentage.endsWith('%') ? percentage : `${percentage}%`;
  }

  // Get promotion card color based on discount
  getPromotionCardColor(discount: string): string {
    const discountNum = parseFloat(discount.replace('%', ''));

    if (discountNum >= 25) {
      return 'bg-gradient-to-br from-red-500 to-red-600'; // High discount
    } else if (discountNum >= 15) {
      return 'bg-gradient-to-br from-orange-500 to-orange-600'; // Medium discount
    } else if (discountNum >= 10) {
      return 'bg-gradient-to-br from-yellow-500 to-yellow-600'; // Low-medium discount
    } else {
      return 'bg-gradient-to-br from-green-500 to-green-600'; // Low discount
    }
  }

  private normalizeVolumeImpact(value?: number): number | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    // If the value is less than 1, treat it as a decimal rate and convert to percentage
    // If the value is >= 1, assume it's already a percentage
    if (Math.abs(value) < 1) {
      return Number((value * 100).toFixed(1));
    } else {
      return Number(value.toFixed(1));
    }
  }
}
