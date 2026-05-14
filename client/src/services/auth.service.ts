import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  get getRole(): string | null {
    return localStorage.getItem('role');
  }

  setRole(role: string): void {
    localStorage.setItem('role', role);
  }

  get getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  setUserId(userId: string): void {
    localStorage.setItem('userId', userId);
  }

  get getUsername(): string | null {
    return localStorage.getItem('username');
  }

  setUsername(username: string): void {
    localStorage.setItem('username', username);
  }

  get getEmail(): string | null {
    return localStorage.getItem('email');
  }

  setEmail(email: string): void {
    localStorage.setItem('email', email);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
  }
}