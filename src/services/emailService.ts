import axios from 'axios';

interface EmailTemplate {
  subject: string;
  html: string;
}

interface BookingDetails {
  id: number;
  service: {
    name: string;
    type: string;
  };
  bookingDate: string;
  bookingTime: string;
  guests: number;
  totalAmount: number;
  user: {
    name: string;
    email: string;
  };
}

interface EmailOptions {
  to: string;
  bookingDetails: BookingDetails;
  paymentAmount?: number;
  currency?: string;
  receiptUrl?: string;
  retryUrl?: string;
  refundAmount?: number;
}

export class EmailService {
  private async sendEmail(to: string, template: EmailTemplate): Promise<void> {
    try {
      await axios.post('/api/email/send', {
        to,
        subject: template.subject,
        html: template.html
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendPaymentConfirmation(options: EmailOptions): Promise<void> {
    const template = this.getPaymentConfirmationTemplate(options);
    await this.sendEmail(options.to, template);
  }

  async sendBookingConfirmation(options: EmailOptions): Promise<void> {
    const template = this.getBookingConfirmationTemplate(options);
    await this.sendEmail(options.to, template);
  }

  async sendBookingReminder(options: EmailOptions): Promise<void> {
    const template = this.getBookingReminderTemplate(options);
    await this.sendEmail(options.to, template);
  }

  async sendPaymentFailure(options: EmailOptions): Promise<void> {
    const template = this.getPaymentFailureTemplate(options);
    await this.sendEmail(options.to, template);
  }

  async sendRefundNotification(options: EmailOptions): Promise<void> {
    const template = this.getRefundNotificationTemplate(options);
    await this.sendEmail(options.to, template);
  }

  private getPaymentConfirmationTemplate(options: EmailOptions): EmailTemplate {
    const { bookingDetails, paymentAmount, currency, receiptUrl } = options;
    
    return {
      subject: 'Payment Confirmation - Dubai Luxury Services',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px; background-color: #f8f8f8; }
            .content { padding: 20px; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            .button { display: inline-block; padding: 10px 20px; background-color: #d4a017; color: white; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Confirmation</h1>
            </div>
            <div class="content">
              <p>Dear ${bookingDetails.user.name},</p>
              <p>Thank you for your payment. Your booking has been confirmed.</p>
              
              <h2>Booking Details:</h2>
              <ul>
                <li>Booking ID: ${bookingDetails.id}</li>
                <li>Service: ${bookingDetails.service.name}</li>
                <li>Date: ${bookingDetails.bookingDate}</li>
                <li>Time: ${bookingDetails.bookingTime}</li>
                <li>Guests: ${bookingDetails.guests}</li>
              </ul>

              <h2>Payment Details:</h2>
              <ul>
                <li>Amount Paid: ${currency} ${paymentAmount?.toFixed(2)}</li>
              </ul>

              ${receiptUrl ? `
                <p>
                  <a href="${receiptUrl}" class="button">View Receipt</a>
                </p>
              ` : ''}

              <p>If you have any questions, please don't hesitate to contact us.</p>
            </div>
            <div class="footer">
              <p>Dubai Luxury Services</p>
              <p>This is an automated message, please do not reply directly to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  private getBookingConfirmationTemplate(options: EmailOptions): EmailTemplate {
    const { bookingDetails } = options;
    
    return {
      subject: 'Booking Confirmation - Dubai Luxury Services',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px; background-color: #f8f8f8; }
            .content { padding: 20px; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            .button { display: inline-block; padding: 10px 20px; background-color: #d4a017; color: white; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Confirmation</h1>
            </div>
            <div class="content">
              <p>Dear ${bookingDetails.user.name},</p>
              <p>Your booking has been confirmed. Here are the details:</p>
              
              <h2>Booking Details:</h2>
              <ul>
                <li>Booking ID: ${bookingDetails.id}</li>
                <li>Service: ${bookingDetails.service.name}</li>
                <li>Date: ${bookingDetails.bookingDate}</li>
                <li>Time: ${bookingDetails.bookingTime}</li>
                <li>Guests: ${bookingDetails.guests}</li>
                <li>Total Amount: ${bookingDetails.totalAmount}</li>
              </ul>

              <p>Please arrive 15 minutes before your scheduled time.</p>
              <p>If you need to make any changes to your booking, please contact us at least 24 hours in advance.</p>
            </div>
            <div class="footer">
              <p>Dubai Luxury Services</p>
              <p>This is an automated message, please do not reply directly to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  private getBookingReminderTemplate(options: EmailOptions): EmailTemplate {
    const { bookingDetails } = options;
    
    return {
      subject: 'Booking Reminder - Dubai Luxury Services',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px; background-color: #f8f8f8; }
            .content { padding: 20px; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Booking Reminder</h1>
            </div>
            <div class="content">
              <p>Dear ${bookingDetails.user.name},</p>
              <p>This is a reminder for your upcoming booking:</p>
              
              <h2>Booking Details:</h2>
              <ul>
                <li>Service: ${bookingDetails.service.name}</li>
                <li>Date: ${bookingDetails.bookingDate}</li>
                <li>Time: ${bookingDetails.bookingTime}</li>
                <li>Guests: ${bookingDetails.guests}</li>
              </ul>

              <p>Please remember to:</p>
              <ul>
                <li>Arrive 15 minutes before your scheduled time</li>
                <li>Bring a valid ID</li>
                <li>Have your booking confirmation handy</li>
              </ul>

              <p>We look forward to providing you with an exceptional experience.</p>
            </div>
            <div class="footer">
              <p>Dubai Luxury Services</p>
              <p>This is an automated message, please do not reply directly to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  private getPaymentFailureTemplate(options: EmailOptions): EmailTemplate {
    const { bookingDetails, retryUrl } = options;
    
    return {
      subject: 'Payment Failed - Dubai Luxury Services',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px; background-color: #f8f8f8; }
            .content { padding: 20px; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            .button { display: inline-block; padding: 10px 20px; background-color: #d4a017; color: white; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Failed</h1>
            </div>
            <div class="content">
              <p>Dear ${bookingDetails.user.name},</p>
              <p>We were unable to process your payment for the following booking:</p>
              
              <h2>Booking Details:</h2>
              <ul>
                <li>Booking ID: ${bookingDetails.id}</li>
                <li>Service: ${bookingDetails.service.name}</li>
                <li>Amount: ${bookingDetails.totalAmount}</li>
              </ul>

              <p>Please click the button below to try the payment again:</p>
              <p>
                <a href="${retryUrl}" class="button">Retry Payment</a>
              </p>

              <p>If you continue to experience issues, please contact our support team.</p>
            </div>
            <div class="footer">
              <p>Dubai Luxury Services</p>
              <p>This is an automated message, please do not reply directly to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }

  private getRefundNotificationTemplate(options: EmailOptions): EmailTemplate {
    const { bookingDetails, refundAmount, currency } = options;
    
    return {
      subject: 'Refund Processed - Dubai Luxury Services',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px; background-color: #f8f8f8; }
            .content { padding: 20px; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Refund Processed</h1>
            </div>
            <div class="content">
              <p>Dear ${bookingDetails.user.name},</p>
              <p>We have processed your refund for the following booking:</p>
              
              <h2>Refund Details:</h2>
              <ul>
                <li>Booking ID: ${bookingDetails.id}</li>
                <li>Service: ${bookingDetails.service.name}</li>
                <li>Refund Amount: ${currency} ${refundAmount?.toFixed(2)}</li>
              </ul>

              <p>The refund should appear in your account within 5-10 business days, depending on your bank.</p>
              <p>If you have any questions about the refund, please contact our support team.</p>
            </div>
            <div class="footer">
              <p>Dubai Luxury Services</p>
              <p>This is an automated message, please do not reply directly to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }
} 