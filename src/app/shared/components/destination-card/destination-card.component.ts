import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Destination } from '../../../core/models/destination.model';
import { DestinationService } from '../../../core/services/destination.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-destination-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './destination-card.component.html',
  styleUrl: './destination-card.component.css'
})
export class DestinationCardComponent {
  @Input({ required: true }) destination!: Destination;

  private destService = inject(DestinationService);
  private authService = inject(AuthService);

  isFav(): boolean {
    return this.authService.isFavorite(this.destination.id);
  }

  toggleFav(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.authService.toggleFavorite(this.destination.id);
  }

  openQuickView(): void {
    this.destService.openQuickView(this.destination);
  }
}
