import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);
  const authToken = authService.tokenValue;

  // If we have a token, clone the request and add authorization header
  if (authToken) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 Unauthorized errors (token expired or invalid)
        if (error.status === 401) {
          console.warn(
            '🔐 Token expired or unauthorized access detected. Redirecting to login...'
          );

          // Clear the expired/invalid token
          authService.logout();

          // Show user-friendly notification
          notificationService.sessionExpired();

          // Redirect to login page after a short delay
          setTimeout(() => {
            router.navigate(['/login']);
          }, 1000);
        }

        return throwError(() => error);
      })
    );
  }

  // If no token, pass the original request
  return next(req);
};
