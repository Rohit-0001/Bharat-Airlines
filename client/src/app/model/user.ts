export enum Role {
  ADMIN = 'ADMIN',
  PASSENGER = 'PASSENGER',
  PILOT = 'PILOT'
}

export interface User {
  id?: number;
  username: string;
  password?: string;
  email: string;
  contactNumber?: number;
  role: Role;
}
