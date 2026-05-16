import { Seat } from "./seat";

export enum FlightStatus {
  SCHEDULED = 'SCHEDULED',
  DELAYED = 'DELAYED',
  CANCELLED = 'CANCELLED'
}

export interface Flights {
  id?: number;
  flight_number: string;
  flight_name: string;
  source: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  arrivalTime: string;
  totalSeats: number;
  available_seats: number;
  isAvailable?: boolean;
  price: number;
  status: string;
  seats?: Seat[];
}
