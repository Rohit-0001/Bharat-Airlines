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
  seatNumbers = '';
  sourceList: string[] = [];
  destinationList: string[] = [];
  dropdownOpen = false;
  showMessage = false;
  showError = false;
  responseMessage = '';
  errorMessage = '';
  seats: any[] = [];

  constructor(private fb: FormBuilder, private httpService: HttpService, private authService: AuthService) {}

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

    this.httpService.suggestSource().subscribe({
      next: (data: any[]) => { this.sourceList = data.map(f => f.source); }
    });
    this.httpService.suggestDestination().subscribe({
      next: (data: any[]) => { this.destinationList = data.map(f => f.destination); }
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
    const adult = this.searchForm.get('adult')?.value || 1;
    const child = this.searchForm.get('child')?.value || 0;
    const infant = this.searchForm.get('infant')?.value || 0;
    this.totalPrice = adult * flight.price + child * flight.price * 0.75 + infant * flight.price * 0.5;
    this.httpService.getSeats(flight.id).subscribe({
      next: (data) => { this.seats = data; }
    });
  }

  onSeatSelected(seatNum: string): void {
    this.seatNumbers = seatNum;
  }

  bookSelectedFlight(): void {
    const userId = Number(this.authService.getUserId());
    const seatList = this.seatNumbers ? [this.seatNumbers] : [];
    this.httpService.bookSeats(this.selectedFlight.id, seatList, userId).subscribe({
      next: () => {
        this.showMessage = true;
        this.showError = false;
        this.responseMessage = 'Booking successful!';
      },
      error: (err) => {
        this.showError = true;
        this.errorMessage = err?.error?.message || 'Booking failed.';
      }
    });
  }
}