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

  constructor(private httpService: HttpService, public authService: AuthService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.httpService.getMyBookings().subscribe({
      next: (result) => {
        this.bookings = result || [];
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
        this.responseMessage = 'Booking cancelled successfully.';
        this.loadBookings();
      },
      error: (error) => {
        this.showError = true;
        this.errorMessage = error?.error?.message || 'Failed to cancel booking.';
      }
    });
  }

  downloadTicket(id: number): void {
    this.httpService.downloadTicket(id).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = 'ticket.pdf';
        link.click();
        URL.revokeObjectURL(objectUrl);
      },
      error: () => {
        this.showError = true;
        this.errorMessage = 'Failed to download ticket.';
      }
    });
  }
}
