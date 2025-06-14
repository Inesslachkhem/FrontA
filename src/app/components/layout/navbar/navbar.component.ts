import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter, map } from 'rxjs';

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
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // Update page title based on current route
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => {
          const url = this.router.url;
          if (url.includes('dashboard')) return 'Dashboard';
          if (url.includes('articles')) return 'Articles';
          if (url.includes('categories')) return 'Categories';
          if (url.includes('ventes')) return 'Ventes';
          if (url.includes('promotion')) return 'Promotion';
          if (url.includes('stock')) return 'Stock';
          if (url.includes('department')) return 'Department';
          if (url.includes('etablissement')) return 'Etablissement';
          return 'Dashboard';
        })
      )
      .subscribe((title) => {
        this.pageTitle = title;
      }); // Check for saved theme preference
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
}
