import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Flights } from '../model/flights';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FlightSearchService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  searchFlights(source: string, destination: string, date: string): Observable<Flights[]> {
    const params = new HttpParams()
      .set('source', source)
      .set('destination', destination)
      .set('date', date);
    return this.http.get<Flights[]>(`${this.baseUrl}/api/flights/search`,
      { headers: this.getHeaders(), params });
  }

  suggestCitiesForSource(): Observable<Flights[]> {
    return this.http.get<Flights[]>(`${this.baseUrl}/api/flights/source/suggest`,
      { headers: this.getHeaders() });
  }

  suggestCitiesForDestination(): Observable<Flights[]> {
    return this.http.get<Flights[]>(`${this.baseUrl}/api/flights/destination/suggest`,
      { headers: this.getHeaders() });
  }
}
