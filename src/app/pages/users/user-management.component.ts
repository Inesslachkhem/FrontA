import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import {
  User,
  CreateUserDto,
  UpdateUserDto,
  UserType,
  UserStatsDto,
  getUserTypeDisplayName,
} from '../../models/user.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  activeUsers: User[] = [];
  userStats: UserStatsDto | null = null;

  // Form states
  showCreateForm = false;
  showEditForm = false;
  selectedUser: User | null = null;

  // Form models
  createUserDto: CreateUserDto = {
    nom: '',
    prenom: '',
    email: '',
    password: '',
    type: null as any, // Initialiser à null pour forcer la sélection
  };

  updateUserDto: UpdateUserDto = {
    nom: '',
    prenom: '',
    email: '',
    password: '',
    type: undefined as unknown as UserType,
    isActive: true,
  };

  // Loading states
  isLoading = false;
  isCreating = false;
  isUpdating = false;

  // Error handling
  errorMessage = '';
  successMessage = '';

  // Enums for template
  UserType = UserType;

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadActiveUsers();
    this.loadUserStats();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (error) => {
        this.showError(
          'Erreur lors du chargement des utilisateurs: ' + error.message
        );
        this.isLoading = false;
      },
    });
  }

  loadActiveUsers(): void {
    this.userService.getActiveUsers().subscribe({
      next: (users) => {
        this.activeUsers = users;
      },
      error: (error) => {
        console.error('Error loading active users:', error);
      },
    });
  }

  loadUserStats(): void {
    this.userService.getUserStats().subscribe({
      next: (stats) => {
        this.userStats = stats;
      },
      error: (error) => {
        console.error('Error loading user stats:', error);
      },
    });
  }

  // Create user methods
  openCreateForm(): void {
    this.showCreateForm = true;
    this.resetCreateForm();
    this.clearMessages();
  }

  closeCreateForm(): void {
    this.showCreateForm = false;
    this.resetCreateForm();
  }
  resetCreateForm(): void {
    this.createUserDto = {
      nom: '',
      prenom: '',
      email: '',
      password: '',
      type: null as any, // Initialiser à null pour forcer la sélection
    };
  }

  createUser(): void {
    if (!this.validateCreateForm()) {
      return;
    }

    this.isCreating = true;
    this.userService.createUser(this.createUserDto).subscribe({
      next: (user) => {
        this.showSuccess('Utilisateur créé avec succès');
        this.closeCreateForm();
        this.loadUsers();
        this.loadActiveUsers();
        this.loadUserStats();
        this.isCreating = false;
      },
      error: (error) => {
        // Affichage détaillé des erreurs de validation backend
        if (error.error && error.error.errors) {
          const errors = error.error.errors;
          const messages: string[] = [];
          for (const key in errors) {
            if (Array.isArray(errors[key])) {
              messages.push(...errors[key]);
            }
          }
          this.showError(messages.join('\n'));
        } else {
          this.showError('Erreur lors de la création: ' + error.message);
        }
        this.isCreating = false;
      },
    });
  }

  // Edit user methods
  openEditForm(user: User): void {
    this.selectedUser = user;
    this.updateUserDto = {
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      password: '',
      type: user.type,
      isActive: user.isActive,
    };
    this.showEditForm = true;
    this.clearMessages();
  }

  closeEditForm(): void {
    this.showEditForm = false;
    this.selectedUser = null;
  }

  updateUser(): void {
    if (!this.selectedUser || !this.validateUpdateForm()) {
      return;
    }

    this.isUpdating = true;
    this.userService
      .updateUser(this.selectedUser.id, this.updateUserDto)
      .subscribe({
        next: () => {
          this.showSuccess('Utilisateur mis à jour avec succès');
          this.closeEditForm();
          this.loadUsers();
          this.loadActiveUsers();
          this.loadUserStats();
          this.isUpdating = false;
        },
        error: (error) => {
          this.showError('Erreur lors de la mise à jour: ' + error.message);
          this.isUpdating = false;
        },
      });
  }

  // Delete user method
  deleteUser(user: User): void {
    if (
      confirm(
        `Êtes-vous sûr de vouloir désactiver l'utilisateur ${user.prenom} ${user.nom} ?`
      )
    ) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.showSuccess('Utilisateur désactivé avec succès');
          this.loadUsers();
          this.loadActiveUsers();
          this.loadUserStats();
        },
        error: (error) => {
          this.showError('Erreur lors de la désactivation: ' + error.message);
        },
      });
    }
  }

  // Validation methods
  validateCreateForm(): boolean {
    // Vérifier si tous les champs requis sont remplis
    if (!this.createUserDto.nom?.trim()) {
      this.showError('Le nom est obligatoire');
      return false;
    }

    if (!this.createUserDto.prenom?.trim()) {
      this.showError('Le prénom est obligatoire');
      return false;
    }

    if (!this.createUserDto.email?.trim()) {
      this.showError('L\'email est obligatoire');
      return false;
    }

    if (!this.createUserDto.password?.trim()) {
      this.showError('Le mot de passe est obligatoire');
      return false;
    }

    // Vérification spécifique pour le type d'utilisateur
    if (this.createUserDto.type === undefined || this.createUserDto.type === null || isNaN(this.createUserDto.type)) {
      this.showError('Veuillez sélectionner un type d\'utilisateur');
      return false;
    }

    // Validation du format email
    if (!this.isValidEmail(this.createUserDto.email)) {
      this.showError('Format d\'email invalide');
      return false;
    }

    // Validation de la longueur du mot de passe
    if (this.createUserDto.password.length < 6) {
      this.showError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }

    return true;
  }

  validateUpdateForm(): boolean {
    if (
      !this.updateUserDto.nom ||
      !this.updateUserDto.prenom ||
      !this.updateUserDto.email
    ) {
      this.showError('Les champs nom, prénom et email sont obligatoires');
      return false;
    }

    if (!this.isValidEmail(this.updateUserDto.email)) {
      this.showError("Format d'email invalide");
      return false;
    }

    if (this.updateUserDto.password && this.updateUserDto.password.length < 6) {
      this.showError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }

    return true;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Utility methods
  getUserTypeDisplay(type: UserType): string {
    return getUserTypeDisplayName(type);
  }

  showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => this.clearMessages(), 5000);
  }

  showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => this.clearMessages(), 5000);
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  canEditUser(user: User): boolean {
    const currentUser = this.authService.currentUserValue;
    return currentUser?.type === UserType.Admin || currentUser?.id === user.id;
  }

  canDeleteUser(user: User): boolean {
    const currentUser = this.authService.currentUserValue;
    return currentUser?.type === UserType.Admin && currentUser?.id !== user.id;
  }
}
