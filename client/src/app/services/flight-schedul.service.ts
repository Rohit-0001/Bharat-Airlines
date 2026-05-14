import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class FlightScheduleService {
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

  getAllSchedules(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/pilot/schedule`, this.getHeaders());
  }

  getPilots(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/pilot/schedule/users`, this.getHeaders());
  }

  getMySchedule(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/pilot/schedule/scheduleUser`, this.getHeaders());
  }

  assignPilot(flightId: number, pilotId: number, scheduledDate: string, assignStatus: string): Observable<any> {
    const params = new HttpParams()
      .set('flightId', flightId.toString())
      .set('pilotId', pilotId.toString())
      .set('scheduledDate', scheduledDate)
      .set('assignStatus', assignStatus);
    return this.http.post<any>(`${this.baseUrl}/api/pilot/schedule/admin/assign-pilot`, null, { ...this.getHeaders(), params });
  }

  updateScheduleStatus(id: number, status: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/api/pilot/schedule/${id}/status`, { status }, this.getHeaders());
  }
}