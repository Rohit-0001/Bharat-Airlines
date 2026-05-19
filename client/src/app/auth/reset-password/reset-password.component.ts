import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '../../../services/http.service';
import {
  getActivePasswordMessages,
  strongPasswordValidator
} from '../../validators/custom.validators';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  form!: FormGroup;
  loading = false;
  success = false;
  showError = false;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;
  otpTouched = false;
  passwordHintActive = false;

  email = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private httpService: HttpService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'];

      if (!this.email) {
        this.showError = true;
        this.errorMessage = 'Invalid access';
      }
    });

    this.form = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      password: ['', [Validators.required, strongPasswordValidator]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatch });
  }

  passwordMatch(g: FormGroup) {
    const p = g.get('password')?.value;
    const c = g.get('confirmPassword')?.value;
    return p === c ? null : { mismatch: true };
  }

  get passwordMessages(): string[] {
    const ctrl = this.form?.get('password');
    const showFeedback = this.passwordHintActive || !!ctrl?.touched || !!ctrl?.dirty;
    return getActivePasswordMessages(ctrl?.value, showFeedback);
  }

  get showPasswordHints(): boolean {
    return this.passwordMessages.length > 0;
  }

  onPasswordInteraction(): void {
    this.passwordHintActive = true;
  }

  onSubmit(): void {
    this.otpTouched = true;

    if (this.form.invalid) {
      this.passwordHintActive = true;
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.showError = false;

    const otp = this.form.get('otp')?.value?.trim();

    this.httpService.verifyResetOtp({
      email: this.email,
      otp,
      newPassword: this.form.value.password
    }).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err: any) => {
        this.loading = false;
        this.showError = true;
        this.errorMessage =
          err?.error?.message ||
          err?.message ||
          'Invalid or expired OTP';
      }
    });
  }
}