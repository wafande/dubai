export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type VehicleType = 'helicopter' | 'yacht' | 'luxury-car' | 'private-jet';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface Booking {
  id: string;
  vehicleId: string;
  vehicleName: string;
  vehicleType: VehicleType;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalPrice: number;
  status: BookingStatus;
  specialRequests?: string;
  passengers: number;
  createdAt: string;
  updatedAt: string;
  paymentStatus: PaymentStatus;
  paymentId?: string;
}

export interface BookingFormData {
  vehicleId: string;
  vehicleName: string;
  vehicleType: VehicleType;
  date: string;
  startTime: string;
  duration: number;
  passengers: number;
  specialRequests?: string;
  userDetails: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

export interface AnalyticsDashboard {
  revenue: {
    total: number;
    byTourType: Record<VehicleType, number>;
    daily: number;
    weekly: number;
    monthly: number;
  };
  bookings: {
    total: number;
    completed: number;
    upcoming: number;
    cancelled: number;
    averageValue: number;
  };
  popularTimeSlots: Array<{
    time: string;
    count: number;
  }>;
  vehicleUtilization: Record<VehicleType, {
    totalHours: number;
    totalBookings: number;
    revenue: number;
  }>;
  customerStats: {
    total: number;
    new: number;
    returning: number;
    topCustomers: Array<{
      userId: string;
      name: string;
      totalBookings: number;
      totalSpent: number;
    }>;
  };
}

export interface TourPackage {
  id: string;
  name: string;
  description: string;
  type: VehicleType;
  duration: number;
  price: number;
  maxCapacity: number;
  includes: string[];
  images: string[];
  featured: boolean;
  rating: number;
  reviewCount: number;
}

export interface MediaItem {
  id: number;
  title: string;
  description?: string;
  file_url: string;
  file_type: 'image' | 'video' | 'document';
  file_size: number;
  dimensions?: {
    width: number;
    height: number;
  };
  created_at: string;
  updated_at: string;
  tags: string[];
  folder?: string;
  user_id: number;
}

export interface MediaFolder {
  id: number;
  name: string;
  parent_id?: number;
  created_at: string;
  updated_at: string;
  user_id: number;
}

export interface MediaUploadResponse {
  success: boolean;
  media: MediaItem;
  message?: string;
}

export interface MediaLibraryState {
  items: MediaItem[];
  folders: MediaFolder[];
  currentFolder?: number;
  loading: boolean;
  error?: string;
  selectedItems: number[];
}

export interface ScheduledContent {
  id: number;
  title: string;
  content_type: 'tour' | 'post' | 'promotion';
  content_id: number;
  status: 'scheduled' | 'published' | 'failed';
  publish_date: string;
  unpublish_date?: string;
  created_at: string;
  updated_at: string;
  user_id: number;
  metadata?: {
    visibility?: 'public' | 'private' | 'draft';
    priority?: 'high' | 'medium' | 'low';
    tags?: string[];
    seo?: {
      title?: string;
      description?: string;
      keywords?: string[];
    };
  };
}

export interface ScheduleContentRequest {
  title: string;
  content_type: 'tour' | 'post' | 'promotion';
  content_id: number;
  publish_date: string;
  unpublish_date?: string;
  metadata?: ScheduledContent['metadata'];
}