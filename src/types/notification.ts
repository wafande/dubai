export type NotificationType = 
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'review_posted'
  | 'payment_received'
  | 'tour_reminder'
  | 'system_alert';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  userId: string;
  data?: {
    bookingId?: string;
    tourId?: string;
    reviewId?: string;
    paymentId?: string;
    [key: string]: any;
  };
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  types: {
    [K in NotificationType]: boolean;
  };
} 