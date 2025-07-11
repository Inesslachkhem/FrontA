import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { SignInDto } from '../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  signInDto: SignInDto = {
    email: '',
    password: '',
  };

  isLoading = false;
  errorMessage = '';
  showPassword = false;

  // Toast properties
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Redirect if already authenticated
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (!this.signInDto.email || !this.signInDto.password) {
      this.showToastMessage('Veuillez remplir tous les champs', 'error');
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    console.log('Attempting login with:', {
      email: this.signInDto.email,
      password: '***',
    });

    this.authService
      .login(this.signInDto.email, this.signInDto.password)
      .subscribe({
        next: (response) => {
          console.log('Verification code sent:', response);
          this.showToastMessage(
            'Code de vérification envoyé avec succès! 🚀',
            'success'
          );

          // Delay navigation to show the success toast
          setTimeout(() => {
            this.router.navigate(['/verify'], {
              queryParams: { email: this.signInDto.email },
            });
          }, 2000);
        },
        error: (error) => {
          console.error('Login error:', error);
          let errorMsg = '';

          if (error.status === 0) {
            errorMsg = 'Impossible de se connecter au serveur 🔌';
          } else if (error.status === 401) {
            errorMsg = 'Email ou mot de passe incorrect 🔐';
          } else if (error.status === 500) {
            errorMsg = 'Erreur serveur interne ⚠️';
          } else {
            errorMsg = error.message || 'Erreur de connexion 📡';
          }

          this.showToastMessage(errorMsg, 'error');
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  showToastMessage(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    // Auto-hide toast after 4 seconds
    setTimeout(() => {
      this.hideToast();
    }, 4000);
  }

  hideToast(): void {
    this.showToast = false;
    setTimeout(() => {
      this.toastMessage = '';
    }, 300); // Wait for animation to complete
  }

  onSeedAdmin(): void {
    this.userService.seedAdmin().subscribe({
      next: (response) => {
        console.log('Admin seeded:', response);
        this.showToastMessage(
          'Compte admin créé avec succès! 🎉\nEmail: admin@smartpromo.com',
          'success'
        );
      },
      error: (error) => {
        console.error('Error seeding admin:', error);
        this.showToastMessage(
          'Erreur lors de la création du compte admin ❌',
          'error'
        );
      },
    });
  }
}
