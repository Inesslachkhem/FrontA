import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  User,
  CreateUserDto,
  UpdateUserDto,
  SignInDto,
  SignInResponseDto,
  UserStatsDto,
} from '../models/user.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl = 'http://localhost:5256/api/User';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHttpOptions(): { headers: HttpHeaders } {
    return {
      headers: new HttpHeaders(this.authService.getAuthHeaders()),
    };
  }
  private handleError(error: any): Observable<never> {
    console.error('UserService error:', error);
    let errorMessage = 'An error occurred';

    if (error.status === 0) {
      errorMessage =
        'Unable to connect to server. Please check if the backend is running.';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status) {
      errorMessage = `Server error: ${error.status} ${error.statusText}`;
    }

    return throwError(() => ({ ...error, message: errorMessage }));
  }

  // GET: api/User
  getUsers(): Observable<User[]> {
    return this.http
      .get<User[]>(this.apiUrl, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  // GET: api/User/{id}
  getUser(id: number): Observable<User> {
    return this.http
      .get<User>(`${this.apiUrl}/${id}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  // POST: api/User
  createUser(createUserDto: CreateUserDto): Observable<User> {
    return this.http
      .post<User>(this.apiUrl, createUserDto, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  // PUT: api/User/{id}
  updateUser(id: number, updateUserDto: UpdateUserDto): Observable<void> {
    return this.http
      .put<void>(`${this.apiUrl}/${id}`, updateUserDto, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  // DELETE: api/User/{id}
  deleteUser(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }
  // POST: api/User/signin
  signIn(signInDto: SignInDto): Observable<SignInResponseDto> {
    console.log('UserService signIn called with:', signInDto);
    console.log('API URL:', `${this.apiUrl}/signin`);

    return this.http
      .post<SignInResponseDto>(`${this.apiUrl}/signin`, signInDto, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      })
      .pipe(catchError(this.handleError));
  }

  // GET: api/User/active
  getActiveUsers(): Observable<User[]> {
    return this.http
      .get<User[]>(`${this.apiUrl}/active`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  // GET: api/User/stats
  getUserStats(): Observable<UserStatsDto> {
    return this.http
      .get<UserStatsDto>(`${this.apiUrl}/stats`, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  // POST: api/User/seed-admin
  seedAdmin(): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/seed-admin`, {})
      .pipe(catchError(this.handleError));
  }
}
