import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class TokenValidationService {
  private checkInterval?: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  startTokenValidation() {
    // Check token validity every 5 minutes
    this.checkInterval = setInterval(() => {
      this.checkTokenValidity();
    }, 5 * 60 * 1000);

    // Check immediately
    this.checkTokenValidity();
  }

  stopTokenValidation() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = undefined;
    }
  }

  private checkTokenValidity() {
    if (this.authService.isAuthenticated && !this.authService.isTokenValid()) {
      console.warn('⚠️ Token has expired, logging out user...');
      
      // Clear expired token
      this.authService.logout();
      
      // Show notification
      alert('Votre session a expiré. Veuillez vous reconnecter.');
      
      // Redirect to login
      this.router.navigate(['/login']);
    }
  }

  getTimeUntilExpiration(): number | null {
    const expirationDate = this.authService.getTokenExpirationDate();
    if (!expirationDate) return null;

    const now = new Date();
    const timeRemaining = expirationDate.getTime() - now.getTime();
    return Math.max(0, timeRemaining);
  }

  formatTimeRemaining(): string {
    const timeRemaining = this.getTimeUntilExpiration();
    if (!timeRemaining) return 'Invalid token';

    const minutes = Math.floor(timeRemaining / (1000 * 60));
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else {
      return `${minutes}m`;
    }
  }
}
