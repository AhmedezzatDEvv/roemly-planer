import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DestinationService } from '../../../core/services/destination.service';
import { ToastService } from '../../../core/services/toast.service';
import { Destination } from '../../../core/models/destination.model';

@Component({
  selector: 'app-destinations-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './destinations-admin.component.html',
  styleUrl: './destinations-admin.component.css'
})
export class DestinationsAdminComponent {
  public destService = inject(DestinationService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);

  public searchQuery: string = '';
  public selectedRegion: string = 'all';
  public selectedCategory: string = 'all';

  public modalOpen = signal<boolean>(false);
  public editingId = signal<string | null>(null);

  public destForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    country: ['', [Validators.required]],
    region: ['Europe', [Validators.required]],
    category: ['Cultural', [Validators.required]],
    budgetLevel: ['$$', [Validators.required]],
    dailyCost: [150, [Validators.required, Validators.min(10)]],
    rating: [4.8, [Validators.required, Validators.min(1), Validators.max(5)]],
    reviewsCount: [500, [Validators.min(0)]],
    duration: ['5 - 7 Days', [Validators.required]],
    image: ['', [Validators.required]],
    description: ['', [Validators.required, Validators.minLength(20)]],
    highlights: ['', [Validators.required]],
    bestSeason: ['', [Validators.required]],
    climate: ['', [Validators.required]]
  });

  public filteredDestinations = computed(() => {
    let list = this.destService.destinations();
    const q = this.searchQuery.trim().toLowerCase();

    if (q) {
      list = list.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.country.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q)
      );
    }

    if (this.selectedRegion !== 'all') {
      list = list.filter(d => d.region.toLowerCase() === this.selectedRegion.toLowerCase());
    }

    if (this.selectedCategory !== 'all') {
      list = list.filter(d => d.category.toLowerCase() === this.selectedCategory.toLowerCase());
    }

    return list;
  });

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedRegion = 'all';
    this.selectedCategory = 'all';
  }

  openAddModal(): void {
    this.editingId.set(null);
    this.destForm.reset({
      name: '',
      country: '',
      region: 'Europe',
      category: 'Cultural',
      budgetLevel: '$$',
      dailyCost: 150,
      rating: 4.8,
      reviewsCount: 200,
      duration: '5 - 7 Days',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
      description: '',
      highlights: 'Scenic city tour; Historic monuments; Local food tasting',
      bestSeason: 'Spring & Autumn',
      climate: 'Temperate and pleasant'
    });
    this.modalOpen.set(true);
  }

  openEditModal(dest: Destination): void {
    this.editingId.set(dest.id);
    this.destForm.patchValue({
      name: dest.name,
      country: dest.country,
      region: dest.region,
      category: dest.category,
      budgetLevel: dest.budgetLevel,
      dailyCost: dest.dailyCost,
      rating: dest.rating,
      reviewsCount: dest.reviewsCount,
      duration: dest.duration,
      image: dest.image,
      description: dest.description,
      highlights: dest.highlights.join('; '),
      bestSeason: dest.bestSeason,
      climate: dest.climate
    });
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.editingId.set(null);
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal();
    }
  }

  onFormSubmit(): void {
    if (this.destForm.invalid) {
      this.destForm.markAllAsTouched();
      this.toastService.error('Please fill out all required fields properly.');
      return;
    }

    const val = this.destForm.value;
    const highlightsArr = val.highlights
      ? val.highlights.split(';').map((s: string) => s.trim()).filter(Boolean)
      : ['Top scenic attractions'];

    if (this.editingId()) {
      // Update
      this.destService.updateDestination(this.editingId()!, {
        ...val,
        highlights: highlightsArr
      });
      this.toastService.success(`Destination "${val.name}" updated successfully!`);
    } else {
      // Add
      this.destService.addDestination({
        ...val,
        highlights: highlightsArr
      });
      this.toastService.success(`Destination "${val.name}" created successfully!`);
    }

    this.closeModal();
  }

  deleteDestination(id: string, name: string): void {
    if (confirm(`Are you sure you want to delete "${name}" from the catalog? This cannot be undone.`)) {
      this.destService.deleteDestination(id);
      this.toastService.info(`Destination "${name}" deleted.`);
    }
  }
}
