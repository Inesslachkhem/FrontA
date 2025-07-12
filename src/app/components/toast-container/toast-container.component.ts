import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import {
  NotificationService,
  ToastNotification,
} from '../../services/notification.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 max-w-sm w-full space-y-3">
      <div
        *ngFor="let toast of toasts$ | async"
        class="toast transform transition-all duration-300 ease-in-out"
        [class.opacity-0]="toast.closing"
        [class.translate-x-full]="toast.closing"
        [class.scale-95]="toast.closing"
        [ngClass]="{
          'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 border-l-4 border-l-green-500':
            toast.type === 'success',
          'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 border-l-4 border-l-red-500':
            toast.type === 'error',
          'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700 border-l-4 border-l-yellow-500':
            toast.type === 'warning',
          'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 border-l-4 border-l-blue-500':
            toast.type === 'info'
        }"
      >
        <div class="p-4 rounded-xl shadow-lg border flex items-start gap-3">
          <i
            class="fas mt-0.5 text-lg"
            [ngClass]="{
              'fa-check-circle text-green-500 dark:text-green-400':
                toast.type === 'success',
              'fa-exclamation-circle text-red-500 dark:text-red-400':
                toast.type === 'error',
              'fa-exclamation-triangle text-yellow-500 dark:text-yellow-400':
                toast.type === 'warning',
              'fa-info-circle text-blue-500 dark:text-blue-400':
                toast.type === 'info'
            }"
          ></i>
          <div class="flex-1">
            <p
              class="font-medium text-sm"
              [ngClass]="{
                'text-green-800 dark:text-green-200': toast.type === 'success',
                'text-red-800 dark:text-red-200': toast.type === 'error',
                'text-yellow-800 dark:text-yellow-200':
                  toast.type === 'warning',
                'text-blue-800 dark:text-blue-200': toast.type === 'info'
              }"
            >
              {{ toast.title }}
            </p>
            <p
              *ngIf="toast.message"
              class="text-xs mt-1"
              [ngClass]="{
                'text-green-600 dark:text-green-300': toast.type === 'success',
                'text-red-600 dark:text-red-300': toast.type === 'error',
                'text-yellow-600 dark:text-yellow-300':
                  toast.type === 'warning',
                'text-blue-600 dark:text-blue-300': toast.type === 'info'
              }"
            >
              {{ toast.message }}
            </p>
          </div>
          <button
            (click)="hideToast(toast.id)"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Fermer"
          >
            <i class="fas fa-times text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .toast {
        animation: slideInRight 0.3s ease-out;
      }

      @keyframes slideInRight {
        from {
          opacity: 0;
          transform: translateX(100%) scale(0.9);
        }
        to {
          opacity: 1;
          transform: translateX(0) scale(1);
        }
      }
    `,
  ],
})
export class ToastContainerComponent implements OnInit {
  toasts$: Observable<ToastNotification[]>;

  constructor(private notificationService: NotificationService) {
    this.toasts$ = this.notificationService.toasts$;
  }

  ngOnInit() {
    // Component initialization
  }

  hideToast(toastId: string) {
    this.notificationService.hide(toastId);
  }
}
