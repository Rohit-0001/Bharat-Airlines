import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '../../../services/http.service';

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

  email = '';
  otp = '';

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
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatch });
  }

  passwordMatch(g: FormGroup) {
    const p = g.get('password')?.value;
    const c = g.get('confirmPassword')?.value;
    return p === c ? null : { mismatch: true };
  }


  onSubmit(): void {

  if (!this.otp) {
    this.showError = true;
    this.errorMessage = 'Please enter OTP';
    return;
  }

  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  this.loading = true;
  this.showError = false;

  // ✅ DEBUG LOG
  console.log("OTP being sent:", this.otp);

  this.httpService.verifyResetOtp({
    email: this.email,
    otp: this.otp.trim(),   // ✅ important
    newPassword: this.form.value.password
  }).subscribe({

    next: (res: any) => {
      console.log("SUCCESS RESPONSE:", res);

      this.loading = false;
      this.success = true;

      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 3000);
    },

    error: (err: any) => {
      console.log("FULL ERROR:", err);

      this.loading = false;
      this.showError = true;

      this.errorMessage =
        err?.error?.message ||
        err?.message ||
        "Invalid or expired OTP";
    }

  });
}

  // onSubmit(): void {

  //   if (!this.otp) {
  //     this.showError = true;
  //     this.errorMessage = 'Please enter OTP';
  //     return;
  //   }

  //   if (this.form.invalid) {
  //     this.form.markAllAsTouched();
  //     return;
  //   }

  //   this.loading = true;
  //   this.showError = false;

  //   this.httpService.verifyResetOtp({
  //     email: this.email,
  //     otp: this.otp,
  //     newPassword: this.form.value.password
  //   }).subscribe({

  //     next: () => {
  //       this.loading = false;
  //       this.success = true;

  //       setTimeout(() => {
  //         this.router.navigate(['/login']);
  //       }, 3000);
  //     },

  //     error: (err) => {
  //       this.loading = false;
  //       this.showError = true;

  //       console.log("FULL ERROR:", err);

  //       if (!err.error) {
  //         this.errorMessage = "Server error (proxy issue)";
  //       } else if (err.error.message) {
  //         this.errorMessage = err.error.message;
  //       } else {
  //         this.errorMessage = "Invalid or expired OTP";
  //       }
  //     }
  //   });
  // }
}