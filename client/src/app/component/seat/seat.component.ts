
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
  @Input() selectedSeats: string[] = [];
  @Output() seatSelected = new EventEmitter<string>();

  seatMap: any[][] = [];

  hasEmergencySeats = false;
  hasXLSeats = false;

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
  }

  buildSeatMap(seats: any[]): void {
    const rowMap: { [key: string]: any[] } = {};
    const rowOrder: string[] = [];

    this.hasEmergencySeats = false;
    this.hasXLSeats = false;

    for (const seat of seats) {
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

      if (normalisedSeat.isEmergencyExist) this.hasEmergencySeats = true;
      if (normalisedSeat.isXL) this.hasXLSeats = true;
    }

    rowOrder.sort();
    this.seatMap = rowOrder.map(row =>
      rowMap[row].sort((a, b) => a.columnNumber - b.columnNumber)
    );
  }

  isSelected(seatNumber: string): boolean {
    return this.selectedSeats.includes(seatNumber.toUpperCase());
  }

  getSeatTooltip(seat: any): string {
    if (seat.booked) return `${seat.seatNumber} — Booked`;
    if (seat.isBlocked) return `${seat.seatNumber} — Blocked (not available)`;
    const features: string[] = [];
    if (seat.isEmergencyExist) features.push('Emergency Exit Row');
    if (seat.isXL) features.push('Extra Legroom');
    const price = seat.price > 0 ? `₹${seat.price}` : '';
    const featureStr = features.length ? ` (${features.join(', ')})` : '';
    return `${seat.seatNumber}${featureStr}${price ? ' — ' + price : ''}`;
  }

  selectSeat(seat: any): void {
    if (seat.booked || seat.isBlocked) return;
    this.seatSelected.emit(seat.seatNumber.toUpperCase());
  }
}
