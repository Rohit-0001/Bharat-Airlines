import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Flights } from '../model/flights';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { User } from '../model/user';
import { FlightSchedule } from '../model/flight-schedule';

@Injectable({ providedIn: 'root' })
export class FlightService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  getAllFlights(): Observable<Flights[]> {
    return this.http.get<Flights[]>(`${this.baseUrl}/api/flights`,
      { headers: this.getHeaders() });
  }

  searchFlights(source: string, destination: string, date: string): Observable<Flights[]> {
    const params = new HttpParams()
      .set('source', source)
      .set('destination', destination)
      .set('date', date);
    return this.http.get<Flights[]>(`${this.baseUrl}/api/flights/search`,
      { headers: this.getHeaders(), params });
  }

  createFlight(flight: Flights): Observable<Flights> {
    return this.http.post<Flights>(`${this.baseUrl}/api/flights`, flight,
      { headers: this.getHeaders() });
  }

  updateFlight(id: number, flight: Flights): Observable<Flights> {
    return this.http.put<Flights>(`${this.baseUrl}/api/flights/${id}`, flight,
      { headers: this.getHeaders() });
  }

  assignPilot(flightId: number, pilotId: number, scheduledDate: string, assignStatus: string): Observable<any> {
    const params = new HttpParams()
      .set('flightId', flightId.toString())
      .set('pilotId', pilotId.toString())
      .set('scheduledDate', scheduledDate)
      .set('assignStatus', assignStatus);
    return this.http.post(`${this.baseUrl}/api/pilot/schedule/admin/assign-pilot`, null,
      { headers: this.getHeaders(), params });
  }

  getPilots(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/api/pilot/schedule/users`,
      { headers: this.getHeaders() });
  }

  getAssignPilotDetails(): Observable<FlightSchedule[]> {
    return this.http.get<FlightSchedule[]>(`${this.baseUrl}/api/pilot/schedule/scheduleUser`,
      { headers: this.getHeaders() });
  }

  getAllAssignPilotDetails(): Observable<FlightSchedule[]> {
    return this.http.get<FlightSchedule[]>(`${this.baseUrl}/api/pilot/schedule`,
      { headers: this.getHeaders() });
  }

  updateFlightStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/api/pilot/schedule/${id}/status`,
      { status },
      { headers: this.getHeaders() });
  }

  checkAvailability(flightId: number, travelerCount: number): Observable<{ available: boolean }> {
    const params = new HttpParams().set('travelerCount', travelerCount.toString());
    return this.http.get<{ available: boolean }>(
      `${this.baseUrl}/api/flights/${flightId}/check-availability`,
      { headers: this.getHeaders(), params });
  }
}
