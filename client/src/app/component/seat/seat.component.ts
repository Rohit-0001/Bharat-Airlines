import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Seat } from '../../model/seat';
import { SeatService } from '../../services/seat.service';

@Component({
  selector: 'app-seat',
  templateUrl: './seat.component.html',
  styleUrls: ['./seat.component.scss']
})
export class SeatSelectionComponent implements OnInit, OnChanges {

  @Input() flightId!: number;
  @Input() seats: Seat[] = [];
  @Input() maxSelectable: number = 1;
  @Output() seatSelected = new EventEmitter<string>();

  seatMap: any[][] = [];
  selectedSeatNumbers: Set<string> = new Set();

  constructor(private seatService: SeatService) {}

  ngOnInit(): void {
    if (this.flightId && (!this.seats || this.seats.length === 0)) {
      this.seatService.getSeats(this.flightId).subscribe({
        next: (data) => { this.buildSeatMap(data); }
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['seats'] && changes['seats'].currentValue) {
      this.buildSeatMap(changes['seats'].currentValue);
    }
    if (changes['flightId']) {
      this.selectedSeatNumbers = new Set();
    }
  }

  buildSeatMap(seats: any[]): void {
    const rowMap: { [key: string]: any[] } = {};
    const rowOrder: string[] = [];
    for (const seat of seats) {
      // FIX: Normalise seat numbers to uppercase so what we send to backend matches DB
      const normalisedSeat = {
        ...seat,
        seatNumber: (seat.seatNumber || '').trim().toUpperCase(),
        rowLabel: (seat.rowLabel || '').trim().toUpperCase(),
        booked: !seat.isAvailable
      };
      const row = normalisedSeat.rowLabel;
      if (!rowMap[row]) {
        rowMap[row] = [];
        rowOrder.push(row);
      }
      rowMap[row].push(normalisedSeat);
    }
    // Sort rows alphabetically, seats within each row by column number
    rowOrder.sort();
    this.seatMap = rowOrder.map(row =>
      rowMap[row].sort((a, b) => a.columnNumber - b.columnNumber)
    );
  }

  isSelected(seatNumber: string): boolean {
    return this.selectedSeatNumbers.has(seatNumber.toUpperCase());
  }

  selectSeat(seat: any): void {
    if (seat.booked || seat.isBlocked) return;

    const seatNum = seat.seatNumber.toUpperCase();

    if (this.selectedSeatNumbers.has(seatNum)) {
      this.selectedSeatNumbers.delete(seatNum);
      this.seatSelected.emit(seatNum);
    } else {
      if (this.selectedSeatNumbers.size >= this.maxSelectable) {
        return;
      }
      this.selectedSeatNumbers.add(seatNum);
      this.seatSelected.emit(seatNum);
    }
  }
}