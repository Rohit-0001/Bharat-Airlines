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

  constructor(
    private fb: FormBuilder,
    private httpService: HttpService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initFlightForm();
    this.loadFlights();
  }

  get seats(): FormArray {
    return this.flightForm.get('seats') as FormArray;
  }

  initFlightForm(): void {
    this.flightForm = this.fb.group({
      flight_number: ['', Validators.required],
      flight_name: ['', Validators.required],
      source: ['', Validators.required],
      destination: ['', Validators.required],
      departureDate: ['', Validators.required],
      departureTime: ['', Validators.required],
      arrivalTime: ['', Validators.required],
      totalSeats: [1, [Validators.required, Validators.min(1)]],
      available_seats: [1, [Validators.required, Validators.min(0)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      status: ['SCHEDULED', Validators.required],
      seats: this.fb.array([])
    });
    this.addSeat();
  }

  addSeat(): void {
    this.seats.push(
      this.fb.group({
        seatNumber: ['', Validators.required],
        rowLabel: ['', Validators.required],
        columnNumber: [1, [Validators.required, Validators.min(1)]],
        price: [0, [Validators.required, Validators.min(0)]],
        isAvailable: [true],
        isXL: [false],
        isBlocked: [false],
        isEmergencyExist: [false]
      })
    );
  }

  removeSeat(index: number): void {
    if (this.seats.length > 1) {
      this.seats.removeAt(index);
    }
  }

  loadFlights(): void {
    this.httpService.getAllFlights().subscribe({
      next: (result) => {
        this.flights = result || [];
        this.showError = false;
      },
      error: () => {
        this.showError = true;
        this.errorMessage = 'Unable to load flights.';
      }
    });
  }

  onSubmit(): void {
    this.showMessage = false;
    this.showError = false;

    if (this.flightForm.invalid) {
      this.showError = true;
      this.errorMessage = 'Please provide valid flight information.';
      return;
    }

    this.httpService.createFlight(this.flightForm.value).subscribe({
      next: () => {
        this.showMessage = true;
        this.flightForm.reset();
        while (this.seats.length) {
          this.seats.removeAt(0);
        }
        this.addSeat();
        this.loadFlights();
      },
      error: () => {
        this.showError = true;
        this.errorMessage = 'Failed to create flight. Please try again.';
      }
    });
  }
}