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

  getSeatCount(seatNumbers: string): number {
    if (!seatNumbers || seatNumbers.trim() === '') return 0;
    return seatNumbers.split(',').filter(s => s.trim() !== '').length;
  }

  getTotalPrice(booking: any): number {
    const pricePerSeat: number = booking.flight?.price || 0;
    const count = this.getSeatCount(booking.seatNumbers);
    return pricePerSeat * count;
  }

  cancelBooking(id: number): void {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    this.httpService.cancelBooking(id).subscribe({
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