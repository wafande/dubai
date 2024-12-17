interface TimeSlot {
  time: string;
  isAvailable: boolean;
  maxCapacity: number;
  currentBookings: number;
}

interface DayAvailability {
  [tourId: string]: {
    timeSlots: TimeSlot[];
    isFullyBooked: boolean;
  };
}

class AvailabilityService {
  private storageKey = 'dubai_charter_availability';

  private getAvailability(): Record<string, DayAvailability> {
    const availability = localStorage.getItem(this.storageKey);
    return availability ? JSON.parse(availability) : {};
  }

  private saveAvailability(availability: Record<string, DayAvailability>): void {
    localStorage.setItem(this.storageKey, JSON.stringify(availability));
  }

  private generateTimeSlots(tourType: 'helicopter' | 'yacht'): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const startHour = 8; // 8 AM
    const endHour = 18; // 6 PM
    const interval = tourType === 'helicopter' ? 30 : 120; // 30 mins for helicopter, 2 hours for yacht
    const maxCapacity = tourType === 'helicopter' ? 6 : 12;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        slots.push({
          time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          isAvailable: true,
          maxCapacity,
          currentBookings: 0,
        });
      }
    }

    return slots;
  }

  async getAvailabilityForDate(date: Date, tourId: string, tourType: 'helicopter' | 'yacht'): Promise<TimeSlot[]> {
    const availability = this.getAvailability();
    const dateKey = date.toISOString().split('T')[0];

    if (!availability[dateKey] || !availability[dateKey][tourId]) {
      // Initialize availability for this date and tour
      if (!availability[dateKey]) {
        availability[dateKey] = {};
      }
      
      availability[dateKey][tourId] = {
        timeSlots: this.generateTimeSlots(tourType),
        isFullyBooked: false,
      };
      
      this.saveAvailability(availability);
    }

    return availability[dateKey][tourId].timeSlots;
  }

  async checkAvailability(
    date: Date,
    tourId: string,
    time: string,
    partySize: number,
    tourType: 'helicopter' | 'yacht'
  ): Promise<boolean> {
    const timeSlots = await this.getAvailabilityForDate(date, tourId, tourType);
    const slot = timeSlots.find(s => s.time === time);

    if (!slot) return false;

    return (
      slot.isAvailable &&
      slot.currentBookings + partySize <= slot.maxCapacity
    );
  }

  async reserveSlot(
    date: Date,
    tourId: string,
    time: string,
    partySize: number,
    tourType: 'helicopter' | 'yacht'
  ): Promise<boolean> {
    const availability = this.getAvailability();
    const dateKey = date.toISOString().split('T')[0];

    if (!availability[dateKey]?.[tourId]) {
      return false;
    }

    const slot = availability[dateKey][tourId].timeSlots.find(
      s => s.time === time
    );

    if (!slot || !slot.isAvailable || slot.currentBookings + partySize > slot.maxCapacity) {
      return false;
    }

    slot.currentBookings += partySize;
    slot.isAvailable = slot.currentBookings < slot.maxCapacity;

    // Update fully booked status
    availability[dateKey][tourId].isFullyBooked = availability[dateKey][tourId].timeSlots.every(
      s => !s.isAvailable
    );

    this.saveAvailability(availability);
    return true;
  }

  async releaseSlot(
    date: Date,
    tourId: string,
    time: string,
    partySize: number
  ): Promise<boolean> {
    const availability = this.getAvailability();
    const dateKey = date.toISOString().split('T')[0];

    if (!availability[dateKey]?.[tourId]) {
      return false;
    }

    const slot = availability[dateKey][tourId].timeSlots.find(
      s => s.time === time
    );

    if (!slot) {
      return false;
    }

    slot.currentBookings = Math.max(0, slot.currentBookings - partySize);
    slot.isAvailable = true;

    availability[dateKey][tourId].isFullyBooked = false;

    this.saveAvailability(availability);
    return true;
  }

  async getBlockedDates(tourId: string): Promise<string[]> {
    const availability = this.getAvailability();
    return Object.entries(availability)
      .filter(([_, dayAvail]) => dayAvail[tourId]?.isFullyBooked)
      .map(([date]) => date);
  }
}

export const availabilityService = new AvailabilityService(); 