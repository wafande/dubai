import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { EmailService } from './EmailService';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  gatewayId: string;
  bookingId: number;
  metadata: Record<string, any>;
  receiptUrl?: string;
}

export interface PaymentGatewayConfig {
  id: string;
  name: string;
  isEnabled: boolean;
  apiKey: string;
  secretKey?: string;
  webhookSecret?: string;
  testMode: boolean;
}

class PaymentService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  async createPayment(
    amount: number,
    currency: string,
    gatewayId: string,
    bookingId: number,
    metadata: Record<string, any> = {}
  ): Promise<PaymentIntent> {
    try {
      const response = await axios.post('/api/payments/create', {
        amount,
        currency,
        gatewayId,
        bookingId,
        metadata
      });

      const paymentIntent = response.data;
      await this.handlePaymentStatusChange(paymentIntent);
      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw new Error('Failed to create payment');
    }
  }

  async processStripePayment(
    paymentIntent: PaymentIntent,
    paymentMethodId: string
  ): Promise<PaymentIntent> {
    try {
      const stripe = await loadStripe(process.env.VITE_STRIPE_PUBLIC_KEY!);
      if (!stripe) throw new Error('Stripe not initialized');

      const { error, paymentIntent: updatedIntent } = await stripe.confirmCardPayment(
        paymentIntent.id,
        { payment_method: paymentMethodId }
      );

      if (error) {
        throw new Error(error.message);
      }

      const response = await axios.post('/api/payments/confirm', {
        paymentIntentId: updatedIntent.id,
        status: updatedIntent.status
      });

      await this.handlePaymentStatusChange(response.data);
      return response.data;
    } catch (error) {
      console.error('Error processing Stripe payment:', error);
      throw new Error('Failed to process payment');
    }
  }

  async processPayPalPayment(
    paymentIntent: PaymentIntent,
    paypalOrderId: string
  ): Promise<PaymentIntent> {
    try {
      const response = await axios.post('/api/payments/paypal/capture', {
        paymentIntentId: paymentIntent.id,
        paypalOrderId
      });

      await this.handlePaymentStatusChange(response.data);
      return response.data;
    } catch (error) {
      console.error('Error processing PayPal payment:', error);
      throw new Error('Failed to process payment');
    }
  }

  async processSquarePayment(
    paymentIntent: PaymentIntent,
    sourceId: string
  ): Promise<PaymentIntent> {
    try {
      const response = await axios.post('/api/payments/square/process', {
        paymentIntentId: paymentIntent.id,
        sourceId
      });

      await this.handlePaymentStatusChange(response.data);
      return response.data;
    } catch (error) {
      console.error('Error processing Square payment:', error);
      throw new Error('Failed to process payment');
    }
  }

  async processTapPayment(
    paymentIntent: PaymentIntent,
    tapToken: string
  ): Promise<PaymentIntent> {
    try {
      const response = await axios.post('/api/payments/tap/process', {
        paymentIntentId: paymentIntent.id,
        tapToken
      });

      await this.handlePaymentStatusChange(response.data);
      return response.data;
    } catch (error) {
      console.error('Error processing Tap payment:', error);
      throw new Error('Failed to process payment');
    }
  }

  async handlePaymentStatusChange(paymentIntent: PaymentIntent): Promise<void> {
    try {
      switch (paymentIntent.status) {
        case 'completed':
          await this.sendPaymentConfirmation(paymentIntent);
          await this.generateReceipt(paymentIntent);
          break;
        case 'failed':
          await this.sendPaymentFailureNotification(paymentIntent);
          break;
        case 'refunded':
          await this.sendRefundNotification(paymentIntent);
          break;
      }
    } catch (error) {
      console.error('Error handling payment status change:', error);
    }
  }

  private async sendPaymentConfirmation(paymentIntent: PaymentIntent): Promise<void> {
    const { bookingId, amount, currency } = paymentIntent;
    try {
      const bookingResponse = await axios.get(`/api/bookings/${bookingId}`);
      const booking = bookingResponse.data;

      await this.emailService.sendPaymentConfirmation({
        to: booking.user.email,
        bookingDetails: booking,
        paymentAmount: amount,
        currency,
        receiptUrl: paymentIntent.receiptUrl
      });
    } catch (error) {
      console.error('Error sending payment confirmation:', error);
    }
  }

  private async sendPaymentFailureNotification(paymentIntent: PaymentIntent): Promise<void> {
    const { bookingId } = paymentIntent;
    try {
      const bookingResponse = await axios.get(`/api/bookings/${bookingId}`);
      const booking = bookingResponse.data;

      await this.emailService.sendPaymentFailure({
        to: booking.user.email,
        bookingDetails: booking,
        retryUrl: `${window.location.origin}/bookings/${bookingId}/payment`
      });
    } catch (error) {
      console.error('Error sending payment failure notification:', error);
    }
  }

  private async sendRefundNotification(paymentIntent: PaymentIntent): Promise<void> {
    const { bookingId, amount, currency } = paymentIntent;
    try {
      const bookingResponse = await axios.get(`/api/bookings/${bookingId}`);
      const booking = bookingResponse.data;

      await this.emailService.sendRefundNotification({
        to: booking.user.email,
        bookingDetails: booking,
        refundAmount: amount,
        currency
      });
    } catch (error) {
      console.error('Error sending refund notification:', error);
    }
  }

  private async generateReceipt(paymentIntent: PaymentIntent): Promise<void> {
    try {
      const response = await axios.post(`/api/payments/${paymentIntent.id}/receipt`);
      const updatedIntent = { ...paymentIntent, receiptUrl: response.data.receiptUrl };
      await axios.put(`/api/payments/${paymentIntent.id}`, updatedIntent);
    } catch (error) {
      console.error('Error generating receipt:', error);
    }
  }

  async getPaymentStatus(paymentIntentId: string): Promise<PaymentIntent> {
    try {
      const response = await axios.get(`/api/payments/${paymentIntentId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw new Error('Failed to get payment status');
    }
  }
}

export const paymentService = new PaymentService(); 