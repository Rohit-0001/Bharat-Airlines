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
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'add_flights', component: FlightComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
  { path: 'search_flight', component: FlightSearchComponent, canActivate: [AuthGuard], data: { roles: ['PASSENGER'] } },
  { path: 'my_booking', component: BookingsComponent, canActivate: [AuthGuard], data: { roles: ['PASSENGER'] } },
  { path: 'assign_pilot', component: AssignPilotComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN', 'PILOT'] } },
  { path: 'view_all_user', component: ViewuserComponent, canActivate: [AuthGuard], data: { roles: ['ADMIN'] } },
  { path: 'my_profile', component: ProfilComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}