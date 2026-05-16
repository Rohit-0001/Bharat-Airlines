import { Component, OnInit } from '@angular/core';
import { FlightSchedule } from '../../model/flight-schedule';
import { FlightScheduleService } from '../../services/flight-schedul.service';

@Component({
  selector: 'app-flight-schedul',
  templateUrl: './flight-schedul.component.html',
  styleUrls: ['./flight-schedul.component.scss']
})
export class FlightSchedulComponent implements OnInit {

  schedules: FlightSchedule[] = [];
  isLoading = true;
  showMessage = false;
  showError = false;
  responseMessage = '';
  errorMessage = '';

  constructor(private flightScheduleService: FlightScheduleService) {}

  ngOnInit(): void {
    this.loadSchedules();
  }

  loadSchedules(): void {
    this.isLoading = true;
    this.flightScheduleService.getMySchedule().subscribe({
      next: (data) => {
        this.schedules = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to load your schedule.';
        this.showError = true;
        this.isLoading = false;
      }
    });
  }

  updateStatus(id: number, status: string): void {
    this.flightScheduleService.updateScheduleStatus(id, status).subscribe({
      next: () => {
        this.showMessage = true;
        this.showError = false;
        this.responseMessage = `Schedule updated to ${status}.`;
        this.loadSchedules();
      },
      error: (err) => {
        this.showError = true;
        this.showMessage = false;
        this.errorMessage = err?.error?.message || 'Failed to update schedule status.';
      }
    });
  }
}