import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../../services/http.service';
import { AuthService } from '../../../services/auth.service';

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
  showMessage = false;
  showError = false;
  responseMessage = '';
  errorMessage = '';
  seats: any[] = [];
  isBooking = false; // FIX: double-submit guard

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      source: ['', Validators.required],
      destination: ['', Validators.required],
      date: ['', Validators.required],
      adult: [1],
      child: [0],
      infant: [0],
      travelClass: ['Economy']
    });

    // FIX: Deduplicate city suggestions
    this.httpService.suggestSource().subscribe({
      next: (data: any[]) => {
        const sources = data.map(f => f.source);
        this.sourceList = [...new Set(sources)];
      }
    });
    this.httpService.suggestDestination().subscribe({
      next: (data: any[]) => {
        const destinations = data.map(f => f.destination);
        this.destinationList = [...new Set(destinations)];
      }
    });
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  updateTravelerCount(type: string, delta: number): void {
    const ctrl = this.searchForm.get(type);
    if (ctrl) {
      const newVal = (ctrl.value || 0) + delta;
      if (newVal >= 0) ctrl.setValue(newVal);
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

  search(): void {
    if (this.searchForm.invalid) return;
    const { source, destination, date } = this.searchForm.value;
    this.httpService.searchFlights(source, destination, date).subscribe({
      next: (data) => {
        this.flights = data;
        this.showError = false;
      },
      error: () => {
        this.showError = true;
        this.errorMessage = 'Search failed.';
      }
    });
  }

  viewFlight(flight: any): void {
    this.selectedFlight = flight;
    this.selectedSeatNumbers = [];
    const adult = this.searchForm.get('adult')?.value || 1;
    const child = this.searchForm.get('child')?.value || 0;
    const infant = this.searchForm.get('infant')?.value || 0;
    this.totalPrice = adult * flight.price + child * flight.price * 0.75 + infant * flight.price * 0.5;
    this.httpService.getSeats(flight.id).subscribe({
      next: (data) => { this.seats = data; }
    });
  }

  onSeatSelected(seatNum: string): void {
    const idx = this.selectedSeatNumbers.indexOf(seatNum);
    if (idx > -1) {
      this.selectedSeatNumbers.splice(idx, 1);
    } else {
      if (this.selectedSeatNumbers.length >= this.totalTravelers) {
        this.showError = true;
        this.errorMessage = `You can only select ${this.totalTravelers} seat(s) for your party. Deselect a seat before choosing another.`;
        return;
      }
      this.selectedSeatNumbers.push(seatNum);
      this.showError = false;
    }
  }

  get seatSelectionLabel(): string {
    if (this.selectedSeatNumbers.length === 0) return 'None';
    return this.selectedSeatNumbers.join(', ');
  }

  bookSelectedFlight(): void {
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

    // FIX: Prevent double-submit on rapid button clicks
    if (this.isBooking) return;
    this.isBooking = true;

    const userId = Number(this.authService.getUserId());
    this.httpService.bookSeats(this.selectedFlight.id, this.selectedSeatNumbers, userId).subscribe({
      next: () => {
        this.isBooking = false;
        this.showMessage = true;
        this.showError = false;
        this.responseMessage = 'Booking successful!';
        this.selectedSeatNumbers = [];
      },
      error: (err) => {
        this.isBooking = false;
        this.showError = true;
        this.errorMessage = err?.error?.message || 'Booking failed.';
      }
    });
  }
}