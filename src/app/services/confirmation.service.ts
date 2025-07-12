import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { ConfirmationConfig } from '../components/confirmation-modal/confirmation-modal.component';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationService {
  private confirmationSubject = new Subject<ConfirmationConfig>();
  private resultSubject = new Subject<boolean>();

  confirmation$ = this.confirmationSubject.asObservable();
  result$ = this.resultSubject.asObservable();

  confirm(config: ConfirmationConfig): Observable<boolean> {
    // Create a new observable for this specific confirmation
    return new Observable<boolean>((observer) => {
      // Set up a one-time subscription to the result
      const subscription = this.result$.subscribe((result) => {
        observer.next(result);
        observer.complete();
        subscription.unsubscribe();
      });

      // Trigger the confirmation modal
      this.confirmationSubject.next(config);
    });
  }

  // Quick methods for common confirmation types
  confirmDelete(itemName: string = 'this item'): Observable<boolean> {
    return this.confirm({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete ${itemName}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });
  }

  confirmAction(
    title: string,
    message: string,
    confirmText: string = 'Confirm'
  ): Observable<boolean> {
    return this.confirm({
      title,
      message,
      confirmText,
      cancelText: 'Cancel',
      type: 'warning',
    });
  }

  confirmDangerousAction(
    title: string,
    message: string,
    confirmText: string = 'Proceed'
  ): Observable<boolean> {
    return this.confirm({
      title,
      message,
      confirmText,
      cancelText: 'Cancel',
      type: 'danger',
    });
  }

  confirmInfo(
    title: string,
    message: string,
    confirmText: string = 'OK'
  ): Observable<boolean> {
    return this.confirm({
      title,
      message,
      confirmText,
      cancelText: 'Cancel',
      type: 'info',
    });
  }

  // Called by the modal component
  resolveConfirmation(result: boolean) {
    this.resultSubject.next(result);
  }
}
