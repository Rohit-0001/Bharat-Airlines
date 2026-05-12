import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FlightSchedule, ScheduleStatus } from '../model/flight-schedule';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FlightScheduleService {
  private baseUrl = environment.apiUrl;

  //write required code here!
}
