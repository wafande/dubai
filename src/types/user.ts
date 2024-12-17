export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  phone?: string;
  avatar?: string;
  preferences?: {
    notifications: boolean;
    newsletter: boolean;
    language: string;
  };
}

export interface UserProfile extends User {
  bookings: {
    total: number;
    upcoming: number;
    completed: number;
  };
  reviews: {
    total: number;
    averageRating: number;
  };
  favoriteDestinations?: string[];
} 