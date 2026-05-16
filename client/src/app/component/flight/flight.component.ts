
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../../services/http.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-flight',
  templateUrl: './flight.component.html',
  styleUrls: ['./flight.component.scss']
})
export class FlightComponent implements OnInit {

  flightForm!: FormGroup;
  flights: any[] = [];
  showMessage = false;
  showError = false;
  errorMessage = '';
  today = new Date().toISOString().split('T')[0];

  constructor(private fb: FormBuilder, private httpService: HttpService, public authService: AuthService) {}

  ngOnInit(): void {
    this.flightForm = this.fb.group({
      flight_number: ['', Validators.required],
      flight_name: ['', Validators.required],
      source: ['', Validators.required],
      destination: ['', Validators.required],
      departureDate: ['', Validators.required],
      departureTime: ['', Validators.required],
      arrivalTime: ['', Validators.required],
      totalSeats: ['', [Validators.required, Validators.min(1)]],
      available_seats: ['', [Validators.required, Validators.min(0)]],
      price: ['', [Validators.required, Validators.min(0.01)]],
      status: ['PENDING_PILOT_ASSIGNMENT', Validators.required],
      seats: this.fb.array([])
    });

    // Auto-fill available_seats when totalSeats is set
    this.flightForm.get('totalSeats')?.valueChanges.subscribe(val => {
      const availCtrl = this.flightForm.get('available_seats');
      if (availCtrl && (availCtrl.value === '' || availCtrl.value === null || availCtrl.value === 0)) {
        availCtrl.setValue(val, { emitEvent: false });
      }
    });

    this.addSeat();
    this.loadFlights();
  }

  get seats(): FormArray {
    return this.flightForm.get('seats') as FormArray;
  }

  addSeat(): void {
    const seatGroup = this.fb.group({
      seatNumber: [''],
      rowLabel: [''],
      columnNumber: [1],
      price: [0],
      isAvailable: [true],
      isXL: [false],
      isBlocked: [false],
      isEmergencyExist: [false]
    });
    this.seats.push(seatGroup);
  }

  removeSeat(index: number): void {
    this.seats.removeAt(index);
  }

  loadFlights(): void {
    this.httpService.getAllFlights().subscribe({
      next: (data) => { this.flights = data; },
      error: () => { this.showError = true; }
    });
  }

  onSubmit(): void {
    if (this.flightForm.invalid) return;

    this.httpService.createFlight(this.flightForm.value).subscribe({
      next: () => {
        this.showMessage = true;
        this.showError = false;
        this.flightForm.reset({ status: 'SCHEDULED' });
        this.seats.clear();
        this.addSeat();
        this.loadFlights();
      },
      error: (err) => {
        this.showError = true;
        this.errorMessage = err?.error?.message || 'Failed to create flight.';
      }
    });
  }
}