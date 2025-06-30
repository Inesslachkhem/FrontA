import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { SignInResponseDto, User } from '../models/user.model';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private apiUrl = environment.apiUrl;

  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient
  ) {
    // Only access localStorage if we're in the browser
    if (isPlatformBrowser(this.platformId)) {
      this.initializeFromStorage();
    }
  }

  private initializeFromStorage(): void {
    try {
      const storedUser = localStorage.getItem('currentUser');
      const storedToken = localStorage.getItem('token');

      if (storedUser && storedToken) {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
        this.tokenSubject.next(storedToken);
      }
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      this.logout();
    }
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  get tokenValue(): string | null {
    return this.tokenSubject.value;
  }
  get isAuthenticated(): boolean {
    return !!this.tokenValue && !!this.currentUserValue;
  }

  private setAuthData(user: User, token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('token', token);
    }
    this.currentUserSubject.next(user);
    this.tokenSubject.next(token);
  }

  logout(): void {
    // Remove user and token from localStorage only in browser environment
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
    }

    // Update subjects
    this.currentUserSubject.next(null);
    this.tokenSubject.next(null);
  }

  getAuthHeaders(): { [key: string]: string } {
    const token = this.tokenValue;
    if (token) {
      return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
    }
    return {
      'Content-Type': 'application/json',
    };
  }

  login(email: string, password: string): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/User/login`, { email, password })
      .pipe(
        map((response) => {
          // Now login only returns a message about verification code being sent
          return response;
        })
      );
  }
  verifyCode(email: string, code: string): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/User/verify-code`, { email, code })
      .pipe(
        map((response) => {
          if (response && response.token && response.user) {
            const user: User = {
              id: response.user.id,
              nom: response.user.nom,
              prenom: response.user.prenom,
              email: response.user.email,
              type: response.user.type,
              createdAt: new Date(response.user.createdAt),
              isActive: response.user.isActive,
            };
            this.setAuthData(user, response.token);
          }
          return response;
        })
      );
  }

  isTokenValid(): boolean {
    const token = this.tokenValue;
    if (!token) return false;

    try {
      // Decode JWT without verification (just to check expiry)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      return Date.now() < exp;
    } catch {
      return false;
    }
  }

  getTokenExpirationDate(): Date | null {
    const token = this.tokenValue;
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      return new Date(exp);
    } catch {
      return null;
    }
  }
}
