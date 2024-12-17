export interface BookingFormData {
  serviceType: 'yacht' | 'aviation' | 'vehicle';
  date: string;
  time: string;
  duration: string;
  guests: number;
  additionalServices: string[];
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  service: 'yacht' | 'aviation' | 'vehicle' | 'general';
  preferredContact: 'email' | 'phone' | 'whatsapp';
} 