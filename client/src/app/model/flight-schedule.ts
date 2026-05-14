import { Flights } from './flights';
import { User } from './user';

export enum ScheduleStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED'
}

export interface FlightSchedule {
  id?: number;
  flight?: Flights;
  pilot?: User;
  scheduledDate?: string;
  status?: ScheduleStatus | string;
  assignStatus?: string;
}