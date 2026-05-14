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
  seatNumbers = '';
  sourceList: string[] = [];
  destinationList: string[] = [];
  dropdownOpen = false;
  showMessage = false;
  showError = false;
  errorMessage = '';
  totalPrice = 0;

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      source: ['', Validators.required],
      destination: ['', Validators.required],
      date: ['', Validators.required],
      adult: [1, Validators.min(1)],
      child: [0, Validators.min(0)],
      infant: [0, Validators.min(0)],
      travelClass: ['Economy', Validators.required]
    });
    this.loadSuggestions();
  }

  loadSuggestions(): void {
    this.httpService.suggestSource().subscribe((result: any[]) => {
      this.sourceList = Array.from(new Set(result.map(item => item.source || item)));
    });
    this.httpService.suggestDestination().subscribe((result: any[]) => {
      this.destinationList = Array.from(new Set(result.map(item => item.destination || item)));
    });
  }

  search(): void {
    this.showMessage = false;
    this.showError = false;

    if (this.searchForm.invalid) {
      this.showError = true;
      this.errorMessage = 'Please fill all required search fields.';
      return;
    }

    const { source, destination, date } = this.searchForm.value;
    this.httpService.searchFlights(source, destination, date).subscribe({
      next: (result) => {
        this.flights = result || [];
        this.showError = false;
      },
      error: () => {
        this.showError = true;
        this.errorMessage = 'Flight search failed. Please try again.';
      }
    });
  }

  viewFlight(flight: any): void {
    this.selectedFlight = flight;
    this.seatNumbers = '';
    this.calculatePrice();
  }

  calculatePrice(): void {
    if (!this.selectedFlight) {
      this.totalPrice = 0;
      return;
    }

    const { adult, child, infant } = this.searchForm.value;
    const price = this.selectedFlight.price || 0;
    this.totalPrice = adult * price + child * price * 0.75 + infant * price * 0.5;
  }

  onSeatSelected(seatNumber: string): void {
    this.seatNumbers = seatNumber;
  }

  updateTravelerCount(type: string, delta: number): void {
    const control = this.searchForm.get(type);
    if (!control) {
      return;
    }
    let value = control.value + delta;
    if (value < 0) {
      value = 0;
    }
    if (type === 'adult' && value < 1) {
      value = 1;
    }
    control.setValue(value);
    if (this.selectedFlight) {
      this.calculatePrice();
    }
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  bookSelectedFlight(): void {
    this.showMessage = false;
    this.showError = false;

    if (!this.selectedFlight || !this.seatNumbers) {
      this.showError = true;
      this.errorMessage = 'Please select a flight and seats before booking.';
      return;
    }

    const userId = this.authService.getUserId;
    if (!userId) {
      this.showError = true;
      this.errorMessage = 'User information is missing. Please login again.';
      return;
    }

    const seats = this.seatNumbers.split(',').map((s: string) => s.trim()).filter((s: string) => !!s);
    this.httpService.bookSeats(this.selectedFlight.id, seats, Number(userId)).subscribe({
      next: () => {
        this.showMessage = true;
        this.showError = false;
      },
      error: () => {
        this.showError = true;
        this.errorMessage = 'Booking failed. Please try again.';
      }
    });
  }
}