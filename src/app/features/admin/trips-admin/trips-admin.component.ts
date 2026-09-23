import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TripService } from '../../../core/services/trip.service';
import { ToastService } from '../../../core/services/toast.service';
import { SavedTrip } from '../../../core/models/trip.model';

@Component({
  selector: 'app-trips-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trips-admin.component.html',
  styleUrl: './trips-admin.component.css'
})
export class TripsAdminComponent {
  public tripService = inject(TripService);
  private toastService = inject(ToastService);

  public searchQuery: string = '';
  public statusFilter: string = 'all';

  public filteredTrips = computed(() => {
    let list = this.tripService.savedTrips();
    const q = this.searchQuery.trim().toLowerCase();

    if (q) {
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.destinationName.toLowerCase().includes(q) ||
        t.country.toLowerCase().includes(q)
      );
    }

    if (this.statusFilter !== 'all') {
      list = list.filter(t => t.status === this.statusFilter);
    }

    return list;
  });

  resetFilters(): void {
    this.searchQuery = '';
    this.statusFilter = 'all';
  }

  onStatusChange(tripId: string, newStatus: SavedTrip['status']): void {
    this.tripService.updateTripStatus(tripId, newStatus);
  }

  deleteTrip(tripId: string, title: string): void {
    if (confirm(`Are you sure you want to delete the trip "${title}"?`)) {
      this.tripService.deleteTrip(tripId);
    }
  }
}
