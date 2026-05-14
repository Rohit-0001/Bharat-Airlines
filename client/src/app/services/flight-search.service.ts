import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Flights } from '../model/flights';

@Injectable({ providedIn: 'root' })
export class FlightSearchService {
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

  searchFlights(source: string, destination: string, date: string): Observable<Flights[]> {
    const params = new HttpParams().set('source', source).set('destination', destination).set('date', date);
    return this.http.get<Flights[]>(`${this.baseUrl}/api/flights/search`, { ...this.getHeaders(), params });
  }

  suggestSource(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/flights/source/suggest`, this.getHeaders());
  }

  suggestDestination(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/flights/destination/suggest`, this.getHeaders());
  }

  suggestCitiesForSource(): Observable<any> {
    return this.suggestSource();
  }
}