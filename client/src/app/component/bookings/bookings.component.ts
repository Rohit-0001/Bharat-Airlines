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
  showMessage   = false;
  showError     = false;
  responseMessage = '';
  errorMessage    = '';

  constructor(
    private httpService: HttpService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  // ── Load booking history ──────────────────────────────────────────────
  loadBookings(): void {
    // GET /api/booking/bookings
    // Authorization: Bearer <token>  → backend extracts username from JWT
    // Backend: findByUsername(auth.getName()) → findByUserId(user.id)
    // Returns: List<Bookings> — each has id, pnr, seatNumbers, bookingDate,
    //          status, paymentStatus, user{id,username,email,role}, flight{...}
    this.httpService.getMyBookings().subscribe({
      next: (result) => {
        this.bookings  = result || [];
        this.showError = false;
      },
      error: () => {
        this.showError    = true;
        this.errorMessage = 'Failed to load bookings.';
      }
    });
  }

  // ── Cancel booking ────────────────────────────────────────────────────
  cancelBooking(id: number): void {
    this.showMessage = false;
    this.showError   = false;

    // PUT /api/booking/{id}/status  Body: { status: 'CANCELLED' }
    this.httpService.updateBookingStatus(id, 'CANCELLED').subscribe({
      next: () => {
        this.showMessage    = true;
        this.responseMessage = 'Booking cancelled successfully.';
        this.loadBookings(); // refresh the list immediately
      },
      error: (error) => {
        this.showError    = true;
        this.errorMessage = error?.error?.message || 'Failed to cancel booking.';
      }
    });
  }

  // ── Download PDF ticket ───────────────────────────────────────────────
  downloadTicket(id: number): void {
    this.showError = false;

    // GET /api/booking/ticket/{id}  → returns PDF bytes (application/pdf)
    this.httpService.downloadTicket(id).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href     = objectUrl;
        link.download = 'ticket.pdf';
        link.click();
        URL.revokeObjectURL(objectUrl);
      },
      error: () => {
        this.showError    = true;
        this.errorMessage = 'Failed to download ticket.';
      }
    });
  }
}