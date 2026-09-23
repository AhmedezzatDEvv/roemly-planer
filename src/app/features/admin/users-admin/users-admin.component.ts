import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-users-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-admin.component.html',
  styleUrl: './users-admin.component.css'
})
export class UsersAdminComponent {
  public authService = inject(AuthService);

  onRoleChange(userId: string, newRole: UserRole): void {
    this.authService.updateUserRole(userId, newRole);
  }

  deleteUser(userId: string, name: string): void {
    if (confirm(`Are you sure you want to delete account "${name}"?`)) {
      this.authService.deleteUser(userId);
    }
  }
}
