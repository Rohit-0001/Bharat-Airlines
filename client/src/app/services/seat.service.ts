import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Seat } from "../model/seat";
import { environment } from "../../environments/environment";
import { AuthService } from "./auth.service";

@Injectable({ providedIn: 'root' })
export class SeatService {
  private baseUrl = environment.apiUrl;
 
  //write required code here!
}
