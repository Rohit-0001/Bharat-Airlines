import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../../services/http.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss']
})
export class ProfilComponent implements OnInit {

  user: any = null;
  showError = false;
  errorMessage = '';

  constructor(private httpService: HttpService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    // BUG FIX: Removed stray this.httpService.login({ username:'', password:'' }) call
    // BUG FIX: Use getUsername() instead of direct localStorage.getItem('username')
    this.user = {
      username: this.authService.getUsername(),
      role: this.authService.getRole,
      userId: this.authService.getUserId(),
      email: '',
      contactNumber: ''
    };

    // Fetch full profile (email, contact) from backend
    this.httpService.getMyProfile().subscribe({
      next: (data: any) => {
        this.user = {
          username: data.username || this.authService.getUsername(),
          email: data.email || '',
          contactNumber: data.contactNumber || 'N/A',
          role: data.role || this.authService.getRole,
          userId: data.id || this.authService.getUserId()
        };
      },
      error: () => {
        this.showError = true;
        this.errorMessage = 'Could not load full profile from server. Showing cached info.';
      }
    });
  }
}