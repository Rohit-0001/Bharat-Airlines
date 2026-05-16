import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Seat } from "../model/seat";
import { environment } from "../../environments/environment";
import { AuthService } from "./auth.service";

@Injectable({ providedIn: 'root' })
export class SeatService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  getSeats(flightId: number): Observable<Seat[]> {
    return this.http.get<Seat[]>(`${this.baseUrl}/api/seats/flights/${flightId}/seats`,
      { headers: this.getHeaders() });
  }
}
