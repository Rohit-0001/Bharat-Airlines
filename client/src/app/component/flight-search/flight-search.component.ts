import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../../services/http.service';
import { AuthService } from '../../../services/auth.service';

import { differentCitiesValidator } from '../../validators/custom.validators';
import { RazorpayService } from '../../../services/razorpay.service';

@Component({
  selector: 'app-flight-search',
  templateUrl: './flight-search.component.html',
  styleUrls: ['./flight-search.component.scss']
})
export class FlightSearchComponent implements OnInit {

  searchForm!: FormGroup;
  flights: any[] = [];
  selectedFlight: any = null;
  totalPrice = 0;
  selectedSeatNumbers: string[] = [];
  sourceList: string[] = [];
  destinationList: string[] = [];
  dropdownOpen = false;
  modalTravellerOpen = false;
  showMessage = false;
  showError = false;
  responseMessage = '';
  errorMessage = '';
  seats: any[] = [];
  isBooking = false;
  isSearching = false;
  searchAttempted = false;

  // Payment state
  paymentState: 'idle' | 'processing' | 'success' | 'failed' = 'idle';
  paymentId: string = '';

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private authService: AuthService,
    private razorpayService: RazorpayService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      source: ['', Validators.required],
      destination: ['', Validators.required],
      date: ['', Validators.required],
      adult: [1, [Validators.required, Validators.min(1)]],
      child: [0, [Validators.min(0)]],
      infant: [0, [Validators.min(0)]],
      travelClass: ['Economy']
    }, { validators: differentCitiesValidator });

    this.httpService.suggestSource().subscribe({
      next: (data: string[]) => { this.sourceList = data || []; }
    });
    this.httpService.suggestDestination().subscribe({
      next: (data: string[]) => { this.destinationList = data || []; }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.dropdownOpen && !target.closest('.traveler-dropdown')) {
      this.dropdownOpen = false;
    }
    if (this.modalTravellerOpen && !target.closest('.modal-traveller-dropdown')) {
      this.modalTravellerOpen = false;
    }
  }

  toggleDropdown(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.modalTravellerOpen = false;
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleModalTravellers(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.dropdownOpen = false;
    this.modalTravellerOpen = !this.modalTravellerOpen;
  }

  closeDropdown(): void {
    this.dropdownOpen = false;
  }

  applyTravellers(): void {
    this.syncSeatsAfterTravellerChange();
    this.dropdownOpen = false;
    this.modalTravellerOpen = false;
  }

  private syncSeatsAfterTravellerChange(): void {
    const max = this.totalTravelers;
    if (this.selectedSeatNumbers.length > max) {
      this.selectedSeatNumbers = this.selectedSeatNumbers.slice(0, max);
      this.showError = true;
      this.errorMessage = `Traveller count changed. Please select ${max} seat(s) (you had more seats selected).`;
    } else {
      this.showError = false;
    }
    this.recalculateTotalPrice();
  }

  updateTravelerCount(type: string, delta: number, event?: Event): void {
    event?.stopPropagation();
    const ctrl = this.searchForm.get(type);
    if (ctrl) {
      const newVal = (ctrl.value || 0) + delta;
      if (type === 'adult' && newVal < 1) return;
      if (newVal >= 0) ctrl.setValue(newVal);
    }
    if (this.selectedFlight) {
      this.syncSeatsAfterTravellerChange();
    }
  }

  get travelerSummary(): string {
    const a = this.searchForm.get('adult')?.value || 0;
    const c = this.searchForm.get('child')?.value || 0;
    const i = this.searchForm.get('infant')?.value || 0;
    const cls = this.searchForm.get('travelClass')?.value;
    return `${a} Adult${a !== 1 ? 's' : ''}${c ? ', ' + c + ' Child' : ''}${i ? ', ' + i + ' Infant' : ''} - ${cls}`;
  }

  get totalTravelers(): number {
    const a = this.searchForm.get('adult')?.value || 0;
    const c = this.searchForm.get('child')?.value || 0;
    return a + c;
  }

  get minDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  search(): void {
    this.searchAttempted = true;
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }
    this.closeDropdown();
    this.isSearching = true;
    const { source, destination, date } = this.searchForm.value;
    this.httpService.searchFlights(source.trim(), destination.trim(), date).subscribe({
      next: (data) => {
        this.flights = data;
        this.showError = false;
        this.isSearching = false;
      },
      error: (err) => {
        this.isSearching = false;
        this.showError = true;
        this.errorMessage = err?.error?.message || 'Search failed. Please try again.';
      }
    });
  }

  viewFlight(flight: any): void {
    this.selectedFlight = flight;
    this.selectedSeatNumbers = [];
    this.totalPrice = 0;
    this.showMessage = false;
    this.showError = false;
    this.paymentState = 'idle';
    this.httpService.getSeats(flight.id).subscribe({
      next: (data) => { this.seats = data; },
      error: () => {
        this.showError = true;
        this.errorMessage = 'Could not load seats for this flight.';
      }
    });
  }

  closeModal(): void {
    this.selectedFlight = null;
    this.selectedSeatNumbers = [];
    this.totalPrice = 0;
    this.modalTravellerOpen = false;
    this.paymentState = 'idle';
  }

  recalculateTotalPrice(): void {
    if (!this.selectedFlight) return;

    const flightPrice: number = this.selectedFlight.price || 0;
    let total = 0;

    for (const seatNum of this.selectedSeatNumbers) {
      const seatData = this.seats.find(
        (s: any) => (s.seatNumber || '').trim().toUpperCase() === seatNum.toUpperCase()
      );
      const seatPrice = seatData && seatData.price > 0 ? seatData.price : flightPrice;
      total += seatPrice;
    }

    const infantCount = this.searchForm.get('infant')?.value || 0;
    total += infantCount * flightPrice * 0.5;

    this.totalPrice = total;
  }

  onSeatSelected(seatNum: string): void {
    const normalized = seatNum.toUpperCase();
    const idx = this.selectedSeatNumbers.indexOf(normalized);
    if (idx > -1) {
      this.selectedSeatNumbers.splice(idx, 1);
    } else {
      if (this.selectedSeatNumbers.length >= this.totalTravelers) {
        this.showError = true;
        this.errorMessage = `You can only select ${this.totalTravelers} seat(s) for your party. Deselect a seat before choosing another.`;
        return;
      }
      this.selectedSeatNumbers.push(normalized);
      this.showError = false;
    }
    this.recalculateTotalPrice();
  }

  get seatSelectionLabel(): string {
    if (this.selectedSeatNumbers.length === 0) return 'None';
    return this.selectedSeatNumbers.join(', ');
  }

  // ─── STEP 1: Validate → create booking (PENDING) → open Razorpay ──────────
  bookSelectedFlight(): void {
    if (this.isBooking) return;

    if (this.selectedSeatNumbers.length === 0) {
      this.showError = true;
      this.errorMessage = 'Please select at least one seat before booking.';
      return;
    }
    if (this.selectedSeatNumbers.length < this.totalTravelers) {
      this.showError = true;
      this.errorMessage = `Please select ${this.totalTravelers} seat(s) — one per traveller (excluding infants).`;
      return;
    }

    this.isBooking = true;
    this.showError = false;
    this.paymentState = 'processing';

    const infantCount = this.searchForm.get('infant')?.value || 0;

    // Create booking first (paymentStatus: PENDING)
    this.httpService.bookSeats(
      this.selectedFlight.id,
      this.selectedSeatNumbers,
      this.totalPrice,
      infantCount
    ).subscribe({
      next: (booking: any) => {
        this.isBooking = false;
        this.openRazorpay(booking);
      },
      error: (err) => {
        this.isBooking = false;
        this.paymentState = 'failed';
        this.showError = true;
        this.errorMessage = err?.error?.message || 'Booking creation failed. Seats may no longer be available.';
      }
    });
  }

  // ─── STEP 2: Open Razorpay checkout ───────────────────────────────────────
  private openRazorpay(booking: any): void {
    const username = this.authService.getUsername();

    this.razorpayService.openCheckout({
      amount: this.totalPrice,
      flightNumber: this.selectedFlight.flight_number,
      source: this.selectedFlight.source,
      destination: this.selectedFlight.destination,
      userName: username || 'Passenger',
      userEmail: '',
      userContact: '',
      onSuccess: (response) => this.onPaymentSuccess(booking.id, response.razorpay_payment_id),
      onFailure: (error) => this.onPaymentFailure(booking.id, error)
    });
  }

  // ─── STEP 3a: Payment success → update backend → redirect ─────────────────
  private onPaymentSuccess(bookingId: number, paymentId: string): void {
    this.paymentId = paymentId;
    this.paymentState = 'processing';

    this.httpService.updatePaymentStatus(bookingId, 'SUCCESS', paymentId).subscribe({
      next: () => {
        this.paymentState = 'success';
        this.showMessage = true;
        this.showError = false;
        this.responseMessage = `Payment successful! ID: ${paymentId}. Redirecting to My Bookings…`;
        setTimeout(() => {
          this.closeModal();
          this.router.navigate(['/my_booking']);
        }, 2000);
      },
      error: () => {
        // Payment went through even if status update failed — still redirect
        this.paymentState = 'success';
        this.showMessage = true;
        this.responseMessage = `Payment received (ID: ${paymentId}). Booking will be confirmed shortly.`;
        setTimeout(() => {
          this.closeModal();
          this.router.navigate(['/my_booking']);
        }, 2500);
      }
    });
  }

  // ─── STEP 3b: Payment failed / dismissed → update backend ─────────────────
  private onPaymentFailure(bookingId: number, error: any): void {
    this.paymentState = 'failed';
    this.showError = true;
    this.errorMessage = error?.description || 'Payment was cancelled or failed. Your booking has not been confirmed.';

    this.httpService.updatePaymentStatus(bookingId, 'FAILED').subscribe();
  }
}