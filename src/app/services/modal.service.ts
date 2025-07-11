import {
  Injectable,
  TemplateRef,
  ComponentRef,
  ViewContainerRef,
} from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private overlayRef: OverlayRef | null = null;

  constructor(private overlay: Overlay) {}

  // Open a modal using a template
  openModal(
    template: TemplateRef<any>,
    viewContainerRef: ViewContainerRef,
    context?: any
  ): OverlayRef {
    console.log('Opening modal...', template, viewContainerRef);

    // Close any existing modal first
    if (this.overlayRef) {
      console.log('Closing existing modal');
      this.closeModal();
    }

    // Create overlay with normal dimensions
    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'modal-backdrop-overlay',
      width: '60vw',
      height: 'auto',
      maxWidth: '800px',
      maxHeight: '80vh',
      positionStrategy: this.overlay
        .position()
        .global()
        .centerHorizontally()
        .centerVertically(),
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });

    console.log('Overlay created:', this.overlayRef);

    // Create portal
    const templatePortal = new TemplatePortal(template, viewContainerRef, {
      $implicit: context,
    });

    console.log('Template portal created:', templatePortal);

    // Attach portal to overlay
    this.overlayRef.attach(templatePortal);
    console.log('Portal attached to overlay');

    // Handle backdrop clicks
    this.overlayRef.backdropClick().subscribe(() => {
      console.log('Backdrop clicked');
      this.closeModal();
    });

    return this.overlayRef;
  }

  // Close the current modal
  closeModal() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }

  // Check if modal is open
  isModalOpen(): boolean {
    return !!this.overlayRef;
  }
}
