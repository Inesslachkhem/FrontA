import {
  Component,
  OnInit,
  HostListener,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { LayoutService } from '../../../services/layout.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    SidebarComponent,
    NavbarComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
})
export class MainLayoutComponent implements OnInit {
  isMobile = false;
  sidebarOpen = false;
  sidebarCollapsed = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private layoutService: LayoutService
  ) {}
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.checkScreenSize();
    }

    // Subscribe to sidebar collapse state
    this.layoutService.sidebarCollapsed$.subscribe((collapsed) => {
      this.sidebarCollapsed = collapsed;
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    if (isPlatformBrowser(this.platformId)) {
      this.checkScreenSize();
    }
  }

  private checkScreenSize(): void {
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined') {
      this.isMobile = window.innerWidth < 768;
      if (!this.isMobile) {
        this.sidebarOpen = false;
      }
    }
  }

  toggleMobileSidebar(): void {
    if (this.isMobile) {
      this.sidebarOpen = !this.sidebarOpen;
    }
  }

  closeMobileSidebar(): void {
    if (this.isMobile) {
      this.sidebarOpen = false;
    }
  }
}
