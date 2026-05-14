import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Flights } from '../model/flights';

@Injectable({ providedIn: 'root' })
export class FlightService {
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

  getAllFlights(): Observable<Flights[]> {
    return this.http.get<Flights[]>(`${this.baseUrl}/api/flights`, this.getHeaders());
  }

  searchFlights(source: string, destination: string, date: string): Observable<Flights[]> {
    const params = new HttpParams().set('source', source).set('destination', destination).set('date', date);
    return this.http.get<Flights[]>(`${this.baseUrl}/api/flights/search`, { ...this.getHeaders(), params });
  }

  createFlight(payload: Flights): Observable<Flights> {
    return this.http.post<Flights>(`${this.baseUrl}/api/flights`, payload, this.getHeaders());
  }

  updateFlight(id: number, payload: Flights): Observable<Flights> {
    return this.http.put<Flights>(`${this.baseUrl}/api/flights/${id}`, payload, this.getHeaders());
  }

  assignPilot(flightId: number, pilotId: number, scheduledDate: string, assignStatus: string): Observable<any> {
    const params = new HttpParams()
      .set('flightId', flightId.toString())
      .set('pilotId', pilotId.toString())
      .set('scheduledDate', scheduledDate)
      .set('assignStatus', assignStatus);
    return this.http.post<any>(`${this.baseUrl}/api/pilot/schedule/admin/assign-pilot`, null, { ...this.getHeaders(), params });
  }

  getPilots(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/pilot/schedule/users`, this.getHeaders());
  }

  getAssignPilotDetails(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/pilot/schedule/scheduleUser`, this.getHeaders());
  }

  getAllAssignPilotDetails(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/pilot/schedule`, this.getHeaders());
  }

  updateFlightStatus(id: number, status: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/api/pilot/schedule/${id}/status`, { status }, this.getHeaders());
  }

  checkAvailability(flightId: number, travelerCount: number): Observable<any> {
    const params = new HttpParams().set('travelerCount', travelerCount.toString());
    return this.http.get<any>(`${this.baseUrl}/api/flights/${flightId}/check-availability`, { ...this.getHeaders(), params });
  }
}
