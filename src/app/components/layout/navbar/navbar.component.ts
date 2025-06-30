import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter, map } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { LayoutService } from '../../../services/layout.service';
import { User, getUserTypeDisplayName } from '../../../models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  pageTitle = 'Dashboard';
  isDarkMode = false;
  isNotificationOpen = false;
  isProfileOpen = false;
  currentUser: User | null = null;
  isSidebarCollapsed = false;
  isMobileSearchOpen = false;
  isMobile = false;

  notifications = [
    {
      id: 1,
      title: 'New Order',
      message: 'You have a new order from customer',
      time: '2 min ago',
      unread: true,
    },
    {
      id: 2,
      title: 'Stock Alert',
      message: 'Product ABC is running low on stock',
      time: '1 hour ago',
      unread: true,
    },
    {
      id: 3,
      title: 'System Update',
      message: 'System will be updated tonight',
      time: '2 hours ago',
      unread: false,
    },
  ];
  constructor(
    private router: Router,
    private authService: AuthService,
    private layoutService: LayoutService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  ngOnInit(): void {
    // Subscribe to current user
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });

    // Subscribe to sidebar collapse state
    this.layoutService.sidebarCollapsed$.subscribe((collapsed) => {
      this.isSidebarCollapsed = collapsed;
    });

    // Subscribe to mobile state
    this.layoutService.isMobile$.subscribe((mobile) => {
      this.isMobile = mobile;
    });

    // Update page title based on current route
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => {
          const url = this.router.url;
          if (url.includes('dashboard')) return 'Dashboard';
          if (url.includes('articles')) return 'Articles';
          if (url.includes('categories')) return 'Categories';
          if (url.includes('promotions')) return 'Promotions';
          if (url.includes('ventes')) return 'Ventes';
          if (url.includes('stock')) return 'Stock';
          if (url.includes('department')) return 'Depots';
          if (url.includes('etablissement')) return 'Etablissement';
          if (url.includes('users')) return 'Gestion des Utilisateurs';
          if (url.includes('profile')) return 'Mon Profil';
          return 'Dashboard';
        })
      )
      .subscribe((title) => {
        this.pageTitle = title;
      });

    // Check for saved theme preference
    if (
      isPlatformBrowser(this.platformId) &&
      typeof localStorage !== 'undefined'
    ) {
      const savedTheme = localStorage.getItem('theme');
      this.isDarkMode = savedTheme === 'dark';
    }
    this.applyTheme();
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    if (
      isPlatformBrowser(this.platformId) &&
      typeof localStorage !== 'undefined'
    ) {
      localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    }
  }

  private applyTheme(): void {
    if (isPlatformBrowser(this.platformId) && typeof document !== 'undefined') {
      if (this.isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }

  toggleNotifications(): void {
    this.isNotificationOpen = !this.isNotificationOpen;
    this.isProfileOpen = false;
  }

  toggleProfile(): void {
    this.isProfileOpen = !this.isProfileOpen;
    this.isNotificationOpen = false;
  }

  markAsRead(notificationId: number): void {
    const notification = this.notifications.find(
      (n) => n.id === notificationId
    );
    if (notification) {
      notification.unread = false;
    }
  }

  get unreadCount(): number {
    return this.notifications.filter((n) => n.unread).length;
  }

  getUserTypeDisplay(): string {
    return this.currentUser
      ? getUserTypeDisplayName(this.currentUser.type)
      : '';
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
    this.isProfileOpen = false;
  }
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.isProfileOpen = false;
  }

  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }

  toggleMobileSidebar(): void {
    this.layoutService.toggleSidebar();
  }

  toggleDesktopSidebar(): void {
    this.layoutService.toggleSidebar();
  }

  toggleMobileSearch(): void {
    this.isMobileSearchOpen = !this.isMobileSearchOpen;
    // Close other dropdowns when opening search
    if (this.isMobileSearchOpen) {
      this.isNotificationOpen = false;
      this.isProfileOpen = false;
    }
  }

  closeMobileSearch(): void {
    this.isMobileSearchOpen = false;
  }
}
