import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Airline Booking System';

  constructor(public authService: AuthService, private router: Router) {}

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get role(): string | null {
    return this.authService.getRole;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    window.location.reload();
  }
}
