
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class HttpService {
  public serverName = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  login(credentials: { username: string; password: string; captchaToken?: string }): Observable<any> {
    return this.http.post(`${this.serverName}/api/auth/login`, credentials);
  }

  registerUser(user: any): Observable<any> {
    return this.http.post(`${this.serverName}/api/auth/register`, user);
  }

  verifyOtp(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.serverName}/api/auth/verify-otp`, { email, otp });
  }

  resendOtp(email: string): Observable<any> {
    return this.http.post(`${this.serverName}/api/auth/resend-otp`, { email });
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.serverName}/api/auth/forgot-password`, { email });
  }

  // verifyResetOtp(data: any) {
  //   return this.http.post(`${this.serverName}/api/auth/verify-reset-otp`, data);
  // }
  verifyResetOtp(data: any) {
  return this.http.post(`${this.serverName}/api/auth/verify-reset-otp`, data);
}


  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.serverName}/api/auth/reset-password`, { token, newPassword });
  }

  getCaptchaStatus(username: string): Observable<any> {
    return this.http.get(`${this.serverName}/api/auth/captcha-status`, {
      params: new HttpParams().set('username', username)
    });
  }

  // BUG FIX: This method was completely missing — added to fetch full profile from backend
  getMyProfile(): Observable<any> {
    return this.http.get(`${this.serverName}/api/auth/user`,
      { headers: this.getHeaders() });
  }

  getAllFlights(): Observable<any[]> {
    return this.http.get<any[]>(`${this.serverName}/api/flights`,
      { headers: this.getHeaders() });
  }

  createFlight(flight: any): Observable<any> {
    return this.http.post(`${this.serverName}/api/flights`, flight,
      { headers: this.getHeaders() });
  }

  updateFlight(id: number, flight: any): Observable<any> {
    return this.http.put(`${this.serverName}/api/flights/${id}`, flight,
      { headers: this.getHeaders() });
  }

  searchFlights(source: string, destination: string, date: string): Observable<any[]> {
    const params = new HttpParams()
      .set('source', source)
      .set('destination', destination)
      .set('date', date);
    return this.http.get<any[]>(`${this.serverName}/api/flights/search`,
      { headers: this.getHeaders(), params });
  }

  suggestSource(): Observable<string[]> {
    return this.http.get<string[]>(`${this.serverName}/api/flights/source/suggest`,
      { headers: this.getHeaders() });
  }

  suggestDestination(): Observable<string[]> {
    return this.http.get<string[]>(`${this.serverName}/api/flights/destination/suggest`,
      { headers: this.getHeaders() });
  }

  checkAvailability(flightId: number, travelerCount: number): Observable<any> {
    const params = new HttpParams().set('travelerCount', travelerCount.toString());
    return this.http.get(`${this.serverName}/api/flights/${flightId}/check-availability`,
      { headers: this.getHeaders(), params });
  }

  bookSeats(flightId: number, seatNumbers: string[]): Observable<any> {
    return this.http.post(`${this.serverName}/api/booking/book-seats`,
      { flightId, seatNumbers },
      { headers: this.getHeaders() });
  }

  getMyBookings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.serverName}/api/booking/bookings`,
      { headers: this.getHeaders() });
  }

  getAllBookings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.serverName}/api/booking/bookingList`,
      { headers: this.getHeaders() });
  }

  updateBookingStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.serverName}/api/booking/${id}/status`,
      { status },
      { headers: this.getHeaders() });
  }

  cancelBooking(id: number): Observable<any> {
    return this.http.delete(`${this.serverName}/api/booking/bookings/${id}`,
      { headers: this.getHeaders() });
  }

  downloadTicket(id: number): Observable<Blob> {
    return this.http.get(`${this.serverName}/api/booking/ticket/${id}`,
      { headers: this.getHeaders(), responseType: 'blob' });
  }

  getPilots(): Observable<any[]> {
    return this.http.get<any[]>(`${this.serverName}/api/pilot/schedule/users`,
      { headers: this.getHeaders() });
  }

  getAllSchedules(): Observable<any[]> {
    return this.http.get<any[]>(`${this.serverName}/api/pilot/schedule`,
      { headers: this.getHeaders() });
  }

  getMySchedule(): Observable<any[]> {
    return this.http.get<any[]>(`${this.serverName}/api/pilot/schedule/scheduleUser`,
      { headers: this.getHeaders() });
  }

  assignPilot(flightId: number, pilotId: number, scheduledDate: string, assignStatus: string): Observable<any> {
    const params = new HttpParams()
      .set('flightId', flightId.toString())
      .set('pilotId', pilotId.toString())
      .set('scheduledDate', scheduledDate)
      .set('assignStatus', assignStatus);
    return this.http.post(`${this.serverName}/api/pilot/schedule/admin/assign-pilot`, null,
      { headers: this.getHeaders(), params });
  }

  updateScheduleStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.serverName}/api/pilot/schedule/${id}/status`,
      { status },
      { headers: this.getHeaders() });
  }

  getSeats(flightId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.serverName}/api/seats/flights/${flightId}/seats`,
      { headers: this.getHeaders() });
  }
}