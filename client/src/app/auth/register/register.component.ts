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
  registerForm!: FormGroup;
  showMessage = false;
  showError = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private httpService: HttpService
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      contactNumber: [''],
      role: ['', Validators.required]
    });
  }

  onSubmit(): void {
    this.showMessage = false;
    this.showError = false;

    if (this.registerForm.invalid) {
      this.showError = true;
      this.errorMessage = 'Please complete all required fields.';
      return;
    }

    this.httpService.registerUser(this.registerForm.value).subscribe({
      next: () => {
        this.showMessage = true;
        this.registerForm.reset();
      },
      error: (error) => {
        this.showError = true;
        this.errorMessage = error?.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}