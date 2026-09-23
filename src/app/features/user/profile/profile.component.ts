import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TripService } from '../../../core/services/trip.service';
import { DestinationService } from '../../../core/services/destination.service';
import { DestinationCardComponent } from '../../../shared/components/destination-card/destination-card.component';
import { QuickViewModalComponent } from '../../../shared/components/quick-view-modal/quick-view-modal.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, DestinationCardComponent, QuickViewModalComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  public authService = inject(AuthService);
  public tripService = inject(TripService);
  private destService = inject(DestinationService);
  private router = inject(Router);

  public favoriteDestinations = computed(() => {
    const favIds = this.authService.favorites();
    return this.destService.destinations().filter(d => favIds.includes(d.id));
  });

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
