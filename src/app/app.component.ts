import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { TokenValidationService } from './services/token-validation.service';
import { ToastContainerComponent } from './components/toast-container/toast-container.component';
import { ConfirmationContainerComponent } from './components/confirmation-container/confirmation-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ToastContainerComponent,
    ConfirmationContainerComponent,
  ],
  template: `
    <router-outlet></router-outlet>
    <app-toast-container></app-toast-container>
    <app-confirmation-container></app-confirmation-container>
  `,
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'smartpromo-app';

  constructor(
    private authService: AuthService,
    private tokenValidationService: TokenValidationService
  ) {}

  ngOnInit() {
    // Start token validation if user is authenticated
    if (this.authService.isAuthenticated) {
      this.tokenValidationService.startTokenValidation();
    }

    // Subscribe to authentication changes
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        // User logged in, start token validation
        this.tokenValidationService.startTokenValidation();
      } else {
        // User logged out, stop token validation
        this.tokenValidationService.stopTokenValidation();
      }
    });
  }

  ngOnDestroy() {
    // Clean up token validation on app destruction
    this.tokenValidationService.stopTokenValidation();
  }
}
