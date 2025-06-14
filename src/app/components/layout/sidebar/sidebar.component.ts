import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
  expanded?: boolean;
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
    },
    {
      label: 'Department',
      icon: 'fas fa-building',
      route: '/department',
    },
    {
      label: 'Etablissement',
      icon: 'fas fa-university',
      route: '/etablissement',
    },
  ];

  ngOnInit(): void {}

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleSubmenu(item: MenuItem): void {
    if (item.children) {
      item.expanded = !item.expanded;
    }
  }
}
