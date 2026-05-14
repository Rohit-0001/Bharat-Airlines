export interface LoginRequest {
  username: string;
  password: string;
}

export interface AssignManagerRequest {
  flightId: number;
  pilotId: number;
  scheduledDate: string;  // Format: YYYY-MM-DD
  assignStatus: string;   // e.g., 'ASSIGNED'
}