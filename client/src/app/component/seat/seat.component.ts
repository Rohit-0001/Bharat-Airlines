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
    if (this.flightId) {
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
      const row = seat.rowLabel;
      if (!rowMap[row]) {
        rowMap[row] = [];
        rowOrder.push(row);
      }
      rowMap[row].push({ ...seat, booked: !seat.isAvailable });
    }
    this.seatMap = rowOrder.map(row => rowMap[row]);
  }

  isSelected(seatNumber: string): boolean {
    return this.selectedSeatNumbers.has(seatNumber);
  }

  selectSeat(seat: any): void {
    if (seat.booked) return;

    if (this.selectedSeatNumbers.has(seat.seatNumber)) {
      this.selectedSeatNumbers.delete(seat.seatNumber);
      this.seatSelected.emit(seat.seatNumber);
    } else {
      if (this.selectedSeatNumbers.size >= this.maxSelectable) {
        return;
      }
      this.selectedSeatNumbers.add(seat.seatNumber);
      this.seatSelected.emit(seat.seatNumber);
    }
  }
}