import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Flights } from '../model/flights';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { User } from '../model/user';
import { FlightSchedule } from '../model/flight-schedule';

@Injectable({
  providedIn: 'root'
})
export class FlightService {
  
  private baseUrl = environment.apiUrl; 

  
  //write required code here!



}
