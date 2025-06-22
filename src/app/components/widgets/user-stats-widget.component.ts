import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { UserStatsDto, UserType } from '../../models/user.model';

@Component({
  selector: 'app-user-stats-widget',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-stats-widget.component.html',
  styleUrls: ['./user-stats-widget.component.css'],
})
export class UserStatsWidgetComponent implements OnInit {
  userStats: UserStatsDto | null = null;
  isLoading = false;
  error = '';
  isAdmin = false;

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Check if user is admin
    this.authService.currentUser$.subscribe((user) => {
      this.isAdmin = user?.type === UserType.Admin;
      if (this.isAdmin) {
        this.loadUserStats();
      }
    });
  }

  loadUserStats(): void {
    this.isLoading = true;
    this.userService.getUserStats().subscribe({
      next: (stats) => {
        this.userStats = stats;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des statistiques';
        this.isLoading = false;
      },
    });
  }

  get activeUsersPercentage(): number {
    if (!this.userStats || this.userStats.totalUsers === 0) return 0;
    return Math.round(
      (this.userStats.activeUsers / this.userStats.totalUsers) * 100
    );
  }
}
