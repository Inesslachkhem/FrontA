import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { UserStatsDto } from '../../models/user.model';

@Component({
  selector: 'app-admin-stats-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Statistiques Administrateur
        </h3>
        <i class="fas fa-users-cog text-primary-600 text-xl"></i>
      </div>

      <div
        class="grid grid-cols-2 md:grid-cols-3 gap-4"
        *ngIf="userStats; else loadingTemplate"
      >
        <div
          class="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg"
        >
          <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {{ userStats.totalUsers }}
          </div>
          <div class="text-sm text-blue-700 dark:text-blue-300">
            Total Utilisateurs
          </div>
        </div>

        <div
          class="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-lg"
        >
          <div class="text-2xl font-bold text-green-600 dark:text-green-400">
            {{ userStats.activeUsers }}
          </div>
          <div class="text-sm text-green-700 dark:text-green-300">
            Utilisateurs Actifs
          </div>
        </div>

        <div
          class="text-center p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 rounded-lg"
        >
          <div class="text-2xl font-bold text-red-600 dark:text-red-400">
            {{ userStats.inactiveUsers }}
          </div>
          <div class="text-sm text-red-700 dark:text-red-300">
            Utilisateurs Inactifs
          </div>
        </div>

        <div
          class="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-lg"
        >
          <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {{ userStats.directeurCommercialCount }}
          </div>
          <div class="text-sm text-purple-700 dark:text-purple-300">
            Directeurs Commerciaux
          </div>
        </div>

        <div
          class="text-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 rounded-lg"
        >
          <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {{ userStats.responsablesStocksCount }}
          </div>
          <div class="text-sm text-orange-700 dark:text-orange-300">
            Responsables Stocks
          </div>
        </div>

        <div
          class="text-center p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900 dark:to-indigo-800 rounded-lg"
        >
          <div class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {{ getHealthPercentage() }}%
          </div>
          <div class="text-sm text-indigo-700 dark:text-indigo-300">
            Santé Système
          </div>
        </div>
      </div>

      <ng-template #loadingTemplate>
        <div class="flex items-center justify-center py-8">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"
          ></div>
          <span class="ml-2 text-gray-600 dark:text-gray-400"
            >Chargement des statistiques...</span
          >
        </div>
      </ng-template>

      <div
        class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700"
        *ngIf="userStats"
      >
        <div
          class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400"
        >
          <span>Dernière mise à jour:</span>
          <span>{{ lastUpdated | date : 'short' }}</span>
        </div>
      </div>
    </div>
  `,
})
export class AdminStatsWidgetComponent implements OnInit {
  userStats: UserStatsDto | null = null;
  lastUpdated = new Date();

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUserStats();
  }

  loadUserStats(): void {
    this.userService.getUserStats().subscribe({
      next: (stats) => {
        this.userStats = stats;
        this.lastUpdated = new Date();
      },
      error: (error) => {
        console.error('Error loading user stats:', error);
      },
    });
  }

  getHealthPercentage(): number {
    if (!this.userStats) return 0;

    const totalUsers = this.userStats.totalUsers;
    const activeUsers = this.userStats.activeUsers;

    if (totalUsers === 0) return 100;

    return Math.round((activeUsers / totalUsers) * 100);
  }
}
