import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DestinationService } from '../../../core/services/destination.service';
import { TripService } from '../../../core/services/trip.service';
import { ContactService } from '../../../core/services/contact.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  public destService = inject(DestinationService);
  public tripService = inject(TripService);
  public contactService = inject(ContactService);
          
  public regionalStats = computed(() => {
    const list = this.destService.destinations();
    const total = list.length || 1;
    const counts: { [k: string]: number } = {};

    list.forEach(d => {
      counts[d.region] = (counts[d.region] || 0) + 1;
    });

    return Object.entries(counts).map(([region, count]) => ({
      region,
      count,
      percentage: Math.round((count / total) * 100)
    }));
  });

  public categoryStats = computed(() => {
    const list = this.destService.destinations();
    const counts: { [k: string]: number } = {};

    list.forEach(d => {
      counts[d.category] = (counts[d.category] || 0) + 1;
    });

    return Object.entries(counts).map(([category, count]) => ({
      category,
      count
    }));
  });
}