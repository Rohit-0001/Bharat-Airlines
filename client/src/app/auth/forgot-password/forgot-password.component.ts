import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../../services/http.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  form!: FormGroup;
  loading = false;
  success = false;
  showError = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private router: Router  // ✅ ADD
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading = true;

    this.httpService.forgotPassword(this.form.get('email')?.value).subscribe({
      next: () => {
        this.loading = false;

        // ✅ REDIRECT instead of staying here
        this.router.navigate(['/reset-password'], {
          queryParams: { email: this.form.get('email')?.value }
        });
      },
      error: (err) => {
        this.loading = false;
        this.showError = true;
        this.errorMessage = err?.error?.message || 'Something went wrong.';
      }
    });
  }


  // constructor(private fb: FormBuilder, private httpService: HttpService) {
  //   this.form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });
  // }

  // onSubmit(): void {
  //   if (this.form.invalid) { this.form.markAllAsTouched(); return; }
  //   this.loading = true;
  //   this.httpService.forgotPassword(this.form.get('email')?.value).subscribe({
  //     next: () => { this.loading = false; this.success = true; },
  //     error: (err) => { this.loading = false; this.showError = true;
  //       this.errorMessage = err?.error?.message || 'Something went wrong.'; }
  //   });
  // }
}
