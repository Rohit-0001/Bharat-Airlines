import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../../services/http.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  step: 'form' | 'otp' | 'success' = 'form';
  registerForm!: FormGroup;
  otpForm!: FormGroup;

  loading = false;
  showError = false;
  errorMessage = '';
  registeredEmail = '';
  otpTimer = 0;
  otpTimerInterval: any;
  showPassword = false;
  resendLoading = false;

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      contactNumber: [''],
      role: ['PASSENGER', Validators.required]
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.showError = false;

    const formData = { ...this.registerForm.value };
    if (!formData.contactNumber || formData.contactNumber === '') {
      delete formData.contactNumber;
    } else {
      formData.contactNumber = Number(formData.contactNumber);
    }

    this.httpService.registerUser(formData).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.registeredEmail = res.email || formData.email;
        this.step = 'otp';
        this.startOtpTimer();
      },
      error: (err) => {
        this.loading = false;
        this.showError = true;
        this.errorMessage = err?.error?.message || 'Registration failed. Please try again.';
      }
    });
  }

  onVerifyOtp(): void {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.showError = false;

    this.httpService.verifyOtp(this.registeredEmail, this.otpForm.get('otp')?.value).subscribe({
      next: () => {
        this.loading = false;
        clearInterval(this.otpTimerInterval);
        this.step = 'success';
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        this.loading = false;
        this.showError = true;
        this.errorMessage = err?.error?.message || 'Invalid OTP. Please try again.';
      }
    });
  }

  resendOtp(): void {
    this.resendLoading = true;
    this.showError = false;
    this.httpService.resendOtp(this.registeredEmail).subscribe({
      next: () => {
        this.resendLoading = false;
        this.startOtpTimer();
      },
      error: (err) => {
        this.resendLoading = false;
        this.showError = true;
        this.errorMessage = err?.error?.message || 'Failed to resend OTP.';
      }
    });
  }

  startOtpTimer(): void {
    clearInterval(this.otpTimerInterval);
    this.otpTimer = 60;
    this.otpTimerInterval = setInterval(() => {
      this.otpTimer--;
      if (this.otpTimer <= 0) clearInterval(this.otpTimerInterval);
    }, 1000);
  }

  get canResend(): boolean { return this.otpTimer <= 0; }
}
