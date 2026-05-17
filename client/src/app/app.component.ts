import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(public authService: AuthService, private router: Router) {}

  get role(): string {
    return this.authService.getRole;
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  // BUG FIX: Added so navbar can show logged-in user's name
  get username(): string {
    return this.authService.getUsername();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}