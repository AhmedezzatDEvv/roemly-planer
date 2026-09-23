export type TravelStyle = 'budget' | 'standard' | 'luxury';

export interface ItineraryDay {
  day: number;
  theme: string;
  activities: string;
}

export interface TripPlan {
  destinationId: string;
  destinationName: string;
  country: string;
  dailyCost: number;
  startDate: string;
  endDate: string;
  durationDays: number;
  adults: number;
  children: number;
  style: TravelStyle;
  styleMultiplier: number;
  activities: string[];
  notes?: string;
}

export interface TripCostBreakdown {
  durationDays: number;
  totalTravelers: number;
  style: string;
  lodgingCost: number;
  foodAndTransportCost: number;
  activitiesCost: number;
  totalCost: number;
  perPersonCost: number;
}

export interface SavedTrip {
  id: string;
  userId?: string;
  userEmail?: string;
  title: string;
  destinationId: string;
  destinationName: string;
  country: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  totalTravelers: number;
  adults: number;
  children: number;
  style: TravelStyle;
  activities: string[];
  totalCost: string;
  perPersonCost?: string;
  itinerary?: ItineraryDay[];
  createdAt: string;
  status: 'Planned' | 'Confirmed' | 'Completed' | 'Cancelled';
}
