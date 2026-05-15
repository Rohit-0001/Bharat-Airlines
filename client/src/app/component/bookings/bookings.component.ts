import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../../services/http.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.scss']
})
export class BookingsComponent implements OnInit {

  bookings: any[] = [];
  showMessage = false;
  showError = false;
  responseMessage = '';
  errorMessage = '';

  constructor(private httpService: HttpService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.httpService.getMyBookings().subscribe({
      next: (data) => {
        this.bookings = data;
        this.showError = false;
      },
      error: () => {
        this.showError = true;
        this.errorMessage = 'Failed to load bookings.';
      }
    });
  }

  cancelBooking(id: number): void {
    this.httpService.updateBookingStatus(id, 'CANCELLED').subscribe({
      next: () => {
        this.showMessage = true;
        this.showError = false;
        this.responseMessage = 'Booking cancelled successfully.';
        this.loadBookings();
      },
      error: (err) => {
        this.showError = true;
        this.errorMessage = err?.error?.message || 'Failed to cancel booking.';
      }
    });
  }

  downloadTicket(id: number): void {
    this.httpService.downloadTicket(id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ticket.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.showError = true;
        this.errorMessage = 'Failed to download ticket.';
      }
    });
  }
}