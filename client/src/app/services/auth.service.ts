import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { LoginRequest } from '../model/loginrequest';
import { LoginResponse } from '../model/login-response';
import { User } from '../model/user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/api/auth/login`, request);
  }

  registerUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/api/auth/register`, user);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  get getRole(): string | null {
    return localStorage.getItem('role');
  }

  get getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  get getUsername(): string | null {
    return localStorage.getItem('username');
  }

  get getEmail(): string | null {
    return localStorage.getItem('email');
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  setRole(role: string): void {
    localStorage.setItem('role', role);
  }

  setUserId(userId: string): void {
    localStorage.setItem('userId', userId);
  }

  setUsername(username: string): void {
    localStorage.setItem('username', username);
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