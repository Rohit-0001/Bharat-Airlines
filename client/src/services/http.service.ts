import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class HttpService {
  public serverName = environment.apiUrl;
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private get headers() {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const token = this.authService.getToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  login(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/auth/login`, payload);
  }

  registerUser(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/auth/register`, payload);
  }

  getCurrentUser(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/auth/user`, { headers: this.headers });
  }

  getAllFlights(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/flights`, { headers: this.headers });
  }

  createFlight(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/flights`, payload, { headers: this.headers });
  }

  updateFlight(id: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/api/flights/${id}`, payload, { headers: this.headers });
  }

  updateFlightStatus(id: number, status: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/api/pilot/schedule/${id}/status`, { status }, { headers: this.headers });
  }

  searchFlights(source: string, destination: string, date: string): Observable<any> {
    const params = new HttpParams().set('source', source).set('destination', destination).set('date', date);
    return this.http.get<any>(`${this.baseUrl}/api/flights/search`, { headers: this.headers, params });
  }

  suggestSource(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/flights/source/suggest`, { headers: this.headers });
  }

  suggestDestination(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/flights/destination/suggest`, { headers: this.headers });
  }

  checkAvailability(flightId: number, travelerCount: number): Observable<any> {
    const params = new HttpParams().set('travelerCount', travelerCount.toString());
    return this.http.get<any>(`${this.baseUrl}/api/flights/${flightId}/check-availability`, { headers: this.headers, params });
  }

  getSeats(flightId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/seats/flights/${flightId}/seats`, { headers: this.headers });
  }

  bookSeats(flightId: number, seatNumbers: string[], userId: number | string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/booking/book-seats`, { flightId, seatNumbers, userId }, { headers: this.headers });
  }

  getMyBookings(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/booking/bookings`, { headers: this.headers });
  }

  getAllBookings(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/booking/bookingList`, { headers: this.headers });
  }

  updateBookingStatus(id: number, status: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/api/booking/${id}/status`, { status }, { headers: this.headers });
  }

  downloadTicket(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/api/booking/ticket/${id}`, { headers: this.headers, responseType: 'blob' as 'blob' });
  }

  assignPilot(flightId: number, pilotId: number, scheduledDate: string, assignStatus: string): Observable<any> {
    const params = new HttpParams()
      .set('flightId', flightId.toString())
      .set('pilotId', pilotId.toString())
      .set('scheduledDate', scheduledDate)
      .set('assignStatus', assignStatus);
    return this.http.post<any>(`${this.baseUrl}/api/pilot/schedule/admin/assign-pilot`, null, { headers: this.headers, params });
  }

  getPilots(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/pilot/schedule/users`, { headers: this.headers });
  }

  getAssignPilotDetails(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/pilot/schedule/scheduleUser`, { headers: this.headers });
  }

  getAllSchedules(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/pilot/schedule`, { headers: this.headers });
  }

  updateScheduleStatus(id: number, status: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/api/pilot/schedule/${id}/status`, { status }, { headers: this.headers });
  }
}
