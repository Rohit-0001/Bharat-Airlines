// import { Component } from '@angular/core';
// import { AuthService } from '../services/auth.service';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-root',
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.scss']
// })
// export class AppComponent {

//   constructor(public authService: AuthService, private router: Router) {}

//   get role(): string {
//     return this.authService.getRole;
//   }

//   get isLoggedIn(): boolean {
//     return this.authService.isLoggedIn();
//   }

//   // BUG FIX: Added so navbar can show logged-in user's name
//   get username(): string {
//     return this.authService.getUsername();
//   }

//   logout(): void {
//     this.authService.logout();
//     this.router.navigate(['/login']);
//   }
// }
// ============================================================
// BHARAT AIRLINE — App Component
// File: src/app/app.component.ts
// Changes: Added isScrolled (navbar scroll), mobileOpen toggle
//          Preserved all existing auth logic untouched.
// ============================================================

import { Component, HostListener } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  isScrolled = false;
  mobileOpen  = false;

  constructor(public authService: AuthService, private router: Router) {}

  // ── Scroll detection for navbar background ────────────────
  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled = window.scrollY > 30;
  }

  // ── Mobile menu ───────────────────────────────────────────
  toggleMobile(): void { this.mobileOpen = !this.mobileOpen; }
  closeMobile(): void  { this.mobileOpen = false; }

  // ── Existing auth getters (unchanged) ─────────────────────
  get role(): string {
    return this.authService.getRole;
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get username(): string {
    return this.authService.getUsername();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}