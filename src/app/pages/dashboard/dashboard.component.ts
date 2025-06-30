import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ArticleService } from '../../services/article.service';
import { AuthService } from '../../services/auth.service';
import { Article } from '../../models/article.model';
import { User, UserType } from '../../models/user.model';
import { AdminStatsWidgetComponent } from '../../components/widgets/admin-stats-widget.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminStatsWidgetComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  loading = false;
  currentUser: User | null = null;

  // Core data
  articles: Article[] = [];

  // Counts
  articlesCount = 0;

  // Stats for the dashboard display
  stats: any[] = [];

  constructor(
    private articleService: ArticleService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
    this.loadDashboardData();
  }

  get isAdmin(): boolean {
    return this.currentUser?.type === UserType.Admin;
  }

  loadDashboardData() {
    this.loading = true;

    // Load articles
    this.articleService.getAll().subscribe({
      next: (articles) => {
        this.articles = articles;
        this.articlesCount = articles.length;
        this.updateStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading articles:', error);
        this.updateStats();
        this.loading = false;
      },
    });
  }

  updateStats() {
    this.stats = [
      {
        title: 'Total Articles',
        value: this.articlesCount,
        changeType: 'neutral',
        icon: 'fas fa-box',
        color: 'blue',
      },
    ];
  }
}
