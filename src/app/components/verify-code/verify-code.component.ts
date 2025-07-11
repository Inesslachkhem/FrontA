import {
  Component,
  OnInit,
  ViewChildren,
  QueryList,
  ElementRef,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verify-code',
  templateUrl: './verify-code.component.html',
  styleUrls: ['./verify-code.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class VerifyCodeComponent implements OnInit {
  @ViewChildren('digit1, digit2, digit3, digit4, digit5, digit6')
  digitInputs!: QueryList<ElementRef>;

  verifyForm!: FormGroup;
  loading = false;
  resendLoading = false;
  error = '';
  email!: string;
  code = ['', '', '', '', '', ''];

  // Toast properties
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' | 'info' = 'info';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.email = this.route.snapshot.queryParams['email'] || '';
    this.verifyForm = this.formBuilder.group({
      code: [
        '',
        [Validators.required, Validators.minLength(6), Validators.maxLength(6)],
      ],
    });
  }

  onDigitInput(event: any, position: number) {
    const value = event.target.value;
    const index = position - 1;

    // Only allow numbers
    if (!/^\d*$/.test(value)) {
      event.target.value = this.code[index];
      return;
    }

    this.code[index] = value;
    this.updateFormControl();

    // Auto-focus next input
    if (value && position < 6) {
      const nextInput = document.querySelector(
        `input:nth-of-type(${position + 1})`
      ) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  }

  onKeyDown(event: any, position: number) {
    const index = position - 1;

    // Handle backspace
    if (event.key === 'Backspace' && !this.code[index] && position > 1) {
      const prevInput = document.querySelector(
        `input:nth-of-type(${position - 1})`
      ) as HTMLInputElement;
      if (prevInput) {
        this.code[index - 1] = '';
        prevInput.value = '';
        prevInput.focus();
        this.updateFormControl();
      }
    }

    // Handle Enter key
    if (event.key === 'Enter' && this.isCodeComplete()) {
      this.onSubmit();
    }
  }

  onPaste(event: ClipboardEvent, position: number) {
    event.preventDefault();

    const pastedData = event.clipboardData?.getData('text') || '';
    const cleanedData = pastedData.replace(/\D/g, ''); // Remove non-digits

    if (cleanedData.length === 6) {
      // If exactly 6 digits, fill all inputs
      this.code = cleanedData.split('');
      this.updateAllInputs();
      this.updateFormControl();

      // Focus the last input
      const lastInput = document.querySelector(
        `input:nth-of-type(6)`
      ) as HTMLInputElement;
      if (lastInput) {
        lastInput.focus();
      }
    } else if (cleanedData.length > 0) {
      // Fill as many inputs as possible starting from current position
      const remainingSlots = 6 - (position - 1);
      const digitsToUse = cleanedData.slice(0, remainingSlots);

      for (let i = 0; i < digitsToUse.length; i++) {
        const index = position - 1 + i;
        if (index < 6) {
          this.code[index] = digitsToUse[i];
        }
      }

      this.updateAllInputs();
      this.updateFormControl();

      // Focus next empty input or last filled input
      const nextEmptyIndex = this.code.findIndex((digit) => digit === '');
      const focusPosition = nextEmptyIndex === -1 ? 6 : nextEmptyIndex + 1;
      const targetInput = document.querySelector(
        `input:nth-of-type(${focusPosition})`
      ) as HTMLInputElement;
      if (targetInput) {
        targetInput.focus();
      }
    }
  }

  updateAllInputs() {
    const inputs = document.querySelectorAll(
      'input[maxlength="1"]'
    ) as NodeListOf<HTMLInputElement>;
    inputs.forEach((input, index) => {
      input.value = this.code[index] || '';

      // Add visual feedback for filled inputs
      if (this.code[index]) {
        input.classList.add('success-pulse');
        setTimeout(() => {
          input.classList.remove('success-pulse');
        }, 1000);
      }
    });
  }

  updateFormControl() {
    const fullCode = this.code.join('');
    this.verifyForm.patchValue({ code: fullCode });
  }

  isCodeComplete(): boolean {
    return (
      this.code.every((digit) => digit !== '') &&
      this.code.join('').length === 6
    );
  }

  onSubmit() {
    if (this.verifyForm.invalid || !this.isCodeComplete()) {
      this.error = 'Veuillez entrer le code complet à 6 chiffres';
      return;
    }

    this.loading = true;
    this.error = '';
    const code = this.code.join('');

    this.authService.verifyCode(this.email, code).subscribe({
      next: (response) => {
        // Handle successful verification
        this.router.navigate(['/admin-dashboard']);
      },
      error: (error) => {
        this.error = error.error?.message || 'Code de vérification incorrect';
        this.loading = false;
        this.clearCode();
      },
    });
  }

  clearCode() {
    this.code = ['', '', '', '', '', ''];
    const inputs = document.querySelectorAll(
      'input[maxlength="1"]'
    ) as NodeListOf<HTMLInputElement>;
    inputs.forEach((input) => (input.value = ''));
    this.updateFormControl();
    // Focus first input
    if (inputs.length > 0) {
      inputs[0].focus();
    }
  }

  resendCode() {
    this.resendLoading = true;
    this.error = '';

    this.authService.resendCode(this.email).subscribe({
      next: (response) => {
        this.resendLoading = false;
        this.showToastMessage(
          'Code de vérification renvoyé avec succès',
          'success'
        );
      },
      error: (error) => {
        this.resendLoading = false;
        const errorMessage =
          error.error?.message || 'Erreur lors du renvoi du code';
        this.showToastMessage(errorMessage, 'error');
      },
    });
  }

  showToastMessage(message: string, type: 'success' | 'error' | 'info') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    // Auto-hide toast after 4 seconds
    setTimeout(() => {
      this.hideToast();
    }, 4000);
  }

  hideToast() {
    this.showToast = false;
  }

  goBack() {
    this.router.navigate(['/login']);
  }
}
