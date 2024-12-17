// Simulated API functions
import type { Booking, TourPackage } from '../types';

export async function createBooking(booking: Omit<Booking, 'id' | 'status' | 'createdAt'>): Promise<Booking> {
  // Simulate API call
  return {
    ...booking,
    id: Math.random().toString(36).substring(7),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
}

export async function updateBookingStatus(id: string, status: Booking['status']): Promise<void> {
  // Simulate API call
  console.log(`Updating booking ${id} to ${status}`);
}

export async function getTours(): Promise<TourPackage[]> {
  // Simulate API call
  return Promise.resolve([]);
}

export async function createTour(tour: Omit<TourPackage, 'id'>): Promise<TourPackage> {
  // Simulate API call
  return {
    ...tour,
    id: Math.random().toString(36).substring(7),
  };
}

export async function updateTour(id: string, tour: Partial<TourPackage>): Promise<void> {
  // Simulate API call
  console.log(`Updating tour ${id}`, tour);
}

export async function deleteTour(id: string): Promise<void> {
  // Simulate API call
  console.log(`Deleting tour ${id}`);
}