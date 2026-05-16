// import { NgModule } from '@angular/core';
// import { RouterModule, Routes } from '@angular/router';
// import { LoginComponent } from './auth/login/login.component';
// import { RegisterComponent } from './auth/register/register.component';
// import { DashboardComponent } from './component/dashboard/dashboard.component';
// import { FlightComponent } from './component/flight/flight.component';
// import { FlightSearchComponent } from './component/flight-search/flight-search.component';
// import { BookingsComponent } from './component/bookings/bookings.component';
// import { AssignPilotComponent } from './component/assign-pilot/assign-pilot.component';
// import { ProfilComponent } from './component/profil/profil.component';
// import { ViewuserComponent } from './component/viewuser/viewuser.component';
// import { AuthGuard } from './auth.guard';

// const routes: Routes = [
//   { path: 'login', component: LoginComponent },
//   { path: 'register', component: RegisterComponent },
//   { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
//   { path: 'add_flights', component: FlightComponent, canActivate: [AuthGuard] },
//   { path: 'view_all_user', component: ViewuserComponent, canActivate: [AuthGuard] },
//   { path: 'assign_pilot', component: AssignPilotComponent, canActivate: [AuthGuard] },
//   { path: 'search_flight', component: FlightSearchComponent, canActivate: [AuthGuard] },
//   { path: 'my_booking', component: BookingsComponent, canActivate: [AuthGuard] },
//   { path: 'my_profile', component: ProfilComponent, canActivate: [AuthGuard] },
//   { path: '', redirectTo: '/login', pathMatch: 'full' }
// ];

// @NgModule({
//   imports: [RouterModule.forRoot(routes)],
//   exports: [RouterModule]
// })
// export class AppRoutingModule {}


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
import { RoleGuard } from './role.guard';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'add_flights', component: FlightComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['ADMIN'] } },
  { path: 'view_all_user', component: ViewuserComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['ADMIN'] } },
  { path: 'assign_pilot', component: AssignPilotComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['ADMIN', 'PILOT'] } },
  { path: 'search_flight', component: FlightSearchComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['PASSENGER'] } },
  { path: 'my_booking', component: BookingsComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['PASSENGER'] } },
  { path: 'my_profile', component: ProfilComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
