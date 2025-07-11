import {
  Directive,
  ElementRef,
  OnInit,
  OnDestroy,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[appModalPortal]',
  standalone: true,
})
export class ModalPortalDirective implements OnInit, OnDestroy {
  private modalRoot: HTMLElement | null = null;
  private originalParent: HTMLElement | null = null;
  private originalNextSibling: Node | null = null;
  private hasMoved = false;

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    // Wait for next tick to ensure DOM is ready
    setTimeout(() => {
      this.moveToModal();
    }, 0);
  }

  ngOnDestroy() {
    this.restoreOriginalPosition();
  }

  private moveToModal() {
    if (this.hasMoved) return;

    this.modalRoot = document.getElementById('modal-root');

    if (this.modalRoot && this.elementRef.nativeElement) {
      // Store original position
      this.originalParent = this.elementRef.nativeElement.parentNode;
      this.originalNextSibling = this.elementRef.nativeElement.nextSibling;

      // Move to modal root
      this.modalRoot.appendChild(this.elementRef.nativeElement);
      this.hasMoved = true;
    }
  }

  private restoreOriginalPosition() {
    if (!this.hasMoved || !this.originalParent) return;

    try {
      if (this.originalNextSibling) {
        this.originalParent.insertBefore(
          this.elementRef.nativeElement,
          this.originalNextSibling
        );
      } else {
        this.originalParent.appendChild(this.elementRef.nativeElement);
      }
    } catch (error) {
      console.warn('Could not restore modal to original position:', error);
    }

    this.hasMoved = false;
  }
}
