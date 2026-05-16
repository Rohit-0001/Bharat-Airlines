import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.httpService.login(this.loginForm.value).subscribe({
      next: (res: any) => {
        // BUG FIX: Original call was saveAuth(res.token, res.role, res.userId)
        // — it never passed res.username, so username was never stored
        this.authService.saveAuth(
          res.token,
          res.role,
          res.userId?.toString(),
          res.username || ''
        );
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.showError = true;
        this.errorMessage = err?.error?.message || 'Invalid credentials.';
      }
    });
  }
}