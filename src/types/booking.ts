export interface Booking {
  id: string;
  tourId: string;
  tourName: string;
  tourType: 'helicopter' | 'yacht';
  userId: string;
  userName: string;
  userEmail: string;
  date: string;
  isPrivate: boolean;
  price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentId: string;
  createdAt: string;
}

export interface BookingFormData {
  date: Date;
  isPrivate: boolean;
  email: string;
  name: string;
  phone: string;
  specialRequests?: string;
}

export interface BookingStats {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  revenue: number;
} 