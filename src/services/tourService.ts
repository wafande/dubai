import { TourPackage } from '../types';
import { api } from './api';

export interface Tour {
  id: string;
  name: string;
  description: string;
  duration: string;
  sharingPrice: number;
  privatePrice: number;
  image: string;
  category: 'helicopter' | 'yacht' | 'luxury-car';
  location: string;
  maxCapacity: number;
  rating: number;
  totalReviews: number;
  availability: {
    dates: string[];
    slots: number;
  };
  features: string[];
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTourInput {
  name: string;
  description: string;
  duration: string;
  sharingPrice: number;
  privatePrice: number;
  image: string;
  category: Tour['category'];
  location: string;
  maxCapacity: number;
  features: string[];
  isActive: boolean;
}

export interface UpdateTourInput extends Partial<CreateTourInput> {
  id: string;
}

export interface TourFilters {
  category?: Tour['category'];
  priceRange?: [number, number];
  duration?: string;
  location?: string;
  availability?: boolean;
  searchQuery?: string;
}

class TourService {
  private readonly storageKey = 'dubai_charter_tours';

  private saveTours(tours: Tour[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(tours));
  }

  private getTours(): Tour[] {
    const tours = localStorage.getItem(this.storageKey);
    return tours ? JSON.parse(tours) : [];
  }

  async getAllTours(): Promise<Tour[]> {
    try {
      const response = await api.getTourPackages();
      const tours = response.map(this.mapTourPackageToTour);
      this.saveTours(tours);
      return tours;
    } catch (error) {
      console.error('Failed to fetch tours:', error);
      // Fallback to local storage if API fails
      return this.getTours();
    }
  }

  async getTourById(id: string): Promise<Tour | null> {
    const tours = await this.getAllTours();
    return tours.find(tour => tour.id === id) || null;
  }

  async createTour(input: CreateTourInput): Promise<Tour> {
    try {
      const tours = await this.getAllTours();
      const newTour: Tour = {
        id: Math.random().toString(36).substring(2, 9),
        ...input,
        rating: 0,
        totalReviews: 0,
        availability: {
          dates: [],
          slots: 0,
        },
        order: tours.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const tourPackage = await api.createTourPackage(this.mapTourToTourPackage(newTour));
      const createdTour = this.mapTourPackageToTour(tourPackage);
      
      tours.push(createdTour);
      this.saveTours(tours);
      
      return createdTour;
    } catch (error) {
      console.error('Failed to create tour:', error);
      throw error;
    }
  }

  async updateTour(input: UpdateTourInput): Promise<Tour> {
    try {
      const tours = await this.getAllTours();
      const index = tours.findIndex(tour => tour.id === input.id);
      
      if (index === -1) {
        throw new Error('Tour not found');
      }

      const updatedTour: Tour = {
        ...tours[index],
        ...input,
        updatedAt: new Date().toISOString(),
      };

      const tourPackage = await api.updateTourPackage(
        input.id,
        this.mapTourToTourPackage(updatedTour)
      );

      tours[index] = this.mapTourPackageToTour(tourPackage);
      this.saveTours(tours);

      return tours[index];
    } catch (error) {
      console.error('Failed to update tour:', error);
      throw error;
    }
  }

  async deleteTour(id: string): Promise<void> {
    try {
      await api.deleteTourPackage(id);
      const tours = await this.getAllTours();
      const filteredTours = tours.filter(tour => tour.id !== id);
      this.saveTours(filteredTours);
    } catch (error) {
      console.error('Failed to delete tour:', error);
      throw error;
    }
  }

  async updateTourOrder(tourId: string, newOrder: number): Promise<Tour[]> {
    const tours = await this.getAllTours();
    const tourIndex = tours.findIndex(t => t.id === tourId);
    
    if (tourIndex === -1) {
      throw new Error('Tour not found');
    }

    const tour = tours[tourIndex];
    const oldOrder = tour.order;

    // Update orders of affected tours
    tours.forEach(t => {
      if (oldOrder < newOrder) {
        if (t.order > oldOrder && t.order <= newOrder) {
          t.order--;
        }
      } else {
        if (t.order >= newOrder && t.order < oldOrder) {
          t.order++;
        }
      }
    });

    tour.order = newOrder;
    this.saveTours(tours);

    return tours;
  }

  async filterTours(filters: TourFilters): Promise<Tour[]> {
    const tours = await this.getAllTours();
    
    return tours.filter(tour => {
      if (filters.category && tour.category !== filters.category) return false;
      
      if (filters.priceRange) {
        const [min, max] = filters.priceRange;
        if (tour.sharingPrice < min || tour.sharingPrice > max) return false;
      }
      
      if (filters.duration && tour.duration !== filters.duration) return false;
      
      if (filters.location && !tour.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
      
      if (filters.availability && tour.availability.slots === 0) return false;
      
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          tour.name.toLowerCase().includes(query) ||
          tour.description.toLowerCase().includes(query) ||
          tour.location.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }

  private mapTourPackageToTour(pkg: TourPackage): Tour {
    return {
      id: pkg.id,
      name: pkg.name,
      description: pkg.description,
      duration: pkg.duration,
      sharingPrice: pkg.pricing.sharing,
      privatePrice: pkg.pricing.private,
      image: pkg.images[0],
      category: pkg.type as Tour['category'],
      location: pkg.location,
      maxCapacity: pkg.maxCapacity,
      rating: pkg.rating,
      totalReviews: pkg.reviewCount,
      availability: {
        dates: pkg.availableDates,
        slots: pkg.availableSlots,
      },
      features: pkg.features,
      isActive: pkg.status === 'active',
      order: pkg.displayOrder,
      createdAt: pkg.createdAt,
      updatedAt: pkg.updatedAt,
    };
  }

  private mapTourToTourPackage(tour: Tour): Omit<TourPackage, 'id'> {
    return {
      name: tour.name,
      description: tour.description,
      duration: tour.duration,
      pricing: {
        sharing: tour.sharingPrice,
        private: tour.privatePrice,
      },
      images: [tour.image],
      type: tour.category,
      location: tour.location,
      maxCapacity: tour.maxCapacity,
      rating: tour.rating,
      reviewCount: tour.totalReviews,
      availableDates: tour.availability.dates,
      availableSlots: tour.availability.slots,
      features: tour.features,
      status: tour.isActive ? 'active' : 'inactive',
      displayOrder: tour.order,
      createdAt: tour.createdAt,
      updatedAt: tour.updatedAt,
    };
  }
}

export const tourService = new TourService(); 