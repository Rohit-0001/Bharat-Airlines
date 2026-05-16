import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Bookings } from '../model/bookings';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BookingsService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  bookFlight(flightId: number, seatNumbers: string): Observable<Bookings> {
    const params = new HttpParams()
      .set('flightId', flightId.toString())
      .set('seatNumbers', seatNumbers);
    return this.http.post<Bookings>(`${this.baseUrl}/api/booking/book`, null,
      { headers: this.getHeaders(), params });
  }

  getBookings(): Observable<Bookings[]> {
    return this.http.get<Bookings[]>(`${this.baseUrl}/api/booking`,
      { headers: this.getHeaders() });
  }

  getMyBookings(): Observable<Bookings[]> {
    return this.http.get<Bookings[]>(`${this.baseUrl}/api/booking/bookings`,
      { headers: this.getHeaders() });
  }

  getMyBookingsListUser(): Observable<Bookings[]> {
    return this.http.get<Bookings[]>(`${this.baseUrl}/api/booking/bookingList`,
      { headers: this.getHeaders() });
  }

  checkSeatAvailability(flightId: number, seatNumbers: string[]): Observable<boolean> {
    return this.http.post<boolean>(
      `${this.baseUrl}/api/booking/check-seat-availability?flightId=${flightId}`,
      seatNumbers,
      { headers: this.getHeaders() });
  }

  validateSeatAvailability(flightId: number, travelerCount: number): Observable<boolean> {
    const params = new HttpParams()
      .set('flightId', flightId.toString())
      .set('travelerCount', travelerCount.toString());
    return this.http.get<boolean>(`${this.baseUrl}/api/booking/validate-seats`,
      { headers: this.getHeaders(), params });
  }

  downloadTicket(bookingId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/api/booking/ticket/${bookingId}`,
      { headers: this.getHeaders(), responseType: 'blob' });
  }

  updateBookingStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/api/booking/${id}/status`,
      { status },
      { headers: this.getHeaders() });
  }

  bookSeats(flightId: number, seatNumbers: string[], userId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/booking/book-seats`,
      { flightId, seatNumbers, userId },
      { headers: this.getHeaders() });
  }
}
