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
    // Subscribe to layout service observables
    this.layoutService.isMobile$.subscribe((mobile) => {
      this.isMobile = mobile;
    });

    this.layoutService.sidebarMobileOpen$.subscribe((open) => {
      this.sidebarOpen = open;
    });

    this.layoutService.sidebarCollapsed$.subscribe((collapsed) => {
      this.sidebarCollapsed = collapsed;
    });
  }

  toggleMobileSidebar(): void {
    this.layoutService.toggleSidebar();
  }

  closeMobileSidebar(): void {
    this.layoutService.closeMobileSidebar();
  }
}
