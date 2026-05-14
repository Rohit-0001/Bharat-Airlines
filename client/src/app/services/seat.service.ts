import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Seat } from '../model/seat';

@Injectable({ providedIn: 'root' })
export class SeatService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders() {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const token = this.authService.getToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return { headers };
  }

  getSeats(flightId: number): Observable<Seat[]> {
    return this.http.get<Seat[]>(`${this.baseUrl}/api/seats/flights/${flightId}/seats`, this.getHeaders());
  }

  bookSeats(flightId: number, seatNumbers: string[], userId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/booking/book-seats`, { flightId, seatNumbers, userId }, this.getHeaders());
  }
}