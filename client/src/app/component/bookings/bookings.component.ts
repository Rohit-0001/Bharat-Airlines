import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../../services/http.service';
import { BookingStatus } from '../../model/bookings';

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
  isLoading = false;
  cancellingId: number | null = null;
  downloadingId: number | null = null;

  readonly cancelledTooltip = 'Ticket cancelled';

  constructor(private httpService: HttpService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.isLoading = true;
    this.httpService.getMyBookings().subscribe({
      next: (data) => {
        this.bookings = this.sortBookings(data);
        this.showError = false;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showError = true;
        this.errorMessage = 'Failed to load bookings.';
      }
    });
  }

  private sortBookings(bookings: any[]): any[] {
    return [...bookings].sort((a, b) => {
      const aCancelled = this.isCancelled(a);
      const bCancelled = this.isCancelled(b);
      if (aCancelled !== bCancelled) {
        return aCancelled ? 1 : -1;
      }
      const aDate = new Date(a.bookingDate || 0).getTime();
      const bDate = new Date(b.bookingDate || 0).getTime();
      return bDate - aDate;
    });
  }

  isCancelled(booking: any): boolean {
    return booking?.status === BookingStatus.CANCELLED;
  }

  isConfirmed(booking: any): boolean {
    return booking?.status === BookingStatus.CONFIRMED;
  }

  canCancel(booking: any): boolean {
    return this.isConfirmed(booking);
  }

  canDownload(booking: any): boolean {
    return this.isConfirmed(booking);
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
    const booking = this.bookings.find(b => b.id === id);
    if (booking && this.isCancelled(booking)) {
      this.showError = true;
      this.errorMessage = 'This booking has already been cancelled.';
      return;
    }
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    if (this.cancellingId !== null) return;

    this.cancellingId = id;
    this.httpService.cancelBooking(id).subscribe({
      next: () => {
        this.cancellingId = null;
        this.showMessage = true;
        this.showError = false;
        this.responseMessage = 'Booking cancelled successfully. It remains in your booking history.';
        this.loadBookings();
      },
      error: (err) => {
        this.cancellingId = null;
        this.showError = true;
        this.errorMessage = err?.error?.message || 'Failed to cancel booking.';
      }
    });
  }

  downloadTicket(id: number): void {
    const booking = this.bookings.find(b => b.id === id);
    if (booking && this.isCancelled(booking)) {
      this.showError = true;
      this.errorMessage = this.cancelledTooltip;
      return;
    }
    if (this.downloadingId !== null) return;
    this.downloadingId = id;

    this.httpService.downloadTicket(id).subscribe({
      next: (blob: Blob) => {
        this.downloadingId = null;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ticket.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.downloadingId = null;
        this.showError = true;
        this.errorMessage = err?.error?.message || 'Failed to download ticket.';
      }
    });
  }
}