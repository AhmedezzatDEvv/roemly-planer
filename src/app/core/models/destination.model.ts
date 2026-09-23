export type Region = 'Europe' | 'Asia' | 'Americas' | 'Africa' | 'Oceania' | 'all';
export type TravelCategory = 'Cultural' | 'Coastal' | 'Nature' | 'Adventure' | 'Luxury' | 'all';
export type BudgetLevel = '$' | '$$' | '$$$' | '$$$$' | 'all';
export type SortOption = 'recommended' | 'price-low' | 'price-high' | 'rating';

export interface Destination {
  id: string;
  name: string;
  country: string;
  region: 'Europe' | 'Asia' | 'Americas' | 'Africa' | 'Oceania';
  category: 'Cultural' | 'Coastal' | 'Nature' | 'Adventure' | 'Luxury';
  budgetLevel: '$' | '$$' | '$$$' | '$$$$';
  dailyCost: number;
  rating: number;
  reviewsCount: number;
  duration: string;
  image: string;
  description: string;
  highlights: string[];
  bestSeason: string;
  climate: string;
}

export interface DestinationFilterCriteria {
  searchQuery: string;
  region: string;
  category: string;
  budget: string;
  sortBy: SortOption;
}
