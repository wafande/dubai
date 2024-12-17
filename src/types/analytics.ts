export interface RevenueData {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
  byTourType: {
    helicopter: number;
    yacht: number;
  };
}

export interface BookingAnalytics {
  totalBookings: number;
  completedBookings: number;
  upcomingBookings: number;
  cancelledBookings: number;
  averageBookingValue: number;
  popularTimeSlots: {
    time: string;
    count: number;
  }[];
  bookingsByTourType: {
    helicopter: number;
    yacht: number;
  };
}

export interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  topCustomers: {
    userId: string;
    name: string;
    totalBookings: number;
    totalSpent: number;
  }[];
}

export interface AnalyticsDashboard {
  revenue: RevenueData;
  bookings: BookingAnalytics;
  customers: CustomerAnalytics;
  periodStart: string;
  periodEnd: string;
} 