import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Role, User } from '../model/user';
import { Observable } from 'rxjs';
import { LoginRequest } from '../model/loginrequest';
import { LoginResponse } from '../model/login-response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
 
 
  private baseUrl = environment.apiUrl;

  //write required code here!


}
