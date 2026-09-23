import { Injectable, signal, computed } from '@angular/core';
import { SavedTrip, TripCostBreakdown, TripPlan, ItineraryDay, TravelStyle } from '../models/trip.model';
import { Destination } from '../models/destination.model';
import { ToastService } from './toast.service';

const SAVED_TRIPS_KEY = 'roamly_saved_trips';

const INITIAL_SAVED_TRIPS: SavedTrip[] = [
  {
    id: 'trip_demo_1',
    title: 'Kyoto Cultural Discovery',
    destinationId: 'kyoto-japan',
    destinationName: 'Kyoto',
    country: 'Japan',
    startDate: '2026-10-10',
    endDate: '2026-10-16',
    durationDays: 6,
    totalTravelers: 2,
    adults: 2,
    children: 0,
    style: 'standard',
    activities: ['sightseeing', 'dining'],
    totalCost: '$1,386',
    perPersonCost: '$693',
    createdAt: '2026-03-01',
    status: 'Confirmed'
  },
  {
    id: 'trip_demo_2',
    title: 'Banff Alpine Adventure',
    destinationId: 'banff-canada',
    destinationName: 'Banff National Park',
    country: 'Canada',
    startDate: '2026-07-04',
    endDate: '2026-07-11',
    durationDays: 7,
    totalTravelers: 4,
    adults: 2,
    children: 2,
    style: 'standard',
    activities: ['sightseeing', 'nature'],
    totalCost: '$3,185',
    perPersonCost: '$796',
    createdAt: '2026-03-05',
    status: 'Planned'
  }
];

@Injectable({
  providedIn: 'root'
})
export class TripService {
  private savedTripsSignal = signal<SavedTrip[]>(this.loadSavedTrips());
  public savedTrips = this.savedTripsSignal.asReadonly();
  public savedTripsCount = computed(() => this.savedTripsSignal().length);

  constructor(private toastService: ToastService) {}

  private loadSavedTrips(): SavedTrip[] {
    try {
      const stored = localStorage.getItem(SAVED_TRIPS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading saved trips:', e);
    }
    return INITIAL_SAVED_TRIPS;
  }

  private saveTrips(trips: SavedTrip[]): void {
    try {
      localStorage.setItem(SAVED_TRIPS_KEY, JSON.stringify(trips));
    } catch (e) {
      console.error('Error persisting trips:', e);
    }
  }

  // Exact math implementation from planner.js
  calculateTripCost(plan: TripPlan): TripCostBreakdown {
    const totalTravelers = plan.adults + plan.children;
    const baseRate = plan.dailyCost;
    const days = Math.max(1, plan.durationDays);
    const mult = plan.styleMultiplier;

    // Accommodation estimation (assuming double occupancy)
    const roomsNeeded = Math.ceil(totalTravelers / 2);
    const lodgingCost = Math.round(baseRate * 0.55 * days * mult * roomsNeeded);

    // Food and local transport estimation
    const foodAndTransportCost = Math.round(
      baseRate * 0.35 * days * mult * (plan.adults + plan.children * 0.6)
    );

    // Activities estimation
    const activityRatePerDay = plan.activities.length * 15;
    const activitiesCost = Math.round(
      activityRatePerDay * days * totalTravelers * (mult > 1 ? 1.3 : 1)
    );

    const totalCost = lodgingCost + foodAndTransportCost + activitiesCost;
    const perPersonCost = Math.round(totalCost / (totalTravelers || 1));

    return {
      durationDays: days,
      totalTravelers,
      style: plan.style,
      lodgingCost,
      foodAndTransportCost,
      activitiesCost,
      totalCost,
      perPersonCost
    };
  }

  // Dynamic itinerary generation from planner.js
  generateItinerary(destination: Destination, durationDays: number, activities: string[], style: TravelStyle): ItineraryDay[] {
    const highlights = destination.highlights && destination.highlights.length > 0
      ? destination.highlights
      : ['Historic landmark walk', 'Scenic photo spot', 'Local market tour'];

    const itinerary: ItineraryDay[] = [];
    const days = Math.max(1, durationDays);

    for (let day = 1; day <= days; day++) {
      let dayTheme = '';
      let dayActivities = '';

      if (day === 1) {
        dayTheme = `Arrival & Settling in ${destination.name}`;
        dayActivities = `Check into accommodation, take an evening stroll, and enjoy an authentic welcome dinner at a local bistro.`;
      } else if (day === days) {
        dayTheme = `Farewell & Departure`;
        dayActivities = `Morning souvenir shopping at artisan markets, pack bags, enjoy a final café espresso/tea, and head to transit.`;
      } else {
        const highlightItem = highlights[(day - 2) % highlights.length] || 'City center exploration';
        const activityTag = activities[(day - 2) % (activities.length || 1)] || 'sightseeing';
        const formattedTag = activityTag.charAt(0).toUpperCase() + activityTag.slice(1);

        dayTheme = `Day ${day}: ${formattedTag} & ${highlightItem.split(' ')[0]}`;
        dayActivities = `Experience ${highlightItem}. Spend afternoon exploring local culinary delights and scenic views matching your ${style} travel pace.`;
      }

      itinerary.push({ day, theme: dayTheme, activities: dayActivities });
    }

    return itinerary;
  }

  saveTrip(trip: Omit<SavedTrip, 'id' | 'createdAt' | 'status'> & { id?: string }): SavedTrip {
    const newTrip: SavedTrip = {
      ...trip,
      id: trip.id || 'trip_' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
      status: 'Planned'
    };

    const current = this.savedTripsSignal();
    const updated = [newTrip, ...current];
    this.savedTripsSignal.set(updated);
    this.saveTrips(updated);
    this.toastService.success(`Trip "${newTrip.title}" saved to your plans! 🎒`);
    return newTrip;
  }

  deleteTrip(tripId: string): boolean {
    const current = this.savedTripsSignal();
    const updated = current.filter(t => t.id !== tripId);

    if (updated.length === current.length) return false;

    this.savedTripsSignal.set(updated);
    this.saveTrips(updated);
    this.toastService.info('Trip removed from your saved plans.');
    return true;
  }

  updateTripStatus(tripId: string, status: SavedTrip['status']): boolean {
    const current = this.savedTripsSignal();
    const index = current.findIndex(t => t.id === tripId);
    if (index === -1) return false;

    const updatedTrip: SavedTrip = { ...current[index], status };
    const updated = [...current];
    updated[index] = updatedTrip;

    this.savedTripsSignal.set(updated);
    this.saveTrips(updated);
    this.toastService.success(`Trip status updated to "${status}".`);
    return true;
  }
}
