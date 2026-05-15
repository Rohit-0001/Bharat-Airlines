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
  responseMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private httpService: HttpService, private router: Router) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      contactNumber: [''],
      role: ['PASSENGER', Validators.required]
    });
  }
  onSubmit(): void {
    if (this.registerForm.invalid) return;

    // ✅ FIX: create formData first
    const formData = { ...this.registerForm.value };

    // ✅ handle contactNumber properly
    if (!formData.contactNumber || formData.contactNumber === '') {
      delete formData.contactNumber;
    } else {
      formData.contactNumber = Number(formData.contactNumber);
    }

    this.httpService.registerUser(formData).subscribe({
      next: (res: any) => {
        this.showMessage = true;
        this.responseMessage = `Registered successfully as ${res.username}`;
        this.showError = false;
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.showError = true;
        this.errorMessage =
          err?.error?.message || 'Registration failed. Username may already exist.';
      }
    });
  }
}