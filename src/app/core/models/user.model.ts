export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  favorites: string[]; // destination ids
  token?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
