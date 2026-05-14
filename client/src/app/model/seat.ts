export interface Seat {
  id?: number;
  flightId?: number;
  seatNumber: string;
  rowLabel?: string;
  columnNumber?: number;
  price?: number;
  isAvailable?: boolean;
  isXL?: boolean;
  isBlocked?: boolean;
  isEmergencyExist?: boolean;
}