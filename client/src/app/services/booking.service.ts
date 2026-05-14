import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Bookings } from '../model/bookings';

@Injectable({ providedIn: 'root' })
export class BookingsService {
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

  bookFlight(flightId: number, seatNumbers: string): Observable<Bookings> {
    const params = new HttpParams().set('flightId', flightId.toString()).set('seatNumbers', seatNumbers);
    return this.http.post<Bookings>(`${this.baseUrl}/api/booking/book`, null, { ...this.getHeaders(), params });
  }

  getBookings(): Observable<Bookings[]> {
    return this.http.get<Bookings[]>(`${this.baseUrl}/api/booking`, this.getHeaders());
  }

  getMyBookings(): Observable<Bookings[]> {
    return this.http.get<Bookings[]>(`${this.baseUrl}/api/booking/bookings`, this.getHeaders());
  }

  getMyBookingsListUser(): Observable<Bookings[]> {
    return this.http.get<Bookings[]>(`${this.baseUrl}/api/booking/bookingList`, this.getHeaders());
  }

  checkSeatAvailability(flightId: number, seatNumbers: string[]): Observable<boolean> {
    return this.http.post<boolean>(`${this.baseUrl}/api/booking/check-seat-availability`, seatNumbers, {
      ...this.getHeaders(),
      params: new HttpParams().set('flightId', flightId.toString())
    });
  }

  validateSeatAvailability(flightId: number, travelerCount: number): Observable<boolean> {
    const params = new HttpParams().set('flightId', flightId.toString()).set('travelerCount', travelerCount.toString());
    return this.http.get<boolean>(`${this.baseUrl}/api/booking/validate-seats`, { ...this.getHeaders(), params });
  }

  downloadTicket(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/api/booking/ticket/${id}`, { ...this.getHeaders(), responseType: 'blob' as 'blob' });
  }

  updateBookingStatus(id: number, status: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/api/booking/${id}/status`, { status }, this.getHeaders());
  }

  bookSeats(flightId: number, seatNumbers: string[], userId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/booking/book-seats`, { flightId, seatNumbers, userId }, this.getHeaders());
  }
}