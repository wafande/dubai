import { toast } from 'react-hot-toast';
import { availabilityService } from './availabilityService';
import { notificationService } from './notificationService';
import { api } from './api';
import type { Booking, BookingFormData } from '../types';

class BookingService {
  private storageKey = 'dubai_luxury_bookings';

  private getBookings(): Booking[] {
    const bookings = localStorage.getItem(this.storageKey);
    return bookings ? JSON.parse(bookings) : [];
  }

  private saveBookings(bookings: Booking[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(bookings));
  }

  async createBooking(formData: BookingFormData): Promise<Booking> {
    try {
      // Check availability first
      const isAvailable = await availabilityService.checkAvailability(
        new Date(formData.date),
        formData.vehicleId,
        formData.startTime,
        formData.passengers,
        formData.vehicleType
      );

      if (!isAvailable) {
        throw new Error('Selected time slot is not available');
      }

      // Create booking
      const booking: Booking = {
        id: Math.random().toString(36).substring(7),
        vehicleId: formData.vehicleId,
        vehicleName: formData.vehicleName,
        vehicleType: formData.vehicleType,
        userId: formData.userDetails.id,
        userName: formData.userDetails.name,
        userEmail: formData.userDetails.email,
        userPhone: formData.userDetails.phone,
        date: formData.date,
        startTime: formData.startTime,
        endTime: this.calculateEndTime(formData.startTime, formData.duration),
        duration: formData.duration,
        totalPrice: this.calculateTotalPrice(formData),
        status: 'pending',
        specialRequests: formData.specialRequests,
        passengers: formData.passengers,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        paymentStatus: 'pending'
      };

      // Save booking
      const bookings = this.getBookings();
      bookings.push(booking);
      this.saveBookings(bookings);

      // Reserve the time slot
      await availabilityService.reserveSlot(
        new Date(booking.date),
        booking.vehicleId,
        booking.startTime,
        booking.passengers,
        booking.vehicleType
      );

      // Send confirmation email
      await notificationService.sendBookingConfirmation(booking);

      toast.success('Booking created successfully');
      return booking;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create booking');
      throw error;
    }
  }

  async getBookingById(id: string): Promise<Booking | null> {
    const bookings = this.getBookings();
    return bookings.find(booking => booking.id === id) || null;
  }

  async getAllBookings(): Promise<Booking[]> {
    return this.getBookings();
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    const bookings = this.getBookings();
    return bookings.filter(booking => booking.userId === userId);
  }

  async updateBookingStatus(
    bookingId: string, 
    status: Booking['status'],
    paymentStatus?: Booking['paymentStatus']
  ): Promise<Booking> {
    const bookings = this.getBookings();
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);
    
    if (bookingIndex === -1) {
      throw new Error('Booking not found');
    }

    const updatedBooking = {
      ...bookings[bookingIndex],
      status,
      paymentStatus: paymentStatus || bookings[bookingIndex].paymentStatus,
      updatedAt: new Date().toISOString()
    };

    bookings[bookingIndex] = updatedBooking;
    this.saveBookings(bookings);

    // If booking is cancelled, release the time slot
    if (status === 'cancelled') {
      await availabilityService.releaseSlot(
        new Date(updatedBooking.date),
        updatedBooking.vehicleId,
        updatedBooking.startTime,
        updatedBooking.passengers
      );
    }

    return updatedBooking;
  }

  private calculateEndTime(startTime: string, duration: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endDate = new Date();
    endDate.setHours(hours, minutes);
    endDate.setHours(endDate.getHours() + duration);
    return endDate.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private calculateTotalPrice(formData: BookingFormData): number {
    // This would typically fetch pricing from the API
    // For now, using a simplified calculation
    const basePrice = formData.vehicleType === 'helicopter' ? 5000 : 3000;
    return basePrice * formData.duration;
  }

  async getBookingStats(startDate: Date, endDate: Date): Promise<{
    total: number;
    confirmed: number;
    pending: number;
    cancelled: number;
    revenue: number;
  }> {
    const bookings = this.getBookings().filter(
      booking =>
        new Date(booking.createdAt) >= startDate &&
        new Date(booking.createdAt) <= endDate
    );

    return {
      total: bookings.length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      pending: bookings.filter(b => b.status === 'pending').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      revenue: bookings
        .filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + b.totalPrice, 0)
    };
  }
}

export const bookingService = new BookingService(); 