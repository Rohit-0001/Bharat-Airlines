export interface LoginRequest {
  username: string;
  password: string;
}

export interface AssignManagerRequest {
  flightId: number;
  pilotId: number;
  scheduledDate: string;
  assignStatus: string;
}
