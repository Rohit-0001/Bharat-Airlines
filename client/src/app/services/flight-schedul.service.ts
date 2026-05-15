import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FlightSchedule } from '../model/flight-schedule';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FlightScheduleService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  getAllSchedules(): Observable<FlightSchedule[]> {
    return this.http.get<FlightSchedule[]>(`${this.baseUrl}/api/pilot/schedule`,
      { headers: this.getHeaders() });
  }

  getMySchedule(): Observable<FlightSchedule[]> {
    return this.http.get<FlightSchedule[]>(`${this.baseUrl}/api/pilot/schedule/scheduleUser`,
      { headers: this.getHeaders() });
  }

  updateScheduleStatus(id: number, status: string): Observable<FlightSchedule> {
    return this.http.put<FlightSchedule>(`${this.baseUrl}/api/pilot/schedule/${id}/status`,
      { status },
      { headers: this.getHeaders() });
  }
}