import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  private sidebarCollapsedSubject = new BehaviorSubject<boolean>(false);
  public sidebarCollapsed$ = this.sidebarCollapsedSubject.asObservable();

  constructor() {}

  toggleSidebar(): void {
    const currentState = this.sidebarCollapsedSubject.value;
    this.sidebarCollapsedSubject.next(!currentState);
  }

  setSidebarCollapsed(collapsed: boolean): void {
    this.sidebarCollapsedSubject.next(collapsed);
  }

  get isSidebarCollapsed(): boolean {
    return this.sidebarCollapsedSubject.value;
  }
}
