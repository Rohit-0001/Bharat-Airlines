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
  @Output() seatSelected = new EventEmitter<string>();

  seatMap: any[][] = [];
  selectedSeatNumber: string | null = null;

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
  }

  // Group seats by rowLabel to create a 2D grid
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

  selectSeat(seat: any): void {
    if (seat.booked) return;
    this.selectedSeatNumber = seat.seatNumber;
    this.seatSelected.emit(seat.seatNumber);
  }
}