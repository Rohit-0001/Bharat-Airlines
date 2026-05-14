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
  roleName: string | null = null;
  showMessage = false;
  showError = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.roleName = this.authService.getRole;
    this.assignForm = this.fb.group({
      flightId: [null, Validators.required],
      pilotId: [null, Validators.required],
      scheduledDate: ['', Validators.required],
      assignStatus: ['ASSIGNED', Validators.required]
    });
    this.loadData();
  }

  loadData(): void {
    this.httpService.getAllFlights().subscribe((flights) => {
      this.flights = flights || [];
    });
    this.httpService.getPilots().subscribe((users) => {
      this.pilots = users || [];
    });
    if (this.roleName === 'PILOT') {
      this.httpService.getAssignPilotDetails().subscribe((schedules) => {
        this.schedules = schedules || [];
      });
    } else {
      this.httpService.getAllSchedules().subscribe((schedules) => {
        this.schedules = schedules || [];
      });
    }
  }

  onFlightChange(): void {
    const flightId = this.assignForm.get('flightId')?.value;
    const selected = this.flights.find((flight) => flight.id === flightId);
    if (selected?.departureDate) {
      this.assignForm.patchValue({ scheduledDate: selected.departureDate });
    }
  }

  onSubmit(): void {
    this.showMessage = false;
    this.showError = false;

    if (this.assignForm.invalid) {
      this.showError = true;
      this.errorMessage = 'Please fill all required assignment fields.';
      return;
    }

    const { flightId, pilotId, scheduledDate, assignStatus } = this.assignForm.value;
    this.httpService.assignPilot(flightId, pilotId, scheduledDate, assignStatus).subscribe({
      next: () => {
        this.showMessage = true;
        this.assignForm.reset({ assignStatus: 'ASSIGNED' });
        this.loadData();
      },
      error: (error) => {
        this.showError = true;
        this.errorMessage = error?.error?.message || 'Failed to assign pilot.';
      }
    });
  }

  updateStatus(id: number, status: string): void {
    this.showMessage = false;
    this.showError = false;

    this.httpService.updateScheduleStatus(id, status).subscribe({
      next: () => {
        this.showMessage = true;
        this.loadData();
      },
      error: (error) => {
        this.showError = true;
        this.errorMessage = error?.error?.message || 'Unable to update schedule status.';
      }
    });
  }
}