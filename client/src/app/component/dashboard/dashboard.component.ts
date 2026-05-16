import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

  constructor(public authService: AuthService) {}

  get role(): string {
    return this.authService.getRole;
  }

  // BUG FIX: Added so dashboard can greet user by name
  get username(): string {
    return this.authService.getUsername();
  }
}