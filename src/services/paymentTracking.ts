import { ApiError, ApiResponse } from './api';

export interface PaymentStatus {
  id: string;
  bookingId: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  currency: string;
  dueDate: string;
  status: 'pending' | 'partial' | 'completed' | 'overdue';
  nextPaymentAmount: number;
  paymentHistory: PaymentHistoryItem[];
}

export interface PaymentHistoryItem {
  id: string;
  date: string;
  amount: number;
  currency: string;
  method: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  transactionId: string;
}

export interface PaymentReminder {
  id: string;
  bookingId: string;
  dueDate: string;
  amount: number;
  currency: string;
  status: 'scheduled' | 'sent' | 'cancelled';
  type: 'deposit' | 'balance' | 'overdue';
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.dubai-luxury.com';

export const getPaymentStatus = async (bookingId: string): Promise<ApiResponse<PaymentStatus>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/status/${bookingId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch payment status');
    }
    return await response.json();
  } catch (error) {
    throw new ApiError(500, 'Failed to fetch payment status');
  }
};

export const getPaymentHistory = async (bookingId: string): Promise<ApiResponse<PaymentHistoryItem[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/history/${bookingId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch payment history');
    }
    return await response.json();
  } catch (error) {
    throw new ApiError(500, 'Failed to fetch payment history');
  }
};

export const schedulePaymentReminder = async (reminder: Omit<PaymentReminder, 'id' | 'status'>): Promise<ApiResponse<PaymentReminder>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/reminders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reminder),
    });
    if (!response.ok) {
      throw new Error('Failed to schedule payment reminder');
    }
    return await response.json();
  } catch (error) {
    throw new ApiError(500, 'Failed to schedule payment reminder');
  }
};

// Mock functions for development
export const mockPaymentStatus = async (bookingId: string): Promise<ApiResponse<PaymentStatus>> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    success: true,
    data: {
      id: Math.random().toString(36).substr(2, 9),
      bookingId,
      totalAmount: 10000,
      paidAmount: 5000,
      remainingAmount: 5000,
      currency: 'AED',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'partial',
      nextPaymentAmount: 5000,
      paymentHistory: [
        {
          id: Math.random().toString(36).substr(2, 9),
          date: new Date().toISOString(),
          amount: 5000,
          currency: 'AED',
          method: 'PayPal',
          status: 'completed',
          transactionId: Math.random().toString(36).substr(2, 9),
        },
      ],
    },
  };
};

export const mockPaymentHistory = async (bookingId: string): Promise<ApiResponse<PaymentHistoryItem[]>> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    success: true,
    data: [
      {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString(),
        amount: 5000,
        currency: 'AED',
        method: 'PayPal',
        status: 'completed',
        transactionId: Math.random().toString(36).substr(2, 9),
      },
    ],
  };
};

export const mockScheduleReminder = async (reminder: Omit<PaymentReminder, 'id' | 'status'>): Promise<ApiResponse<PaymentReminder>> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    success: true,
    data: {
      ...reminder,
      id: Math.random().toString(36).substr(2, 9),
      status: 'scheduled',
    },
  };
};

// Export a single object for easier imports
export const paymentTracking = {
  getPaymentStatus: import.meta.env.DEV ? mockPaymentStatus : getPaymentStatus,
  getPaymentHistory: import.meta.env.DEV ? mockPaymentHistory : getPaymentHistory,
  schedulePaymentReminder: import.meta.env.DEV ? mockScheduleReminder : schedulePaymentReminder,
}; 