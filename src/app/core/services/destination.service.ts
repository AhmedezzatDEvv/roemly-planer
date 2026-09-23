import { Injectable, signal, computed } from '@angular/core';
import { Destination, DestinationFilterCriteria, Region, TravelCategory } from '../models/destination.model';

const INITIAL_DESTINATIONS: Destination[] = [
  {
    id: "kyoto-japan",
    name: "Kyoto",
    country: "Japan",
    region: "Asia",
    category: "Cultural",
    budgetLevel: "$$",
    dailyCost: 140,
    rating: 4.9,
    reviewsCount: 1420,
    duration: "5 - 7 Days",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80",
    description: "Immerse yourself in historic temples, serene bamboo groves, classical wooden machiya, and traditional tea ceremonies.",
    highlights: [
      "Fushimi Inari-Taisha thousands of torii gates",
      "Arashiyama Bamboo Forest & Monkey Park",
      "Kinkaku-ji (Golden Pavilion)",
      "Traditional Gion geisha district walking tour"
    ],
    bestSeason: "March - May (Cherry Blossoms) & Oct - Nov (Autumn)",
    climate: "Temperate with warm summers and mild winters"
  },
  {
    id: "amalfi-coast-italy",
    name: "Amalfi Coast",
    country: "Italy",
    region: "Europe",
    category: "Coastal",
    budgetLevel: "$$$",
    dailyCost: 230,
    rating: 4.8,
    reviewsCount: 980,
    duration: "4 - 6 Days",
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&auto=format&fit=crop&q=80",
    description: "Cliffside pastel villages overlooking the shimmering Tyrrhenian Sea, fragrant lemon groves, and world-class seafood.",
    highlights: [
      "Scenic ferry rides along Positano and Amalfi",
      "Hike the Path of the Gods (Sentiero degli Dei)",
      "Limoncello tasting in Ravello clifftop villas",
      "Private boat tour around Capri caves"
    ],
    bestSeason: "May - June & September - October",
    climate: "Mediterranean, warm sunny summers and gentle winters"
  },
  {
    id: "banff-canada",
    name: "Banff National Park",
    country: "Canada",
    region: "Americas",
    category: "Nature",
    budgetLevel: "$$",
    dailyCost: 160,
    rating: 4.9,
    reviewsCount: 1650,
    duration: "6 - 8 Days",
    image: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=800&auto=format&fit=crop&q=80",
    description: "Glacial turquoise lakes, rugged Rocky Mountain peaks, pine forests, and magnificent wildlife in the Canadian wilderness.",
    highlights: [
      "Canoeing on the turquoise waters of Lake Louise & Moraine Lake",
      "Scenic drive on the Icefields Parkway",
      "Sulfur Mountain Gondola panoramic view",
      "Johnston Canyon waterfall hike"
    ],
    bestSeason: "June - September (Hiking) or Dec - March (Skiing)",
    climate: "Alpine alpine-continental, crisp and invigorating"
  },
  {
    id: "santorini-greece",
    name: "Santorini",
    country: "Greece",
    region: "Europe",
    category: "Coastal",
    budgetLevel: "$$$",
    dailyCost: 210,
    rating: 4.8,
    reviewsCount: 1890,
    duration: "4 - 5 Days",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&auto=format&fit=crop&q=80",
    description: "Iconic whitewashed houses with blue domes, volcanic caldera sunsets, clifftop dining, and dramatic black sand beaches.",
    highlights: [
      "World-famous sunset in Oia village",
      "Caldera rim hike from Fira to Oia",
      "Red Beach & Perissa Black Sand Beach",
      "Catamaran sunset cruise with Greek dinner"
    ],
    bestSeason: "April - June & September - October",
    climate: "Warm dry Mediterranean climate"
  },
  {
    id: "bali-indonesia",
    name: "Bali",
    country: "Indonesia",
    region: "Asia",
    category: "Adventure",
    budgetLevel: "$",
    dailyCost: 85,
    rating: 4.7,
    reviewsCount: 2200,
    duration: "7 - 10 Days",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80",
    description: "Lush green rice terraces, sacred Hindu water temples, legendary surfing beaches, and rejuvenating yoga retreats.",
    highlights: [
      "Sunrise trek to Mount Batur volcanic caldera",
      "Tegallalang Rice Terraces in Ubud",
      "Uluwatu Temple cliffside Kecak dance performance",
      "Snorkeling with manta rays in Nusa Penida"
    ],
    bestSeason: "April - October (Dry Season)",
    climate: "Tropical with year-round warmth and sea breezes"
  },
  {
    id: "queenstown-new-zealand",
    name: "Queenstown",
    country: "New Zealand",
    region: "Oceania",
    category: "Adventure",
    budgetLevel: "$$$",
    dailyCost: 175,
    rating: 4.9,
    reviewsCount: 840,
    duration: "5 - 7 Days",
    image: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800&auto=format&fit=crop&q=80",
    description: "The adventure capital of the world set on the shores of Lake Wakatipu beneath the breathtaking Remarkables mountain range.",
    highlights: [
      "Milford Sound fjord day cruise and waterfalls",
      "Shotover River high-speed jet boating",
      "Skyline Gondola & Luge overlooking Lake Wakatipu",
      "Central Otago Pinot Noir wine trail"
    ],
    bestSeason: "December - February (Summer) or July - August (Snow)",
    climate: "Oceanic alpine climate with crisp clean air"
  },
  {
    id: "cape-town-south-africa",
    name: "Cape Town",
    country: "South Africa",
    region: "Africa",
    category: "Adventure",
    budgetLevel: "$$",
    dailyCost: 110,
    rating: 4.8,
    reviewsCount: 930,
    duration: "5 - 8 Days",
    image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&auto=format&fit=crop&q=80",
    description: "Where dramatic oceans meet Table Mountain, vibrant multicultural arts, world-class Cape winelands, and coastal penguins.",
    highlights: [
      "Cable car or hike up iconic Table Mountain",
      "Boulders Beach African penguin colony",
      "Scenic coastal drive around Chapman's Peak",
      "Stellenbosch and Franschhoek wine valleys"
    ],
    bestSeason: "November - March (Summer and warm sunshine)",
    climate: "Mediterranean-style dry warm summers"
  },
  {
    id: "cusco-machu-picchu-peru",
    name: "Machu Picchu & Cusco",
    country: "Peru",
    region: "Americas",
    category: "Cultural",
    budgetLevel: "$",
    dailyCost: 95,
    rating: 4.9,
    reviewsCount: 1540,
    duration: "6 - 9 Days",
    image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&auto=format&fit=crop&q=80",
    description: "Walk in the footsteps of the ancient Inca civilization amidst misty Andean peaks, sacred valleys, and cobblestone colonial plazas.",
    highlights: [
      "Sunrise guided exploration of Machu Picchu citadel",
      "Sacred Valley ruins of Pisac & Ollantaytambo",
      "Rainbow Mountain (Vinicunca) high-altitude trek",
      "San Pedro Market culinary and textile tour"
    ],
    bestSeason: "May - October (Dry sunny Andean winter)",
    climate: "Highland Andean climate, crisp nights and sunny days"
  },
  {
    id: "reykjavik-iceland",
    name: "Reykjavik & South Coast",
    country: "Iceland",
    region: "Europe",
    category: "Nature",
    budgetLevel: "$$$",
    dailyCost: 220,
    rating: 4.7,
    reviewsCount: 1120,
    duration: "5 - 7 Days",
    image: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&auto=format&fit=crop&q=80",
    description: "Land of fire and ice: geothermal hot springs, cascading waterfalls, black basalt beaches, glaciers, and dancing Northern Lights.",
    highlights: [
      "Golden Circle: Gullfoss, Geysir, and Thingvellir National Park",
      "Relaxation at Blue Lagoon or Sky Lagoon",
      "Reynisfjara black sand beach and Seljalandsfoss",
      "Aurora Borealis night hunting safari"
    ],
    bestSeason: "Sep - March (Aurora) or June - August (Midnight Sun)",
    climate: "Subpolar oceanic, dynamic weather"
  },
  {
    id: "marrakech-morocco",
    name: "Marrakech",
    country: "Morocco",
    region: "Africa",
    category: "Cultural",
    budgetLevel: "$",
    dailyCost: 75,
    rating: 4.6,
    reviewsCount: 890,
    duration: "4 - 6 Days",
    image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&auto=format&fit=crop&q=80",
    description: "A sensory feast of bustling souks, intricate riad courtyards, aromatic spice markets, and majestic Sahara desert gateway.",
    highlights: [
      "Wandering Jemaa el-Fnaa square at sunset",
      "Historic Bahia Palace and Saadian Tombs",
      "Jardin Majorelle and Yves Saint Laurent Museum",
      "Overnight Agafay desert glamping experience"
    ],
    bestSeason: "March - May & September - November",
    climate: "Semi-arid with warm sunny days"
  },
  {
    id: "bora-bora-french-polynesia",
    name: "Bora Bora",
    country: "French Polynesia",
    region: "Oceania",
    category: "Luxury",
    budgetLevel: "$$$$",
    dailyCost: 380,
    rating: 4.9,
    reviewsCount: 650,
    duration: "5 - 8 Days",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
    description: "The jewel of the South Pacific: legendary overwater bungalows, crystal lagoon shades of turquoise, and Mt. Otemanu backdrop.",
    highlights: [
      "Stay in an overwater bungalow with lagoon glass floor",
      "Snorkel with stingrays and reef sharks in crystal shallows",
      "Polynesian outrigger canoe excursion with motu picnic",
      "Romantic sunset catamaran cruise"
    ],
    bestSeason: "May - October (Dry season with mild trade winds)",
    climate: "Tropical maritime, warm and balmy"
  },
  {
    id: "swiss-alps-zermatt",
    name: "Zermatt & Swiss Alps",
    country: "Switzerland",
    region: "Europe",
    category: "Nature",
    budgetLevel: "$$$$",
    dailyCost: 260,
    rating: 4.9,
    reviewsCount: 1340,
    duration: "4 - 7 Days",
    image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&auto=format&fit=crop&q=80",
    description: "The pristine car-free alpine village situated beneath the majestic pyramid peak of the world-renowned Matterhorn.",
    highlights: [
      "Gornergrat cogwheel railway with Matterhorn panorama",
      "Matterhorn Glacier Paradise 360-degree viewing platform",
      "Five Lakes hiking trail passing Stellisee reflection",
      "Traditional Swiss cheese fondue evening"
    ],
    bestSeason: "Dec - April (Winter snow sports) or July - Sep (Hiking)",
    climate: "Alpine mountain climate with pure air"
  }
];

const STORAGE_KEY = 'roamly_destinations';

@Injectable({
  providedIn: 'root'
})
export class DestinationService {
  private destinationsSignal = signal<Destination[]>(this.loadInitialDestinations());

  public filterCriteria = signal<DestinationFilterCriteria>({
    searchQuery: '',
    region: 'all',
    category: 'all',
    budget: 'all',
    sortBy: 'recommended'
  });

  public quickViewDestination = signal<Destination | null>(null);

  public destinations = this.destinationsSignal.asReadonly();

  public filteredDestinations = computed(() => {
    let list = [...this.destinationsSignal()];
    const criteria = this.filterCriteria();
    const query = criteria.searchQuery.trim().toLowerCase();

    if (query) {
      list = list.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.country.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.highlights.some(h => h.toLowerCase().includes(query))
      );
    }

    if (criteria.region !== 'all') {
      list = list.filter(item => item.region.toLowerCase() === criteria.region.toLowerCase());
    }

    if (criteria.category !== 'all') {
      list = list.filter(item => item.category.toLowerCase() === criteria.category.toLowerCase());
    }

    if (criteria.budget !== 'all') {
      list = list.filter(item => item.budgetLevel === criteria.budget);
    }

    if (criteria.sortBy === 'price-low') {
      list.sort((a, b) => a.dailyCost - b.dailyCost);
    } else if (criteria.sortBy === 'price-high') {
      list.sort((a, b) => b.dailyCost - a.dailyCost);
    } else if (criteria.sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  });

  private loadInitialDestinations(): Destination[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load destinations from storage:', e);
    }
    return INITIAL_DESTINATIONS;
  }

  private saveToStorage(destinations: Destination[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(destinations));
    } catch (e) {
      console.error('Failed to persist destinations:', e);
    }
  }

  getDestinationById(id: string): Destination | undefined {
    return this.destinationsSignal().find(d => d.id === id);
  }

  setFilter(criteria: Partial<DestinationFilterCriteria>): void {
    this.filterCriteria.update(curr => ({ ...curr, ...criteria }));
  }

  resetFilters(): void {
    this.filterCriteria.set({
      searchQuery: '',
      region: 'all',
      category: 'all',
      budget: 'all',
      sortBy: 'recommended'
    });
  }

  openQuickView(dest: Destination): void {
    this.quickViewDestination.set(dest);
  }

  closeQuickView(): void {
    this.quickViewDestination.set(null);
  }

  // Admin CRUD methods
  addDestination(destination: Omit<Destination, 'id'> & { id?: string }): Destination {
    const id = destination.id || destination.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36);
    const newDest: Destination = {
      ...destination,
      id
    };

    const updatedList = [newDest, ...this.destinationsSignal()];
    this.destinationsSignal.set(updatedList);
    this.saveToStorage(updatedList);
    return newDest;
  }
// نعديل الرحلات الموجوده

  updateDestination(id: string, changes: Partial<Destination>): Destination | null {
    const current = this.destinationsSignal();
    const index = current.findIndex(d => d.id === id);
    if (index === -1) return null;

    const updated: Destination = { ...current[index], ...changes };
    const updatedList = [...current];
    updatedList[index] = updated;

    this.destinationsSignal.set(updatedList);
    this.saveToStorage(updatedList);
    return updated;
  }
// حذف الرحلات الموجوده
  deleteDestination(id: string): boolean {
    const current = this.destinationsSignal();
    const updatedList = current.filter(d => d.id !== id);
    if (updatedList.length === current.length) return false;

    this.destinationsSignal.set(updatedList);
    this.saveToStorage(updatedList);
    return true;
  }
}
