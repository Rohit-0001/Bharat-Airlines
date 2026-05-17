// import { Flights } from './flights';
// import { User } from './bookings';

// export enum ScheduleStatus {
//   PENDING = 'PENDING',
//   CONFIRMED = 'CONFIRMED',
//   COMPLETED = 'COMPLETED',
//   ASSIGNED = 'ASSIGNED'
// }

// export interface FlightSchedule {
//   id?: number;
//   flight?: Flights;
//   pilot?: User;
//   scheduledDate?: string;
//   status?: string;
//   assignStatus?: string;
// }


import { Flights } from './flights';
import { User } from './bookings';

export enum ScheduleStatus {
  PENDING_PILOT_ASSIGNMENT = 'PENDING_PILOT_ASSIGNMENT',
  AWAITING_PILOT_ACCEPTANCE = 'AWAITING_PILOT_ACCEPTANCE',
  PILOT_REJECTED = 'PILOT_REJECTED',
  CONFIRMED = 'CONFIRMED',
  BOARDING = 'BOARDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export interface FlightSchedule {
  id?: number;
  flight?: Flights;
  pilot?: User;
  scheduledDate?: string;
  status?: string;
  assignStatus?: string;
}
