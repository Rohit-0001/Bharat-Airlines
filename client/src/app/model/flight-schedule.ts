import { Flights } from './flights';
import { User } from './bookings';

export enum ScheduleStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  ASSIGNED = 'ASSIGNED'
}

export interface FlightSchedule {
  id?: number;
  flight?: Flights;
  pilot?: User;
  scheduledDate?: string;
  status?: string;
  assignStatus?: string;
}
