import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { Seat } from '../../model/seat';
import { SeatService } from '../../services/seat.service';

@Component({
  selector: 'app-seat',
  templateUrl: './seat.component.html',
  styleUrls: ['./seat.component.scss']
})
export class SeatSelectionComponent implements OnChanges, OnInit {

  @Input() flightId?: number;
  @Input() seats: Seat[] = [];
  @Output() seatSelected = new EventEmitter<string>();

  seatMap: Seat[][] = [];
  selectedSeatNumber: string | null = null;
  loading = false;
  error = false;

  constructor(private seatService: SeatService) {}

  // ✅ FIX 1: ADD THIS
  ngOnInit(): void {
    if (this.flightId) {
      this.loadSeats();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['flightId'] && this.flightId) {
      this.loadSeats();
    }
    if (changes['seats'] && this.seats) {
      this.buildSeatMap();
    }
  }

  loadSeats(): void {
    this.loading = true;
    this.error = false;

    if (!this.flightId) {
      this.seats = [];
      this.loading = false;
      return;
    }

    this.seatService.getSeats(this.flightId).subscribe({
      next: (data: Seat[]) => {
        this.seats = data || [];
        this.buildSeatMap();
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }

  buildSeatMap(): void {
    const rows: { [row: string]: Seat[] } = {};

    this.seats.forEach((seat) => {
      const row = seat.rowLabel || 'Unknown';

      if (!rows[row]) {
        rows[row] = [];
      }

      rows[row].push(seat);
    });

    this.seatMap = Object.keys(rows)
      .sort()
      .map((row) =>
        rows[row].sort((a, b) => (a.columnNumber || 0) - (b.columnNumber || 0))
      );
  }

 selectSeat(seat: any): void {

  const isBooked = seat.booked ?? false;
  const isAvailable = seat.isAvailable ?? !isBooked;
  const isBlocked = seat.isBlocked ?? false;

 
  if (isBooked || !isAvailable || isBlocked) {
    this.selectedSeatNumber = null;
    return;
  }

  
  this.selectedSeatNumber = seat.seatNumber;

  if (this.selectedSeatNumber) {
    this.seatSelected.emit(this.selectedSeatNumber);
  }
}

  isSelected(seat: Seat): boolean {
    return seat.seatNumber === this.selectedSeatNumber;
  }
}