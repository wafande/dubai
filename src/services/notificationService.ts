import { toast } from 'react-hot-toast';
import { Booking } from './BookingService';
import { paymentService } from './PaymentService';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

export interface NotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  emailTemplates: EmailTemplate[];
  emailConfig: {
    fromName: string;
    fromEmail: string;
    replyTo: string;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPass: string;
    useTLS: boolean;
  };
  smsConfig: {
    provider: 'twilio' | 'messagebird';
    accountSid: string;
    authToken: string;
    fromNumber: string;
  };
}

const defaultSettings: NotificationSettings = {
  emailEnabled: true,
  smsEnabled: false,
  emailTemplates: [
    {
      id: 'booking-confirmation',
      name: 'Booking Confirmation',
      subject: 'Your booking confirmation - {{bookingId}}',
      body: `
Dear {{userName}},

Thank you for your booking with Dubai Luxury Rentals.

Booking Details:
- Booking ID: {{bookingId}}
- Vehicle: {{vehicleName}}
- Date: {{bookingDate}}
- Time: {{startTime}} - {{endTime}}
- Duration: {{duration}} hours
- Total Amount: {{totalAmount}}

Your booking is currently {{status}}.
{{#if isPending}}
Please complete the payment to confirm your booking.
Payment Link: {{paymentLink}}
{{/if}}

If you have any questions, please don't hesitate to contact us.

Best regards,
Dubai Luxury Rentals Team
      `.trim(),
      variables: [
        'userName',
        'bookingId',
        'vehicleName',
        'bookingDate',
        'startTime',
        'endTime',
        'duration',
        'totalAmount',
        'status',
        'isPending',
        'paymentLink',
      ],
    },
    {
      id: 'payment-receipt',
      name: 'Payment Receipt',
      subject: 'Payment Receipt - {{bookingId}}',
      body: `
Dear {{userName}},

Thank you for your payment. This email serves as your official receipt.

Receipt Details:
- Receipt Number: {{receiptNumber}}
- Booking ID: {{bookingId}}
- Payment Date: {{paymentDate}}
- Payment Method: {{paymentMethod}}
- Amount Paid: {{amountPaid}}

Booking Details:
- Vehicle: {{vehicleName}}
- Date: {{bookingDate}}
- Time: {{startTime}} - {{endTime}}
- Duration: {{duration}} hours

A PDF copy of your receipt is attached to this email.

Thank you for choosing Dubai Luxury Rentals.

Best regards,
Dubai Luxury Rentals Team
      `.trim(),
      variables: [
        'userName',
        'receiptNumber',
        'bookingId',
        'paymentDate',
        'paymentMethod',
        'amountPaid',
        'vehicleName',
        'bookingDate',
        'startTime',
        'endTime',
        'duration',
      ],
    },
  ],
  emailConfig: {
    fromName: 'Dubai Luxury Rentals',
    fromEmail: 'bookings@dubailuxuryrentals.com',
    replyTo: 'support@dubailuxuryrentals.com',
    smtpHost: 'smtp.example.com',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    useTLS: true,
  },
  smsConfig: {
    provider: 'twilio',
    accountSid: '',
    authToken: '',
    fromNumber: '',
  },
};

class NotificationService {
  private settingsKey = 'notification_settings';

  // Get notification settings
  getSettings(): NotificationSettings {
    const settings = localStorage.getItem(this.settingsKey);
    return settings ? JSON.parse(settings) : defaultSettings;
  }

  // Save notification settings
  async saveSettings(settings: NotificationSettings): Promise<void> {
    try {
      localStorage.setItem(this.settingsKey, JSON.stringify(settings));
    } catch (error) {
      throw new Error('Failed to save notification settings');
    }
  }

  // Send booking confirmation email
  async sendBookingConfirmation(booking: Booking): Promise<void> {
    const settings = this.getSettings();
    if (!settings.emailEnabled) {
      throw new Error('Email notifications are disabled');
    }

    try {
      const template = settings.emailTemplates.find(t => t.id === 'booking-confirmation');
      if (!template) {
        throw new Error('Booking confirmation template not found');
      }

      // Replace variables in template
      const variables = {
        userName: booking.userName,
        bookingId: booking.id,
        vehicleName: booking.vehicleName,
        bookingDate: new Date(booking.date).toLocaleDateString(),
        startTime: booking.startTime,
        endTime: booking.endTime,
        duration: booking.duration,
        totalAmount: paymentService.formatAmount(booking.totalPrice),
        status: booking.status,
        isPending: booking.status === 'pending',
        paymentLink: `https://dubailuxuryrentals.com/booking/payment/${booking.id}`,
      };

      const subject = this.replaceVariables(template.subject, variables);
      const body = this.replaceVariables(template.body, variables);

      // In a real app, this would send an actual email
      console.log('Sending booking confirmation email:', { subject, body });
      
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Booking confirmation email sent');
    } catch (error) {
      console.error('Failed to send booking confirmation:', error);
      throw new Error('Failed to send booking confirmation email');
    }
  }

  // Generate and send payment receipt
  async sendPaymentReceipt(
    booking: Booking,
    paymentMethod: string,
    receiptNumber: string
  ): Promise<void> {
    const settings = this.getSettings();
    if (!settings.emailEnabled) {
      throw new Error('Email notifications are disabled');
    }

    try {
      const template = settings.emailTemplates.find(t => t.id === 'payment-receipt');
      if (!template) {
        throw new Error('Payment receipt template not found');
      }

      // Generate PDF receipt
      const receiptPdf = await this.generateReceiptPdf(booking, paymentMethod, receiptNumber);

      // Replace variables in template
      const variables = {
        userName: booking.userName,
        receiptNumber,
        bookingId: booking.id,
        paymentDate: new Date().toLocaleDateString(),
        paymentMethod,
        amountPaid: paymentService.formatAmount(booking.totalPrice),
        vehicleName: booking.vehicleName,
        bookingDate: new Date(booking.date).toLocaleDateString(),
        startTime: booking.startTime,
        endTime: booking.endTime,
        duration: booking.duration,
      };

      const subject = this.replaceVariables(template.subject, variables);
      const body = this.replaceVariables(template.body, variables);

      // In a real app, this would send an actual email with PDF attachment
      console.log('Sending payment receipt email:', { subject, body, receiptPdf });
      
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Payment receipt sent');
    } catch (error) {
      console.error('Failed to send payment receipt:', error);
      throw new Error('Failed to send payment receipt');
    }
  }

  // Generate PDF receipt
  private async generateReceiptPdf(
    booking: Booking,
    paymentMethod: string,
    receiptNumber: string
  ): Promise<Blob> {
    // In a real app, this would use a PDF generation library like PDFKit or jsPDF
    // For now, we'll return a simple blob
    const receiptData = {
      receiptNumber,
      bookingId: booking.id,
      date: new Date().toISOString(),
      customerName: booking.userName,
      customerEmail: booking.userEmail,
      customerPhone: booking.userPhone,
      vehicleName: booking.vehicleName,
      bookingDate: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      duration: booking.duration,
      amount: booking.totalPrice,
      paymentMethod,
      status: 'Paid',
    };

    return new Blob([JSON.stringify(receiptData, null, 2)], {
      type: 'application/json',
    });
  }

  // Helper function to replace template variables
  private replaceVariables(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] !== undefined ? variables[key] : match;
    });
  }

  // Send SMS notification
  async sendSms(phoneNumber: string, message: string): Promise<void> {
    const settings = this.getSettings();
    if (!settings.smsEnabled) {
      throw new Error('SMS notifications are disabled');
    }

    try {
      // In a real app, this would use the configured SMS provider
      console.log('Sending SMS:', { phoneNumber, message });
      
      // Simulate SMS sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('SMS notification sent');
    } catch (error) {
      console.error('Failed to send SMS:', error);
      throw new Error('Failed to send SMS notification');
    }
  }
}

export const notificationService = new NotificationService(); 