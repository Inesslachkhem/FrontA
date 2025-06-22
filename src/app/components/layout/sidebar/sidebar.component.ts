import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LayoutService } from '../../../services/layout.service';
import { User, UserType } from '../../../models/user.model';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
  expanded?: boolean;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  isCollapsed = false;
  currentUser: User | null = null;
  userTypeEnum = UserType; // Make UserType enum available in template

  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'fas fa-tachometer-alt',
      route: '/dashboard',
    },
    {
      label: 'Articles',
      icon: 'fas fa-file-alt',
      children: [
        { label: 'Categories', icon: 'fas fa-tags', route: '/categories' },
        { label: 'All Articles', icon: 'fas fa-list', route: '/articles' },
      ],
      expanded: false,
    },
    {
      label: 'Ventes',
      icon: 'fas fa-shopping-cart',
      route: '/ventes',
    },
    {
      label: 'Promotion',
      icon: 'fas fa-bullseye',
      route: '/promotion',
    },
    {
      label: 'Stock',
      icon: 'fas fa-boxes',
      route: '/stock',
    },    {
      label: 'Depots',
      icon: 'fas fa-warehouse',
      route: '/department',
    },
    {
      label: 'Etablissement',
      icon: 'fas fa-university',
      route: '/etablissement',
    },
    {
      label: 'Administration',
      icon: 'fas fa-cog',
      children: [
        { label: 'Utilisateurs', icon: 'fas fa-users', route: '/users' },
        {
          label: 'Profil Admin',
          icon: 'fas fa-user-shield',
          route: '/admin/profile',
        },
        {
          label: 'Statistiques',
          icon: 'fas fa-chart-bar',
          route: '/admin/stats',
        },
        {
          label: 'Paramètres',
          icon: 'fas fa-sliders-h',
          route: '/admin/settings',
        },
      ],
    },
  ];

  constructor(
    private authService: AuthService,
    private layoutService: LayoutService
  ) {}
  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });

    // Subscribe to layout service for sidebar collapse state
    this.layoutService.sidebarCollapsed$.subscribe((collapsed) => {
      this.isCollapsed = collapsed;
    });
  }
  toggleSidebar(): void {
    this.layoutService.toggleSidebar();
  }

  toggleSubmenu(item: MenuItem): void {
    if (item.children) {
      item.expanded = !item.expanded;
    }
  }

  isMenuItemVisible(item: MenuItem): boolean {
    if (item.adminOnly) {
      return this.currentUser?.type === UserType.Admin;
    }
    return true;
  }

  get filteredMenuItems(): MenuItem[] {
    return this.menuItems.filter((item) => this.isMenuItemVisible(item));
  }
}
