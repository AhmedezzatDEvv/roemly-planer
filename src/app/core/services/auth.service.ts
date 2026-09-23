import { Injectable, signal, computed } from '@angular/core';
import { User, UserRole } from '../models/user.model';
import { ToastService } from './toast.service';

const USERS_STORAGE_KEY = 'roamly_registered_users';
const CURRENT_USER_KEY = 'roamly_current_user';
const GUEST_FAVORITES_KEY = 'roamly_favorites';

const INITIAL_USERS: User[] = [
  {
    id: 'user_admin_01',
    name: 'Roamly Admin',
    email: 'admin@roamly.com',
    role: 'admin',
    favorites: ['kyoto-japan', 'santorini-greece'],
    token: 'jwt_mock_token_admin_2026',
    createdAt: '2026-01-10'
  },
  {
    id: 'user_traveler_02',
    name: 'Elena Rostova',
    email: 'traveler@roamly.com',
    role: 'user',
    favorites: ['kyoto-japan', 'banff-canada', 'amalfi-coast-italy'],
    token: 'jwt_mock_token_traveler_2026',
    createdAt: '2026-02-14'
  }
];

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usersSignal = signal<User[]>(this.loadUsers());
  private currentUserSignal = signal<User | null>(this.loadCurrentStoredUser());

  public currentUser = this.currentUserSignal.asReadonly();
  public isAuthenticated = computed(() => this.currentUserSignal() !== null);
  public isAdmin = computed(() => this.currentUserSignal()?.role === 'admin');

  public favorites = computed(() => {
    const user = this.currentUserSignal();
    if (user) {
      return user.favorites || [];
    }
    return this.getGuestFavorites();
  });

  public favoritesCount = computed(() => this.favorites().length);

  constructor(private toastService: ToastService) {}

  private loadUsers(): User[] {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading users:', e);
    }
    return INITIAL_USERS;
  }

  private saveUsers(users: User[]): void {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Error saving users:', e);
    }
  }

  private loadCurrentStoredUser(): User | null {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }

  private getGuestFavorites(): string[] {
    try {
      const stored = localStorage.getItem(GUEST_FAVORITES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  private saveGuestFavorites(favs: string[]): void {
    try {
      localStorage.setItem(GUEST_FAVORITES_KEY, JSON.stringify(favs));
    } catch (e) {
      console.error('Error saving guest favorites:', e);
    }
  }

  login(email: string, password: string): { success: boolean; message: string } {
    const cleanEmail = email.trim().toLowerCase();
    const user = this.usersSignal().find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return { success: false, message: 'Invalid credentials. User not found.' };
    }

    // Passwords for demo accounts: Admin123! or Traveler123! or minimum 6 chars
    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters.' };
    }

    const sessionUser: User = {
      ...user,
      token: `token_${user.id}_${Date.now()}`
    };

    this.currentUserSignal.set(sessionUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionUser));
    this.toastService.success(`Welcome back, ${sessionUser.name}!`);
    return { success: true, message: 'Login successful' };
  }

  register(name: string, email: string, role: UserRole = 'user'): { success: boolean; message: string } {
    const cleanEmail = email.trim().toLowerCase();
    const existing = this.usersSignal().find(u => u.email.toLowerCase() === cleanEmail);

    if (existing) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const newUser: User = {
      id: 'user_' + Date.now().toString(36),
      name: name.trim(),
      email: cleanEmail,
      role: role,
      favorites: [...this.getGuestFavorites()],
      token: 'jwt_' + Date.now().toString(36),
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updatedUsers = [...this.usersSignal(), newUser];
    this.usersSignal.set(updatedUsers);
    this.saveUsers(updatedUsers);

    this.currentUserSignal.set(newUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    this.toastService.success(`Registration successful! Welcome to Roamly, ${newUser.name}.`);
    return { success: true, message: 'Registration successful' };
  }

  logout(): void {
    const user = this.currentUserSignal();
    this.currentUserSignal.set(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    this.toastService.info('You have been logged out.');
  }

  toggleFavorite(destId: string): boolean {
    const user = this.currentUserSignal();

    if (user) {
      let favs = [...(user.favorites || [])];
      const idx = favs.indexOf(destId);
      let isNowFav = false;

      if (idx > -1) {
        favs.splice(idx, 1);
        isNowFav = false;
        this.toastService.info('Removed from your favorites');
      } else {
        favs.push(destId);
        isNowFav = true;
        this.toastService.success('Added to your favorites! ❤️');
      }

      const updatedUser: User = { ...user, favorites: favs };
      this.currentUserSignal.set(updatedUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));

      // Also update in all users list
      const users = this.usersSignal().map(u => u.id === user.id ? updatedUser : u);
      this.usersSignal.set(users);
      this.saveUsers(users);

      return isNowFav;
    } else {
      let favs = this.getGuestFavorites();
      const idx = favs.indexOf(destId);
      let isNowFav = false;

      if (idx > -1) {
        favs.splice(idx, 1);
        isNowFav = false;
        this.toastService.info('Removed from your favorites');
      } else {
        favs.push(destId);
        isNowFav = true;
        this.toastService.success('Added to your favorites! ❤️');
      }

      this.saveGuestFavorites(favs);
      return isNowFav;
    }
  }

  isFavorite(destId: string): boolean {
    return this.favorites().includes(destId);
  }

  // Admin user management
  getAllUsers(): User[] {
    return this.usersSignal();
  }

  updateUserRole(userId: string, newRole: UserRole): boolean {
    const current = this.usersSignal();
    const target = current.find(u => u.id === userId);
    if (!target) return false;

    const updatedUsers = current.map(u => u.id === userId ? { ...u, role: newRole } : u);
    this.usersSignal.set(updatedUsers);
    this.saveUsers(updatedUsers);

    // If current logged-in user changed their own role
    if (this.currentUserSignal()?.id === userId) {
      const updatedCurrent = { ...this.currentUserSignal()!, role: newRole };
      this.currentUserSignal.set(updatedCurrent);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedCurrent));
    }

    this.toastService.success(`Role updated for ${target.name}`);
    return true;
  }

  deleteUser(userId: string): boolean {
    if (this.currentUserSignal()?.id === userId) {
      this.toastService.error('Cannot delete the currently logged in account.');
      return false;
    }

    const updated = this.usersSignal().filter(u => u.id !== userId);
    this.usersSignal.set(updated);
    this.saveUsers(updated);
    this.toastService.info('User account deleted');
    return true;
  }
}
