import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { FlightComponent } from './component/flight/flight.component';
import { FlightSearchComponent } from './component/flight-search/flight-search.component';
import { BookingsComponent } from './component/bookings/bookings.component';
import { AssignPilotComponent } from './component/assign-pilot/assign-pilot.component';
import { ProfilComponent } from './component/profil/profil.component';
import { ViewuserComponent } from './component/viewuser/viewuser.component';

const routes: Routes = [
  //write required code here!
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
