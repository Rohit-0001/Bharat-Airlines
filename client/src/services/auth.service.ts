import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {

  // Save token, role, and userId to localStorage after login
  saveAuth(token: string, role: string, userId: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('userId', userId);
  }

  getToken(): string {
    return localStorage.getItem('token') || '';
  }

  // getRole decodes the role from the JWT payload so it cannot be faked via localStorage
  get getRole(): string {
    const token = this.getToken();
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || '';
    } catch {
      return '';
    }
  }

  getUserId(): string {
    return localStorage.getItem('userId') || '';
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
  }
}