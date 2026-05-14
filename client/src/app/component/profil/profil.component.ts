import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss']
})
export class ProfilComponent implements OnInit {
  userProfile: any = {};

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.userProfile = {
      username: this.authService.getUsername,
      email: this.authService.getEmail,
      role: this.authService.getRole,
      userId: this.authService.getUserId
    };
  }
}