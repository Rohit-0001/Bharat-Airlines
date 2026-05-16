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
  isSubmitting = false;
  updatingScheduleId: number | null = null;

  constructor(private fb: FormBuilder, private httpService: HttpService, private authService: AuthService) {}

  ngOnInit(): void {
    this.roleName = this.authService.getRole;

    this.assignForm = this.fb.group({
      flightId: ['', Validators.required],
      pilotId: ['', Validators.required],
      scheduledDate: ['', Validators.required]
    });

    this.httpService.getAllFlights().subscribe({ next: (data) => this.flights = data });
    if (this.roleName === 'ADMIN') {
      this.httpService.getPilots().subscribe({ next: (data) => this.pilots = data });
    }
    this.refreshSchedules();
  }

  refreshSchedules(): void {
    if (this.roleName === 'ADMIN') {
      this.httpService.getAllSchedules().subscribe({ next: (data) => this.schedules = data });
    } else {
      this.httpService.getMySchedule().subscribe({ next: (data) => this.schedules = data });
    }
  }

  onSubmit(): void {
    if (this.assignForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    const { flightId, pilotId, scheduledDate } = this.assignForm.value;
    this.httpService.assignPilot(flightId, pilotId, scheduledDate, 'AWAITING_PILOT_ACCEPTANCE').subscribe({
      next: () => {
        this.isSubmitting = false;
        this.showMessage = true;
        this.showError = false;
        this.responseMessage = 'Pilot assigned. Awaiting pilot acceptance.';
        this.assignForm.reset();
        this.refreshSchedules();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.showError = true;
        this.errorMessage = err?.error?.message || 'Assignment failed.';
      }
    });
  }

  updateStatus(id: number, status: string): void {
    if (this.updatingScheduleId !== null) return;
    this.updatingScheduleId = id;

    this.httpService.updateScheduleStatus(id, status).subscribe({
      next: () => {
        this.updatingScheduleId = null;
        this.showMessage = true;
        this.showError = false;
        this.responseMessage = status === 'REJECTED'
          ? 'Flight rejected. Admin has been notified via schedule status.'
          : `Schedule updated to ${status}.`;
        this.refreshSchedules();
      },
      error: (err) => {
        this.updatingScheduleId = null;
        this.showError = true;
        this.errorMessage = err?.error?.message || 'Failed to update status.';
      }
    });
  }

  isRejected(schedule: any): boolean {
    return schedule?.status === 'PILOT_REJECTED' || schedule?.assignStatus === 'REJECTED';
  }

  isAwaitingAcceptance(schedule: any): boolean {
    return schedule?.status === 'AWAITING_PILOT_ACCEPTANCE' || schedule?.assignStatus === 'AWAITING_PILOT_ACCEPTANCE';
  }
}
