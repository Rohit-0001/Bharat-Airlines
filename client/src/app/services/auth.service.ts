import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest } from '../model/loginrequest';
import { LoginResponse } from '../model/login-response';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getToken(): string {
    return localStorage.getItem('token') || '';
  }

  isLoggedIn(): boolean {
    return !!this.getToken();  // true if token exists
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/api/auth/login`, credentials);
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/auth/register`, user);
  }
}