import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '../../../services/http.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  showError = false;
  errorMessage = '';
  loading = false;
  showPassword = false;

  // Captcha state
  captchaRequired = false;
  captchaSolved = false;
  captchaToken = '';
  failCount = 0;
  locked = false;

  // Idle session message
  idleLogout = false;

  // Math captcha (simple built-in captcha)
  captchaQuestion = '';
  captchaAnswer = '';
  captchaUserAnswer = '';
  captchaError = false;

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    // Check if redirected due to idle
    this.route.queryParams.subscribe(p => {
      if (p['reason'] === 'idle') this.idleLogout = true;
    });

    // Already logged in → go to dashboard
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }

    // Generate first captcha
    this.generateCaptcha();
  }

  generateCaptcha(): void {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    this.captchaQuestion = `What is ${a} + ${b}?`;
    this.captchaAnswer = (a + b).toString();
    this.captchaUserAnswer = '';
    this.captchaSolved = false;
    this.captchaError = false;
  }

  checkCaptcha(): void {
    if (String(this.captchaUserAnswer).trim() === this.captchaAnswer) {
      this.captchaSolved = true;
      this.captchaError = false;
      this.captchaToken = 'math-captcha-solved';
    } else {
      this.captchaError = true;
      this.captchaSolved = false;
    }
  }

  onUsernameBlur(): void {
    const username = this.loginForm.get('username')?.value;
    if (!username) return;
    this.httpService.getCaptchaStatus(username).subscribe({
      next: (res: any) => {
        this.captchaRequired = res.captchaRequired;
        this.locked = res.locked;
        this.failCount = res.failCount;
        if (this.captchaRequired) this.generateCaptcha();
      },
      error: () => { }
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    if (this.captchaRequired && !this.captchaSolved) {
      this.showError = true;
      this.errorMessage = 'Please solve the CAPTCHA before logging in.';
      return;
    }

    this.loading = true;
    this.showError = false;

    const payload = {
      ...this.loginForm.value,
      captchaToken: this.captchaRequired ? this.captchaToken : ''
    };

    this.httpService.login(payload).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.authService.saveAuth(
          res.token,
          res.role,
          res.userId?.toString(),
          res.username || ''
        );
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        const body = err?.error || {};
        this.showError = true;
        this.locked = body.locked || false;
        this.failCount = body.failCount || 0;

        if (body.locked) {
          this.errorMessage = 'Account temporarily locked due to too many failed attempts. Try again in 15 minutes.';
        } else if (body.emailNotVerified) {
          this.errorMessage = 'Please verify your email before logging in.';
        } else {
          this.errorMessage = body.message || 'Invalid credentials.';
        }

        if (body.captchaRequired && !this.captchaRequired) {
          this.captchaRequired = true;
          this.generateCaptcha();
        }

        if (this.captchaRequired && !this.captchaSolved) {
          this.generateCaptcha();
        }
      }
    });
  }
}