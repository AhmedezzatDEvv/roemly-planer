import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DestinationService } from '../../../core/services/destination.service';
import { DestinationCardComponent } from '../../../shared/components/destination-card/destination-card.component';
import { QuickViewModalComponent } from '../../../shared/components/quick-view-modal/quick-view-modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DestinationCardComponent, QuickViewModalComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private destService = inject(DestinationService);
  private router = inject(Router);

  public searchKeyword: string = '';
  public selectedRegion: string = 'all';
  public selectedCategory: string = 'all';

  public featuredDestinations = computed(() => {
    return this.destService.destinations().slice(0, 3);
  });

  onSearchSubmit(): void {
    this.destService.setFilter({
      searchQuery: this.searchKeyword,
      region: this.selectedRegion,
      category: this.selectedCategory
    });

    this.router.navigate(['/destinations'], {
      queryParams: {
        search: this.searchKeyword || undefined,
        region: this.selectedRegion !== 'all' ? this.selectedRegion : undefined,
        category: this.selectedCategory !== 'all' ? this.selectedCategory : undefined
      }
    });
  }
}
