import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { FlightComponent } from './component/flight/flight.component';
import { FlightSearchComponent } from './component/flight-search/flight-search.component';
import { BookingsComponent } from './component/bookings/bookings.component';
import { AssignPilotComponent } from './component/assign-pilot/assign-pilot.component';
import { ProfilComponent } from './component/profil/profil.component';
import { ViewuserComponent } from './component/viewuser/viewuser.component';

import { HttpService } from '../services/http.service';
import { AuthService } from '../services/auth.service';

@NgModule({
  declarations: [
    AppComponent, LoginComponent, RegisterComponent,
    DashboardComponent, FlightComponent, FlightSearchComponent,
    BookingsComponent, AssignPilotComponent, ProfilComponent, ViewuserComponent
  ],
  imports: [
    BrowserModule, AppRoutingModule, FormsModule,
    ReactiveFormsModule, HttpClientModule, CommonModule
  ],
  providers: [HttpService, AuthService],
  bootstrap: [AppComponent]
})
export class AppModule {}
