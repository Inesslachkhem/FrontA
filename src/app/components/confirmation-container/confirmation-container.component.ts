import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConfirmationService } from '../../services/confirmation.service';
import {
  ConfirmationModalComponent,
  ConfirmationConfig,
} from '../confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-confirmation-container',
  standalone: true,
  imports: [ConfirmationModalComponent],
  template: `
    <app-confirmation-modal
      #confirmationModal
      [config]="currentConfig"
      (confirmed)="onConfirmed()"
      (cancelled)="onCancelled()"
    ></app-confirmation-modal>
  `,
})
export class ConfirmationContainerComponent implements OnInit, OnDestroy {
  @ViewChild('confirmationModal')
  confirmationModal!: ConfirmationModalComponent;

  currentConfig: ConfirmationConfig = {
    title: '',
    message: '',
  };

  private subscription?: Subscription;

  constructor(private confirmationService: ConfirmationService) {}

  ngOnInit() {
    this.subscription = this.confirmationService.confirmation$.subscribe(
      (config: ConfirmationConfig) => {
        this.currentConfig = config;
        this.confirmationModal.show();
      }
    );
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onConfirmed() {
    this.confirmationService.resolveConfirmation(true);
  }

  onCancelled() {
    this.confirmationService.resolveConfirmation(false);
  }
}
