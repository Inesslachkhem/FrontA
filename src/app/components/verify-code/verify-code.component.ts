import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verify-code',
  templateUrl: './verify-code.component.html',
  styleUrls: ['./verify-code.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class VerifyCodeComponent implements OnInit {
  verifyForm!: FormGroup;
  loading = false;
  error = '';
  email!: string;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.email = this.route.snapshot.queryParams['email'] || '';
    this.verifyForm = this.formBuilder.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  onSubmit() {
    if (this.verifyForm.invalid) {
      return;
    }

    this.loading = true;
    const code = this.verifyForm.get('code')?.value ?? '';
    
    this.authService.verifyCode(this.email, code).subscribe({
      next: (response) => {
        // Handle successful verification
        this.router.navigate(['/admin-dashboard']);
      },
      error: (error) => {
        this.error = error.error?.message || 'Verification failed';
        this.loading = false;
      }
    });
  }
}
