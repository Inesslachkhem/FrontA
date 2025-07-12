import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ConfirmationConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  icon?: string;
}

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="isVisible"
      class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      [class.opacity-0]="!isAnimating"
      [class.opacity-100]="isAnimating"
      style="transition: opacity 0.3s ease-in-out;"
      (click)="onBackdropClick($event)"
    >
      <div
        class="relative w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        [class.scale-95]="!isAnimating"
        [class.scale-100]="isAnimating"
        style="transition: transform 0.3s ease-out;"
        (click)="$event.stopPropagation()"
      >
        <!-- Header with Icon -->
        <div class="px-6 pt-6 pb-4 text-center">
          <div
            class="mx-auto flex items-center justify-center w-16 h-16 rounded-full mb-4"
            [ngClass]="{
              'bg-red-100 dark:bg-red-900/30': config.type === 'danger',
              'bg-amber-100 dark:bg-amber-900/30': config.type === 'warning',
              'bg-blue-100 dark:bg-blue-900/30':
                config.type === 'info' || !config.type
            }"
          >
            <svg
              class="w-8 h-8"
              [ngClass]="{
                'text-red-600 dark:text-red-400': config.type === 'danger',
                'text-amber-600 dark:text-amber-400': config.type === 'warning',
                'text-blue-600 dark:text-blue-400':
                  config.type === 'info' || !config.type
              }"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <!-- Danger/Warning Icon -->
              <path
                *ngIf="config.type === 'danger' || config.type === 'warning'"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
              <!-- Info Icon -->
              <path
                *ngIf="config.type === 'info' || !config.type"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
              />
            </svg>
          </div>

          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {{ config.title }}
          </h3>

          <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
            {{ config.message }}
          </p>
        </div>

        <!-- Actions -->
        <div
          class="px-6 py-4 bg-gray-50 dark:bg-gray-750 flex gap-3 justify-end"
        >
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            (click)="onCancel()"
          >
            {{ config.cancelText || 'Cancel' }}
          </button>

          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200"
            [ngClass]="{
              'bg-red-600 hover:bg-red-700 focus:ring-red-500':
                config.type === 'danger',
              'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500':
                config.type === 'warning',
              'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500':
                config.type === 'info' || !config.type
            }"
            (click)="onConfirm()"
          >
            {{ config.confirmText || 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .bg-gray-750 {
        background-color: rgb(55 65 81);
      }
    `,
  ],
})
export class ConfirmationModalComponent {
  @Input() config: ConfirmationConfig = {
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
  };

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  isVisible = false;
  isAnimating = false;

  show() {
    this.isVisible = true;
    // Trigger animation after a brief delay
    setTimeout(() => {
      this.isAnimating = true;
    }, 10);
  }

  hide() {
    this.isAnimating = false;
    // Hide completely after animation
    setTimeout(() => {
      this.isVisible = false;
    }, 300);
  }

  onConfirm() {
    this.confirmed.emit();
    this.hide();
  }

  onCancel() {
    this.cancelled.emit();
    this.hide();
  }

  onBackdropClick(event: Event) {
    // Close modal when clicking backdrop
    this.onCancel();
  }
}
