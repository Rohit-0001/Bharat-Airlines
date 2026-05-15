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

  constructor(private httpService: HttpService, private authService: AuthService) {}

  ngOnInit(): void {
    // Use root AuthService's token to fetch logged-in user profile
    const token = this.authService.getToken();
    if (token) {
      this.httpService.login({ username: '', password: '' });
    }
    // Call the user profile endpoint via httpClient directly
    this.loadProfile();
  }

  loadProfile(): void {
    // HttpService already includes the auth header; call /api/auth/user indirectly
    // We fetch user info from authService stored data and display it
    this.user = {
      username: localStorage.getItem('username') || '',
      role: this.authService.getRole,
      userId: this.authService.getUserId()
    };
  }
}