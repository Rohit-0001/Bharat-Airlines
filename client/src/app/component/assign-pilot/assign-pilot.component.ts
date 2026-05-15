import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../../services/http.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-assign-pilot',
  templateUrl: './assign-pilot.component.html',
  styleUrls: ['./assign-pilot.component.scss']
})
export class AssignPilotComponent implements OnInit {

  assignForm!: FormGroup;
  flights: any[] = [];
  pilots: any[] = [];
  schedules: any[] = [];
  roleName = '';
  showMessage = false;
  showError = false;
  responseMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private httpService: HttpService, private authService: AuthService) {}

  ngOnInit(): void {
    this.roleName = this.authService.getRole;

    this.assignForm = this.fb.group({
      flightId: ['', Validators.required],
      pilotId: ['', Validators.required],
      scheduledDate: ['', Validators.required],
      assignStatus: ['ASSIGNED', Validators.required]
    });

    this.httpService.getAllFlights().subscribe({ next: (data) => this.flights = data });
    this.httpService.getPilots().subscribe({ next: (data) => this.pilots = data });

    if (this.roleName === 'ADMIN') {
      this.httpService.getAllSchedules().subscribe({ next: (data) => this.schedules = data });
    } else {
      this.httpService.getMySchedule().subscribe({ next: (data) => this.schedules = data });
    }
  }

  onSubmit(): void {
    if (this.assignForm.invalid) return;

    const { flightId, pilotId, scheduledDate, assignStatus } = this.assignForm.value;
    this.httpService.assignPilot(flightId, pilotId, scheduledDate, assignStatus).subscribe({
      next: () => {
        this.showMessage = true;
        this.showError = false;
        this.responseMessage = 'Pilot assigned successfully!';
        this.httpService.getAllSchedules().subscribe({ next: (data) => this.schedules = data });
      },
      error: (err) => {
        this.showError = true;
        this.errorMessage = err?.error?.message || 'Assignment failed.';
      }
    });
  }

  updateStatus(id: number, status: string): void {
    this.httpService.updateScheduleStatus(id, status).subscribe({
      next: () => {
        this.showMessage = true;
        this.showError = false;
        if (this.roleName === 'ADMIN') {
          this.httpService.getAllSchedules().subscribe({ next: (data) => this.schedules = data });
        } else {
          this.httpService.getMySchedule().subscribe({ next: (data) => this.schedules = data });
        }
      },
      error: (err) => {
        this.showError = true;
        this.errorMessage = err?.error?.message || 'Failed to update status.';
      }
    });
  }
}