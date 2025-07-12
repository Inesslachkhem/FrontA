import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  closing?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private toastsSubject = new BehaviorSubject<ToastNotification[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  show(
    type: ToastNotification['type'],
    title: string,
    message?: string,
    duration = 5000
  ) {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const toast: ToastNotification = {
      id,
      type,
      title,
      message,
      duration,
      closing: false,
    };

    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, toast]);

    // Auto-hide after duration
    if (duration > 0) {
      setTimeout(() => {
        this.hide(toast.id);
      }, duration);
    }

    return toast.id;
  }

  hide(toastId: string) {
    const currentToasts = this.toastsSubject.value;
    const toast = currentToasts.find((t) => t.id === toastId);

    if (toast) {
      // Mark as closing for animation
      toast.closing = true;
      this.toastsSubject.next([...currentToasts]);

      // Remove after animation completes
      setTimeout(() => {
        const updatedToasts = this.toastsSubject.value.filter(
          (t) => t.id !== toastId
        );
        this.toastsSubject.next(updatedToasts);
      }, 300);
    }
  }

  clear() {
    this.toastsSubject.next([]);
  }

  // Convenience methods
  success(title: string, message?: string, duration = 5000) {
    return this.show('success', title, message, duration);
  }

  error(title: string, message?: string, duration = 7000) {
    return this.show('error', title, message, duration);
  }

  warning(title: string, message?: string, duration = 6000) {
    return this.show('warning', title, message, duration);
  }

  info(title: string, message?: string, duration = 5000) {
    return this.show('info', title, message, duration);
  }

  // Special method for session expiration warnings
  sessionExpiring(timeRemaining: string) {
    return this.warning(
      'Session expirée bientôt',
      `Votre session expire dans ${timeRemaining}. Votre activité sera sauvegardée automatiquement.`,
      10000 // 10 seconds for important session warnings
    );
  }

  sessionExpired() {
    return this.error(
      'Session expirée',
      'Votre session a expiré. Redirection vers la page de connexion...',
      3000
    );
  }
}
