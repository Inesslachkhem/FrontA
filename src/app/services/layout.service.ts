import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  private sidebarCollapsedSubject = new BehaviorSubject<boolean>(false);
  private mobileBreakpoint = 768; // md breakpoint
  private isMobileSubject = new BehaviorSubject<boolean>(false);
  private sidebarMobileOpenSubject = new BehaviorSubject<boolean>(false);

  public sidebarCollapsed$ = this.sidebarCollapsedSubject.asObservable();
  public isMobile$ = this.isMobileSubject.asObservable();
  public sidebarMobileOpen$ = this.sidebarMobileOpenSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeResponsiveListener();
      this.checkScreenSize();
    }
  }

  private initializeResponsiveListener(): void {
    fromEvent(window, 'resize')
      .pipe(debounceTime(150))
      .subscribe(() => {
        this.checkScreenSize();
      });
  }

  private checkScreenSize(): void {
    if (isPlatformBrowser(this.platformId)) {
      const isMobile = window.innerWidth < this.mobileBreakpoint;
      this.isMobileSubject.next(isMobile);
      
      // Auto-collapse sidebar on mobile, expand on desktop
      if (isMobile) {
        this.sidebarCollapsedSubject.next(true);
        this.sidebarMobileOpenSubject.next(false);
      } else {
        // On desktop, restore previous state or default to expanded
        const wasCollapsed = this.getStoredSidebarState();
        this.sidebarCollapsedSubject.next(wasCollapsed);
      }
    }
  }

  toggleSidebar(): void {
    const isMobile = this.isMobileSubject.value;
    
    if (isMobile) {
      // On mobile, toggle the mobile overlay
      const currentMobileState = this.sidebarMobileOpenSubject.value;
      this.sidebarMobileOpenSubject.next(!currentMobileState);
    } else {
      // On desktop, toggle collapse state
      const currentState = this.sidebarCollapsedSubject.value;
      this.sidebarCollapsedSubject.next(!currentState);
      this.storeSidebarState(!currentState);
    }
  }

  setSidebarCollapsed(collapsed: boolean): void {
    this.sidebarCollapsedSubject.next(collapsed);
    if (!this.isMobileSubject.value) {
      this.storeSidebarState(collapsed);
    }
  }

  closeMobileSidebar(): void {
    this.sidebarMobileOpenSubject.next(false);
  }

  private storeSidebarState(collapsed: boolean): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
    }
  }

  private getStoredSidebarState(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem('sidebarCollapsed');
      return stored ? JSON.parse(stored) : false;
    }
    return false;
  }

  get isSidebarCollapsed(): boolean {
    return this.sidebarCollapsedSubject.value;
  }

  get isMobile(): boolean {
    return this.isMobileSubject.value;
  }

  get isSidebarMobileOpen(): boolean {
    return this.sidebarMobileOpenSubject.value;
  }
}
