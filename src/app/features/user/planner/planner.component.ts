import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DestinationService } from '../../../core/services/destination.service';
import { TripService } from '../../../core/services/trip.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Destination } from '../../../core/models/destination.model';
import { TravelStyle, TripPlan } from '../../../core/models/trip.model';

@Component({
  selector: 'app-planner',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './planner.component.html',
  styleUrl: './planner.component.css'
})
export class PlannerComponent implements OnInit {
  public destService = inject(DestinationService);
  public tripService = inject(TripService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);

  public todayDate: string = new Date().toISOString().split('T')[0];
  public startDate: string = '';
  public endDate: string = '';
  public tripTitle: string = '';

  public selectedDestId = signal<string>('');
  public adults = signal<number>(2);
  public children = signal<number>(0);
  public selectedStyle = signal<TravelStyle>('standard');
  public selectedActivities = signal<string[]>(['sightseeing', 'dining']);

  public currentDestination = computed<Destination | undefined>(() => {
    return this.destService.destinations().find(d => d.id === this.selectedDestId());
  });

  public durationDays = computed<number>(() => {
    if (!this.startDate || !this.endDate) return 5;
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  });

  public totalTravelers = computed<number>(() => {
    return this.adults() + this.children();
  });

  public costBreakdown = computed(() => {
    const dest = this.currentDestination();
    const style = this.selectedStyle();
    const mult = style === 'budget' ? 0.7 : style === 'standard' ? 1.0 : 1.85;

    const plan: TripPlan = {
      destinationId: this.selectedDestId(),
      destinationName: dest?.name || 'Destination',
      country: dest?.country || '',
      dailyCost: dest?.dailyCost || 120,
      startDate: this.startDate,
      endDate: this.endDate,
      durationDays: this.durationDays(),
      adults: this.adults(),
      children: this.children(),
      style: style,
      styleMultiplier: mult,
      activities: this.selectedActivities()
    };

    return this.tripService.calculateTripCost(plan);
  });

  public generatedItinerary = computed(() => {
    const dest = this.currentDestination();
    if (!dest) return [];
    return this.tripService.generateItinerary(
      dest,
      this.durationDays(),
      this.selectedActivities(),
      this.selectedStyle()
    );
  });

  ngOnInit(): void {
    this.initDefaultDates();

    this.route.queryParams.subscribe(params => {
      if (params['dest']) {
        this.selectedDestId.set(params['dest']);
      } else if (this.destService.destinations().length > 0) {
        this.selectedDestId.set(this.destService.destinations()[0].id);
      }
    });
  }

  private initDefaultDates(): void {
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() + 7);
    const end = new Date();
    end.setDate(start.getDate() + 5);

    const format = (d: Date) => d.toISOString().split('T')[0];
    this.startDate = format(start);
    this.endDate = format(end);
  }

  onDestinationChange(destId: string): void {
    this.selectedDestId.set(destId);
  }

  onDateChange(): void {
    if (this.endDate < this.startDate) {
      this.endDate = this.startDate;
    }
  }

  adjustAdults(delta: number): void {
    const val = this.adults() + delta;
    if (val >= 1 && val <= 10) {
      this.adults.set(val);
    }
  }

  adjustChildren(delta: number): void {
    const val = this.children() + delta;
    if (val >= 0 && val <= 8) {
      this.children.set(val);
    }
  }

  setStyle(style: TravelStyle): void {
    this.selectedStyle.set(style);
  }

  hasActivity(act: string): boolean {
    return this.selectedActivities().includes(act);
  }

  toggleActivity(act: string): void {
    const current = this.selectedActivities();
    if (current.includes(act)) {
      if (current.length > 1) {
        this.selectedActivities.set(current.filter(a => a !== act));
      } else {
        this.toastService.info('Please keep at least one activity selected.');
      }
    } else {
      this.selectedActivities.set([...current, act]);
    }
  }

  saveTrip(): void {
    const dest = this.currentDestination();
    if (!dest) {
      this.toastService.error('Please select a destination first.');
      return;
    }

    const title = this.tripTitle.trim() || `${dest.name} Getaway`;
    const cost = this.costBreakdown();

    this.tripService.saveTrip({
      title,
      destinationId: dest.id,
      destinationName: dest.name,
      country: dest.country,
      startDate: this.startDate,
      endDate: this.endDate,
      durationDays: this.durationDays(),
      totalTravelers: this.totalTravelers(),
      adults: this.adults(),
      children: this.children(),
      style: this.selectedStyle(),
      activities: this.selectedActivities(),
      totalCost: `\$${cost.totalCost.toLocaleString()}`,
      perPersonCost: `\$${cost.perPersonCost.toLocaleString()}`,
      itinerary: this.generatedItinerary(),
      userId: this.authService.currentUser()?.id,
      userEmail: this.authService.currentUser()?.email
    });

    this.tripTitle = '';
  }

  deleteTrip(tripId: string): void {
    this.tripService.deleteTrip(tripId);
  }

  loadTripIntoPlanner(destId: string): void {
    this.selectedDestId.set(destId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.toastService.info('Loaded destination into planner.');
  }

  resetForm(): void {
    this.initDefaultDates();
    this.adults.set(2);
    this.children.set(0);
    this.selectedStyle.set('standard');
    this.selectedActivities.set(['sightseeing', 'dining']);
    this.tripTitle = '';
    this.toastService.info('Planner reset to defaults.');
  }

  printItinerary(): void {
    window.print();
  }
}
