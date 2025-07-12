import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class TokenValidationService {
  private checkInterval?: any;
  private isWarningShown = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  startTokenValidation() {
    // Start with checking every 30 minutes for a 24-hour token
    this.scheduleNextCheck(30 * 60 * 1000);

    // Check immediately
    this.checkTokenValidity();
  }

  stopTokenValidation() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = undefined;
    }
    this.isWarningShown = false;
  }

  private scheduleNextCheck(interval: number) {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(() => {
      this.checkTokenValidity();
    }, interval);
  }

  private checkTokenValidity() {
    if (!this.authService.isAuthenticated) {
      this.stopTokenValidation();
      return;
    }

    const timeRemaining = this.getTimeUntilExpiration();

    if (timeRemaining === null || timeRemaining <= 0) {
      // Token expired
      console.warn('🔐 Token has expired, logging out user...');
      this.handleTokenExpiration();
      return;
    }

    // Adjust check frequency based on time remaining
    const oneHour = 60 * 60 * 1000;
    const thirtyMinutes = 30 * 60 * 1000;
    const fiveMinutes = 5 * 60 * 1000;

    if (timeRemaining <= thirtyMinutes) {
      // Check every minute when less than 30 minutes remain
      this.scheduleNextCheck(60 * 1000);

      // Show warning once when 30 minutes or less remain
      if (!this.isWarningShown && timeRemaining <= thirtyMinutes) {
        this.isWarningShown = true;
        console.warn(`⚠️ Token will expire in ${this.formatTimeRemaining()}`);

        // Show notification for session expiring soon
        if (timeRemaining <= fiveMinutes) {
          this.notificationService.sessionExpiring(this.formatTimeRemaining());
        }
      }
    } else if (timeRemaining <= oneHour) {
      // Check every 5 minutes when less than 1 hour remains
      this.scheduleNextCheck(fiveMinutes);
    } else {
      // Check every 30 minutes when more than 1 hour remains
      this.scheduleNextCheck(thirtyMinutes);
    }
  }

  private handleTokenExpiration() {
    // Clear expired token
    this.authService.logout();

    // Stop validation
    this.stopTokenValidation();

    // Show notification instead of alert
    this.notificationService.sessionExpired();

    // Redirect to login after a short delay
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 1000);
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

    const totalMinutes = Math.floor(timeRemaining / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  // Method to manually refresh token if needed (can be called by user action)
  checkAndWarnIfExpiringSoon(): boolean {
    const timeRemaining = this.getTimeUntilExpiration();
    if (!timeRemaining) return false;

    const fiveMinutes = 5 * 60 * 1000;

    if (timeRemaining <= fiveMinutes) {
      const shouldContinue = confirm(
        `Votre session expire dans ${this.formatTimeRemaining()}. Cliquez OK pour continuer ou Annuler pour vous déconnecter.`
      );

      if (!shouldContinue) {
        this.handleTokenExpiration();
        return false;
      }
    }

    return true;
  }
}
