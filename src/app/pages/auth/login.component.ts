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
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    console.log('Attempting login with:', {
      email: this.signInDto.email,
      password: '***',
    });    this.authService.login(this.signInDto.email, this.signInDto.password).subscribe({
      next: (response) => {
        console.log('Verification code sent:', response);
        // Navigate to verification page with email
        this.router.navigate(['/verify'], { 
          queryParams: { email: this.signInDto.email }
        });
      },
      error: (error) => {
        console.error('Login error:', error);
        if (error.status === 0) {
          this.errorMessage =
            'Impossible de se connecter au serveur. Vérifiez que le backend est démarré.';
        } else if (error.status === 401) {
          this.errorMessage = 'Email ou mot de passe incorrect';
        } else if (error.status === 500) {
          this.errorMessage = 'Erreur serveur interne';
        } else {
          this.errorMessage = error.message || 'Erreur de connexion';
        }
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

  onSeedAdmin(): void {
    this.userService.seedAdmin().subscribe({
      next: (response) => {
        console.log('Admin seeded:', response);
        alert(
          'Compte admin créé avec succès!\nEmail: admin@smartpromo.com\nMot de passe: Admin123!'
        );
      },
      error: (error) => {
        console.error('Error seeding admin:', error);
      },
    });
  }
}
