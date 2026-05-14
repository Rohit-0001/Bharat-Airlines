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
  showMessage = false;
  showError = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private httpService: HttpService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    this.showMessage = false;
    this.showError = false;

    if (this.loginForm.invalid) {
      this.showError = true;
      this.errorMessage = 'Please complete all required fields.';
      return;
    }

    this.httpService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.authService.setToken(response.token);
        this.authService.setRole(response.role);
        this.authService.setUsername(response.username);
        this.authService.setEmail(response.email);
        if (response.userId !== undefined) {
          this.authService.setUserId(response.userId.toString());
        }
        this.showMessage = true;
        this.router.navigate(['/dashboard']).then(() => window.location.reload());
      },
      error: (error) => {
        this.showError = true;
        this.errorMessage = error?.error?.message || 'Login failed. Please try again.';
      }
    });
  }
}