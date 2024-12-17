export const EMAIL_TEMPLATES = {
  // Contact Form Templates
  CONTACT_FORM_CONFIRMATION: 'contact-form-confirmation',
  CONTACT_FORM_NOTIFICATION: 'contact-form-notification',

  // Booking Templates
  BOOKING_CONFIRMATION: 'booking-confirmation',
  BOOKING_REMINDER: 'booking-reminder',
  BOOKING_MODIFICATION: 'booking-modification',
  BOOKING_CANCELLATION: 'booking-cancellation',
  
  // Payment Templates
  PAYMENT_CONFIRMATION: 'payment-confirmation',
  PAYMENT_REMINDER: 'payment-reminder',
  PAYMENT_REFUND: 'payment-refund',

  // Service-specific Templates
  YACHT_INSTRUCTIONS: 'yacht-instructions',
  AVIATION_INSTRUCTIONS: 'aviation-instructions',
  VEHICLE_INSTRUCTIONS: 'vehicle-instructions',
} as const;

export type EmailTemplateId = typeof EMAIL_TEMPLATES[keyof typeof EMAIL_TEMPLATES];

interface BaseEmailContext {
  name: string;
  email: string;
  date: string;
}

export interface ContactFormEmailContext extends BaseEmailContext {
  service: string;
  message: string;
  ticketId: string;
  estimatedResponse: string;
}

export interface BookingEmailContext extends BaseEmailContext {
  bookingId: string;
  serviceType: string;
  date: string;
  time: string;
  duration: string;
  guests: number;
  additionalServices: string[];
  totalAmount: number;
  currency: string;
  status: string;
}

export interface PaymentEmailContext extends BaseEmailContext {
  bookingId: string;
  transactionId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
}

export type EmailContext = 
  | ContactFormEmailContext 
  | BookingEmailContext 
  | PaymentEmailContext;

export const getEmailSubject = (templateId: EmailTemplateId, context: EmailContext): string => {
  switch (templateId) {
    case EMAIL_TEMPLATES.CONTACT_FORM_CONFIRMATION:
      return `Dubai Luxury - We've Received Your Message (Ticket #${(context as ContactFormEmailContext).ticketId})`;
    case EMAIL_TEMPLATES.BOOKING_CONFIRMATION:
      return `Dubai Luxury - Booking Confirmation #${(context as BookingEmailContext).bookingId}`;
    case EMAIL_TEMPLATES.PAYMENT_CONFIRMATION:
      return `Dubai Luxury - Payment Confirmation for Booking #${(context as PaymentEmailContext).bookingId}`;
    // Add more cases as needed
    default:
      return 'Dubai Luxury - Notification';
  }
}; 