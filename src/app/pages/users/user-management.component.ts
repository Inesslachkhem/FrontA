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

// Toast interface
interface Toast {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
  isVisible: boolean;
}

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
    type: undefined as any, // Undefined to force selection
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

  // Toast system
  toasts: Toast[] = [];
  private toastId = 0;

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
      type: undefined as any, // Undefined to force selection
    };
  }

  createUser(): void {
    if (!this.validateCreateForm()) {
      return;
    }

    // Ensure the type is converted to a number (enum value)
    const userDto = {
      ...this.createUserDto,
      type: Number(this.createUserDto.type),
    };

    console.log('Creating user with data:', userDto);
    console.log('Original type value:', this.createUserDto.type);
    console.log('Converted type value:', userDto.type);

    this.isCreating = true;
    this.userService.createUser(userDto).subscribe({
      next: (user) => {
        console.log('User created successfully:', user);
        this.showSuccess('Utilisateur créé avec succès');
        this.closeCreateForm();
        this.loadUsers();
        this.loadActiveUsers();
        this.loadUserStats();
        this.isCreating = false;
      },
      error: (error) => {
        console.error('Error creating user:', error);
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

    console.log('Update User DTO before conversion:', this.updateUserDto);

    // Convert type to number to ensure proper serialization
    const updateData = {
      ...this.updateUserDto,
      type: Number(this.updateUserDto.type),
    };

    console.log('Update User DTO after conversion:', updateData);

    this.isUpdating = true;
    this.userService.updateUser(this.selectedUser.id, updateData).subscribe({
      next: () => {
        this.showSuccess('Utilisateur mis à jour avec succès');
        this.closeEditForm();
        this.loadUsers();
        this.loadActiveUsers();
        this.loadUserStats();
        this.isUpdating = false;
      },
      error: (error) => {
        console.error('Update user error:', error);
        if (error.error && typeof error.error === 'object') {
          // Handle validation errors
          const errorDetails = error.error;
          console.log('Error details:', errorDetails);

          if (errorDetails.errors) {
            const messages: string[] = [];
            for (const key in errorDetails.errors) {
              const errors = errorDetails.errors[key];
              messages.push(...errors);
            }
            this.showError(messages.join('\n'));
          } else if (errorDetails.message) {
            this.showError(
              'Erreur lors de la mise à jour: ' + errorDetails.message
            );
          } else {
            this.showError('Erreur lors de la mise à jour: ' + error.message);
          }
        } else {
          this.showError('Erreur lors de la mise à jour: ' + error.message);
        }
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
      this.showError("L'email est obligatoire");
      return false;
    }

    if (!this.createUserDto.password?.trim()) {
      this.showError('Le mot de passe est obligatoire');
      return false;
    }

    // Vérification spécifique pour le type d'utilisateur
    if (
      this.createUserDto.type === undefined ||
      this.createUserDto.type === null
    ) {
      this.showError("Veuillez sélectionner un type d'utilisateur");
      return false;
    }

    // Ensure type is a valid enum value
    const typeNumber = Number(this.createUserDto.type);
    if (isNaN(typeNumber) || !Object.values(UserType).includes(typeNumber)) {
      this.showError("Type d'utilisateur invalide");
      return false;
    }

    // Validation du format email
    if (!this.isValidEmail(this.createUserDto.email)) {
      this.showError("Format d'email invalide");
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

    // Vérification spécifique pour le type d'utilisateur
    if (
      this.updateUserDto.type === undefined ||
      this.updateUserDto.type === null
    ) {
      this.showError("Veuillez sélectionner un type d'utilisateur");
      return false;
    }

    // Ensure type is a valid enum value
    const typeNumber = Number(this.updateUserDto.type);
    if (isNaN(typeNumber) || !Object.values(UserType).includes(typeNumber)) {
      this.showError("Type d'utilisateur invalide");
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

  // Toast system methods
  showToast(
    type: 'success' | 'error' | 'info' | 'warning',
    title: string,
    message: string,
    duration: number = 5000
  ): void {
    const toast: Toast = {
      id: ++this.toastId,
      type,
      title,
      message,
      duration,
      isVisible: true,
    };

    this.toasts.push(toast);

    // Auto-remove toast after duration
    setTimeout(() => {
      this.removeToast(toast.id);
    }, duration);
  }

  removeToast(id: number): void {
    const index = this.toasts.findIndex((toast) => toast.id === id);
    if (index > -1) {
      this.toasts[index].isVisible = false;
      // Remove from array after animation completes
      setTimeout(() => {
        this.toasts.splice(index, 1);
      }, 300);
    }
  }

  showError(message: string): void {
    this.showToast('error', 'Erreur', message);
    // Keep old behavior for compatibility
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => this.clearMessages(), 5000);
  }

  showSuccess(message: string): void {
    this.showToast('success', 'Succès', message);
    // Keep old behavior for compatibility
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => this.clearMessages(), 5000);
  }

  showInfo(message: string): void {
    this.showToast('info', 'Information', message);
  }

  showWarning(message: string): void {
    this.showToast('warning', 'Attention', message);
  }

  trackByToastId(index: number, toast: Toast): number {
    return toast.id;
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

  // New methods for enhanced functionality
  reactivateUser(user: User): void {
    if (
      confirm(
        `Êtes-vous sûr de vouloir réactiver l'utilisateur ${user.prenom} ${user.nom} ?`
      )
    ) {
      const updateData = {
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        password: '', // Empty password to keep existing
        type: Number(user.type),
        isActive: true,
      };

      this.userService.updateUser(user.id, updateData).subscribe({
        next: () => {
          this.showSuccess('Utilisateur réactivé avec succès');
          this.loadUsers();
          this.loadActiveUsers();
          this.loadUserStats();
        },
        error: (error) => {
          this.showError('Erreur lors de la réactivation: ' + error.message);
        },
      });
    }
  }

  viewUserDetails(user: User): void {
    // You can implement a modal or navigation to user details page
    this.showInfo(
      `Détails de l'utilisateur: ${user.prenom} ${user.nom}\n` +
        `Email: ${user.email}\n` +
        `Type: ${this.getUserTypeDisplay(user.type)}\n` +
        `Statut: ${user.isActive ? 'Actif' : 'Inactif'}\n` +
        `Créé le: ${this.formatDate(user.createdAt)}\n` +
        `Dernière connexion: ${
          user.lastLoginAt ? this.formatDate(user.lastLoginAt) : 'Jamais'
        }`
    );
  }

  exportUsers(): void {
    try {
      // Create CSV content
      const headers = [
        'ID',
        'Nom',
        'Prénom',
        'Email',
        'Type',
        'Statut',
        'Créé le',
        'Dernière connexion',
      ];
      const csvContent = [
        headers.join(','),
        ...this.users.map((user) =>
          [
            user.id,
            `"${user.nom}"`,
            `"${user.prenom}"`,
            `"${user.email}"`,
            `"${this.getUserTypeDisplay(user.type)}"`,
            user.isActive ? 'Actif' : 'Inactif',
            `"${this.formatDate(user.createdAt)}"`,
            `"${
              user.lastLoginAt ? this.formatDate(user.lastLoginAt) : 'Jamais'
            }"`,
          ].join(',')
        ),
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `utilisateurs_${new Date().toISOString().split('T')[0]}.csv`
      );
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      this.showSuccess('Export des utilisateurs réussi');
    } catch (error) {
      this.showError("Erreur lors de l'export: " + error);
    }
  }
}
