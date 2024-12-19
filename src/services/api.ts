import axios, { AxiosInstance } from 'axios';
import type { 
  Booking, 
  BookingFormData, 
  TourPackage,
  VehicleType 
} from '../types';

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
  service: VehicleType | 'general';
  preferredContact: 'email' | 'phone' | 'whatsapp';
}

interface EmailData {
  to: string;
  templateId: string;
  data: Record<string, any>;
}

interface FleetItem {
  id: string;
  name: string;
  type: VehicleType;
  description: string;
  price_per_hour: number;
  price_per_day: number;
  capacity: number;
  location: string;
  image_url: string;
  features: string[];
  specifications: Record<string, string>;
  is_active: boolean;
  maintenance_schedule?: {
    lastMaintenance: string;
    nextMaintenance: string;
    notes: string;
  };
}

class ApiService {
  private instance: AxiosInstance;
  private readonly TOKEN_KEY = 'dubai_charter_token';
  private readonly baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  constructor() {
    this.instance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptor for authentication
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(this.TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem(this.TOKEN_KEY);
          window.location.href = '/login';
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    try {
      const response = await this.instance.post('/api/auth/login', { email, password });
      if (response.data.token) {
        localStorage.setItem(this.TOKEN_KEY, response.data.token);
      }
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.instance.post('/api/auth/logout');
      localStorage.removeItem(this.TOKEN_KEY);
    } catch (error) {
      // Still remove token even if logout request fails
      localStorage.removeItem(this.TOKEN_KEY);
      throw this.handleError(error);
    }
  }

  // Booking endpoints
  async createBooking(data: BookingFormData): Promise<Booking> {
    try {
      const response = await this.instance.post('/bookings', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getBookings(filters?: { 
    status?: Booking['status']; 
    startDate?: string; 
    endDate?: string;
  }): Promise<Booking[]> {
    try {
      const response = await this.instance.get('/bookings', { params: filters });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getBookingById(id: string): Promise<Booking> {
    try {
      const response = await this.instance.get(`/bookings/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateBookingStatus(id: string, status: Booking['status']): Promise<Booking> {
    try {
      const response = await this.instance.patch(`/bookings/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Fleet management endpoints
  async getFleet(type?: VehicleType): Promise<FleetItem[]> {
    try {
      const response = await this.instance.get('/api/admin/fleet', { params: { type } });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addFleetItem(data: Omit<FleetItem, 'id'>): Promise<FleetItem> {
    try {
      const response = await this.instance.post('/api/admin/fleet', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateFleetItem(id: string, data: Partial<FleetItem>): Promise<FleetItem> {
    try {
      const response = await this.instance.put(`/api/admin/fleet/${id}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteFleetItem(id: string): Promise<void> {
    try {
      await this.instance.delete(`/api/admin/fleet/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Tour package endpoints
  async getTourPackages(): Promise<TourPackage[]> {
    try {
      const response = await this.instance.get('/tours');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createTourPackage(data: Omit<TourPackage, 'id'>): Promise<TourPackage> {
    try {
      const response = await this.instance.post('/admin/tours', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateTourPackage(id: string, data: Partial<TourPackage>): Promise<TourPackage> {
    try {
      const response = await this.instance.put(`/admin/tours/${id}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteTourPackage(id: string): Promise<void> {
    try {
      await this.instance.delete(`/admin/tours/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Contact form endpoint
  async submitContactForm(data: ContactFormData): Promise<void> {
    try {
      await this.instance.post('/contact', data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Email service endpoint
  async sendEmail(data: EmailData): Promise<void> {
    try {
      await this.instance.post('/email', data);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handling
  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      // Handle timeout error specifically
      if (error.code === 'ECONNABORTED') {
        console.error('Request timeout:', error);
        return new Error('The server is taking too long to respond. Please try again.');
      }
      // Handle Axios error with response
      if (error.response) {
        const message = error.response.data?.message || error.response.data?.error || 'An error occurred';
        console.error('API error:', message);
        return new Error(message);
      }
      // Handle Axios error without response (network error)
      console.error('Network error:', error.message);
      return new Error('Network error occurred. Please check your connection.');
    }
    // Handle non-Axios error
    if (error instanceof Error) {
      console.error('Unknown error:', error);
      return error;
    }
    console.error('Unexpected error:', error);
    return new Error('An unexpected error occurred');
  }
}

export const api = new ApiService();
export const apiService = api;
export type { 
  ContactFormData, 
  EmailData,
  FleetItem
};