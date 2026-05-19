
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../../services/http.service';
import { AuthService } from '../../../services/auth.service';
import { availableSeatsValidator } from '../../validators/custom.validators';

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
  formSubmitted = false;
  today = new Date().toISOString().split('T')[0];
  private readonly seatsPerRow = 6;

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
      status: ['SCHEDULED', Validators.required],
      seats: this.fb.array([])
    }, { validators: availableSeatsValidator });

    this.flightForm.get('totalSeats')?.valueChanges.subscribe(() => {
      const availCtrl = this.flightForm.get('available_seats');
      const total = Number(this.flightForm.get('totalSeats')?.value);
      if (availCtrl && (availCtrl.value === '' || availCtrl.value === null || availCtrl.value === 0) && total > 0) {
        availCtrl.setValue(total, { emitEvent: false });
      }
      this.generateSeats();
    });

    this.flightForm.get('available_seats')?.valueChanges.subscribe(() => {
      this.generateSeats();
    });

    this.loadFlights();
  }

  get seats(): FormArray {
    return this.flightForm.get('seats') as FormArray;
  }

  get seatSummary(): { generated: number; available: number; blocked: number } {
    const generated = this.seats.length;
    let available = 0;
    let blocked = 0;
    for (const seat of this.seats.controls) {
      if (seat.get('isAvailable')?.value) {
        available++;
      }
      if (seat.get('isBlocked')?.value) {
        blocked++;
      }
    }
    return { generated, available, blocked };
  }

  private getSeatName(index: number): { seatNumber: string; rowLabel: string; columnNumber: number } {
    const rowIndex = Math.floor(index / this.seatsPerRow);
    const columnNumber = (index % this.seatsPerRow) + 1;
    const rowLabel = String.fromCharCode(65 + rowIndex);
    return { seatNumber: `${rowLabel}${columnNumber}`, rowLabel, columnNumber };
  }

  generateSeats(): void {
    const total = parseInt(this.flightForm.get('totalSeats')?.value, 10);
    const availableCount = parseInt(this.flightForm.get('available_seats')?.value, 10);

    this.seats.clear();

    if (!total || total < 1) {
      return;
    }

    const avail = isNaN(availableCount) ? 0 : Math.min(Math.max(0, availableCount), total);

    for (let i = 0; i < total; i++) {
      const { seatNumber, rowLabel, columnNumber } = this.getSeatName(i);
      const isAvailable = i < avail;
      this.seats.push(this.fb.group({
        seatNumber: [{ value: seatNumber, disabled: true }],
        rowLabel: [{ value: rowLabel, disabled: true }],
        columnNumber: [{ value: columnNumber, disabled: true }],
        price: [0],
        isAvailable: [isAvailable],
        isXL: [false],
        isBlocked: [!isAvailable],
        isEmergencyExist: [false]
      }));
    }
  }

  onAvailableChange(index: number): void {
    const seat = this.seats.at(index);
    if (seat.get('isAvailable')?.value) {
      seat.patchValue({ isBlocked: false }, { emitEvent: false });
    }
  }

  onBlockedChange(index: number): void {
    const seat = this.seats.at(index);
    if (seat.get('isBlocked')?.value) {
      seat.patchValue({ isAvailable: false }, { emitEvent: false });
    }
  }

  onXLChange(index: number): void {
    if (!this.seats.at(index).get('isXL')?.value) {
      return;
    }
    this.seats.controls.forEach((ctrl, i) => {
      if (i !== index) {
        ctrl.patchValue({ isXL: false }, { emitEvent: false });
      }
    });
  }

  onEmergencyChange(index: number): void {
    if (!this.seats.at(index).get('isEmergencyExist')?.value) {
      return;
    }
    this.seats.controls.forEach((ctrl, i) => {
      if (i !== index) {
        ctrl.patchValue({ isEmergencyExist: false }, { emitEvent: false });
      }
    });
  }

  loadFlights(): void {
    this.httpService.getAllFlights().subscribe({
      next: (data) => { this.flights = data; },
      error: () => { this.showError = true; }
    });
  }

  onSubmit(): void {
    this.formSubmitted = true;
    if (this.flightForm.invalid) {
      this.flightForm.markAllAsTouched();
      return;
    }

    const total = Number(this.flightForm.get('totalSeats')?.value);
    if (this.seats.length !== total) {
      this.generateSeats();
    }

    const payload = {
      ...this.flightForm.getRawValue(),
      seats: this.seats.getRawValue()
    };

    this.httpService.createFlight(payload).subscribe({
      next: () => {
        this.showMessage = true;
        this.showError = false;
        this.flightForm.reset({ status: 'SCHEDULED' });
        this.seats.clear();
        this.formSubmitted = false;
        this.loadFlights();
      },
      error: (err) => {
        this.showError = true;
        this.errorMessage = err?.error?.message || 'Failed to create flight.';
      }
    });
  }
}