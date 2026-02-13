export type UserRole = 'CLIENT';

export interface AuthenticatedUser {
  email: string;
  fullName: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: AuthenticatedUser;
}
