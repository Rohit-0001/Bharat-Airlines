// import { Injectable } from '@angular/core';

// @Injectable({ providedIn: 'root' })
// export class AuthService {

//   // BUG FIX: Added username param — original saveAuth() never stored it
//   saveAuth(token: string, role: string, userId: string, username: string): void {
//     localStorage.setItem('token', token);
//     localStorage.setItem('role', role);
//     localStorage.setItem('userId', userId);
//     localStorage.setItem('username', username);
//   }

//   getToken(): string {
//     return localStorage.getItem('token') || '';
//   }

//   get getRole(): string {
//     const token = this.getToken();
//     if (!token) return '';
//     try {
//       const payload = JSON.parse(atob(token.split('.')[1]));
//       return payload.role || '';
//     } catch {
//       return '';
//     }
//   }

//   getUserId(): string {
//     return localStorage.getItem('userId') || '';
//   }

//   // BUG FIX: Added this method — it was missing entirely
//   getUsername(): string {
//     return localStorage.getItem('username') || '';
//   }

//   isLoggedIn(): boolean {
//     return !!localStorage.getItem('token');
//   }

//   logout(): void {
//     localStorage.removeItem('token');
//     localStorage.removeItem('role');
//     localStorage.removeItem('userId');
//     localStorage.removeItem('username');
//   }
// }

import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {

  // BUG FIX: Added username param — original saveAuth() never stored it
  saveAuth(token: string, role: string, userId: string, username: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('userId', userId);
    localStorage.setItem('username', username);
  }

  getToken(): string {
    return localStorage.getItem('token') || '';
  }

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

  // BUG FIX: Added this method — it was missing entirely
  getUsername(): string {
    return localStorage.getItem('username') || '';
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token') && !this.isTokenExpired();
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.exp) return false;
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
  }
}