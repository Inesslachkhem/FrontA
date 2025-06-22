import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import {
  User,
  UpdateUserDto,
  getUserTypeDisplayName,
} from '../../models/user.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent implements OnInit {
  currentUser: User | null = null;
  isEditing = false;
  isLoading = false;
  isUpdating = false;

  updateUserDto: UpdateUserDto = {
    nom: '',
    prenom: '',
    email: '',
    password: '',
    type: 0,
    isActive: true,
  };

  confirmPassword = '';
  errorMessage = '';
  successMessage = '';
  constructor(
    private authService: AuthService,
    private userService: UserService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      if (user) {
        this.updateUserDto = {
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          password: '',
          type: user.type,
          isActive: user.isActive,
        };
      }
    });
  }

  startEditing(): void {
    this.isEditing = true;
    this.clearMessages();
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.confirmPassword = '';
    this.updateUserDto.password = '';
    if (this.currentUser) {
      this.updateUserDto = {
        nom: this.currentUser.nom,
        prenom: this.currentUser.prenom,
        email: this.currentUser.email,
        password: '',
        type: this.currentUser.type,
        isActive: this.currentUser.isActive,
      };
    }
    this.clearMessages();
  }

  updateProfile(): void {
    if (!this.currentUser || !this.validateForm()) {
      return;
    }

    this.isUpdating = true;
    this.userService
      .updateUser(this.currentUser.id, this.updateUserDto)
      .subscribe({
        next: () => {
          this.showSuccess('Profil mis à jour avec succès');
          this.isEditing = false;
          this.confirmPassword = '';
          this.updateUserDto.password = ''; // Update current user in auth service
          const updatedUser: User = {
            ...this.currentUser!,
            nom: this.updateUserDto.nom,
            prenom: this.updateUserDto.prenom,
            email: this.updateUserDto.email,
          };

          // Store updated user only in browser environment
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          }
          this.isUpdating = false;
        },
        error: (error) => {
          this.showError('Erreur lors de la mise à jour: ' + error.message);
          this.isUpdating = false;
        },
      });
  }

  validateForm(): boolean {
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

    if (this.updateUserDto.password) {
      if (this.updateUserDto.password.length < 6) {
        this.showError('Le mot de passe doit contenir au moins 6 caractères');
        return false;
      }

      if (this.updateUserDto.password !== this.confirmPassword) {
        this.showError('Les mots de passe ne correspondent pas');
        return false;
      }
    }

    return true;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  getUserTypeDisplay(): string {
    return this.currentUser
      ? getUserTypeDisplayName(this.currentUser.type)
      : '';
  }
  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  logout(): void {
    this.authService.logout();
  }
}
