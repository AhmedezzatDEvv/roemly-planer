import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DestinationService } from '../../../core/services/destination.service';
import { DestinationCardComponent } from '../../../shared/components/destination-card/destination-card.component';
import { QuickViewModalComponent } from '../../../shared/components/quick-view-modal/quick-view-modal.component';
import { SortOption } from '../../../core/models/destination.model';

@Component({
  selector: 'app-destinations',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DestinationCardComponent, QuickViewModalComponent],
  templateUrl: './destinations.component.html',
  styleUrl: './destinations.component.css'
})
export class DestinationsComponent implements OnInit {
  public destService = inject(DestinationService);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const updates: any = {};
      if (params['search']) updates.searchQuery = params['search'];
      if (params['region']) updates.region = params['region'];
      if (params['category']) updates.category = params['category'];
      if (params['budget']) updates.budget = params['budget'];
      if (Object.keys(updates).length > 0) {
        this.destService.setFilter(updates);
      }
    });
  }

  onSearchChange(query: string): void {
    this.destService.setFilter({ searchQuery: query });
  }

  setRegion(region: string): void {
    this.destService.setFilter({ region });
  }

  setCategory(category: string): void {
    this.destService.setFilter({ category });
  }

  setBudget(budget: string): void {
    this.destService.setFilter({ budget });
  }

  setSort(sortBy: SortOption): void {
    this.destService.setFilter({ sortBy });
  }

  resetFilters(): void {
    this.destService.resetFilters();
  }
}
