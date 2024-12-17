import { bookingService } from './bookingService';
import type { AnalyticsDashboard, Booking, VehicleType } from '../types';

class AnalyticsService {
  private calculateDailyRevenue(bookings: Booking[]): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return bookings
      .filter(booking => {
        const bookingDate = new Date(booking.createdAt);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate.getTime() === today.getTime();
      })
      .reduce((sum, booking) => sum + booking.totalPrice, 0);
  }

  private calculateWeeklyRevenue(bookings: Booking[]): number {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    return bookings
      .filter(
        booking => new Date(booking.createdAt) >= weekStart
      )
      .reduce((sum, booking) => sum + booking.totalPrice, 0);
  }

  private calculateMonthlyRevenue(bookings: Booking[]): number {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    return bookings
      .filter(
        booking => new Date(booking.createdAt) >= monthStart
      )
      .reduce((sum, booking) => sum + booking.totalPrice, 0);
  }

  private calculatePopularTimeSlots(bookings: Booking[]): Array<{ time: string; count: number }> {
    const timeSlotCounts = bookings.reduce((acc, booking) => {
      const time = booking.startTime;
      acc[time] = (acc[time] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(timeSlotCounts)
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private calculateVehicleUtilization(bookings: Booking[]): Record<VehicleType, {
    totalHours: number;
    totalBookings: number;
    revenue: number;
  }> {
    const initialUtilization: Record<VehicleType, { totalHours: number; totalBookings: number; revenue: number }> = {
      helicopter: { totalHours: 0, totalBookings: 0, revenue: 0 },
      yacht: { totalHours: 0, totalBookings: 0, revenue: 0 },
      'luxury-car': { totalHours: 0, totalBookings: 0, revenue: 0 },
      'private-jet': { totalHours: 0, totalBookings: 0, revenue: 0 }
    };

    return bookings.reduce((acc, booking) => {
      acc[booking.vehicleType].totalHours += booking.duration;
      acc[booking.vehicleType].totalBookings += 1;
      acc[booking.vehicleType].revenue += booking.totalPrice;
      return acc;
    }, initialUtilization);
  }

  private calculateCustomerStats(bookings: Booking[]): AnalyticsDashboard['customerStats'] {
    const customerBookings = bookings.reduce((acc, booking) => {
      if (!acc[booking.userId]) {
        acc[booking.userId] = {
          name: booking.userName,
          bookings: [],
          totalSpent: 0
        };
      }
      acc[booking.userId].bookings.push(booking);
      acc[booking.userId].totalSpent += booking.totalPrice;
      return acc;
    }, {} as Record<string, { name: string; bookings: Booking[]; totalSpent: number }>);

    const customers = Object.entries(customerBookings);
    const returning = customers.filter(([_, data]) => data.bookings.length > 1).length;

    const topCustomers = customers
      .map(([userId, data]) => ({
        userId,
        name: data.name,
        totalBookings: data.bookings.length,
        totalSpent: data.totalSpent
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);

    return {
      total: customers.length,
      new: customers.length - returning,
      returning,
      topCustomers
    };
  }

  async getDashboardData(
    startDate: Date,
    endDate: Date
  ): Promise<AnalyticsDashboard> {
    const bookings = await bookingService.getAllBookings();
    const filteredBookings = bookings.filter(
      booking =>
        new Date(booking.createdAt) >= startDate &&
        new Date(booking.createdAt) <= endDate
    );

    const confirmedBookings = filteredBookings.filter(b => b.status === 'confirmed');
    const now = new Date();

    // Calculate revenue by tour type
    const revenueByTourType = confirmedBookings.reduce(
      (acc, booking) => {
        acc[booking.vehicleType] = (acc[booking.vehicleType] || 0) + booking.totalPrice;
        return acc;
      },
      {} as Record<VehicleType, number>
    );

    return {
      revenue: {
        total: confirmedBookings.reduce((sum, b) => sum + b.totalPrice, 0),
        byTourType: revenueByTourType,
        daily: this.calculateDailyRevenue(confirmedBookings),
        weekly: this.calculateWeeklyRevenue(confirmedBookings),
        monthly: this.calculateMonthlyRevenue(confirmedBookings)
      },
      bookings: {
        total: filteredBookings.length,
        completed: confirmedBookings.filter(b => new Date(b.date) < now).length,
        upcoming: confirmedBookings.filter(b => new Date(b.date) >= now).length,
        cancelled: filteredBookings.filter(b => b.status === 'cancelled').length,
        averageValue:
          confirmedBookings.length > 0
            ? confirmedBookings.reduce((sum, b) => sum + b.totalPrice, 0) / confirmedBookings.length
            : 0
      },
      popularTimeSlots: this.calculatePopularTimeSlots(confirmedBookings),
      vehicleUtilization: this.calculateVehicleUtilization(confirmedBookings),
      customerStats: this.calculateCustomerStats(confirmedBookings)
    };
  }

  async getRevenueReport(startDate: Date, endDate: Date): Promise<{
    daily: Array<{ date: string; revenue: number }>;
    weekly: Array<{ week: string; revenue: number }>;
    monthly: Array<{ month: string; revenue: number }>;
  }> {
    const bookings = await bookingService.getAllBookings();
    const confirmedBookings = bookings.filter(
      b => 
        b.status === 'confirmed' &&
        new Date(b.createdAt) >= startDate &&
        new Date(b.createdAt) <= endDate
    );

    // Daily revenue
    const dailyRevenue = confirmedBookings.reduce((acc, booking) => {
      const date = new Date(booking.createdAt).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + booking.totalPrice;
      return acc;
    }, {} as Record<string, number>);

    // Weekly revenue
    const weeklyRevenue = confirmedBookings.reduce((acc, booking) => {
      const date = new Date(booking.createdAt);
      const week = `${date.getFullYear()}-W${Math.ceil((date.getDate() + date.getDay()) / 7)}`;
      acc[week] = (acc[week] || 0) + booking.totalPrice;
      return acc;
    }, {} as Record<string, number>);

    // Monthly revenue
    const monthlyRevenue = confirmedBookings.reduce((acc, booking) => {
      const date = new Date(booking.createdAt);
      const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      acc[month] = (acc[month] || 0) + booking.totalPrice;
      return acc;
    }, {} as Record<string, number>);

    return {
      daily: Object.entries(dailyRevenue).map(([date, revenue]) => ({ date, revenue })),
      weekly: Object.entries(weeklyRevenue).map(([week, revenue]) => ({ week, revenue })),
      monthly: Object.entries(monthlyRevenue).map(([month, revenue]) => ({ month, revenue }))
    };
  }
}

export const analyticsService = new AnalyticsService(); 