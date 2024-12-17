import express from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../db';
import { isAuthenticated } from '../middleware/auth';
import Stripe from 'stripe';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

// Create payment intent
router.post('/create', isAuthenticated, [
  body('amount').isFloat({ min: 0.01 }),
  body('currency').isString().isLength({ min: 3, max: 3 }),
  body('gatewayId').isString(),
  body('bookingId').isInt(),
  body('metadata').optional().isObject()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { amount, currency, gatewayId, bookingId, metadata } = req.body;

  try {
    // Get gateway configuration
    const [gateway] = await db.query(
      'SELECT * FROM payment_gateways WHERE id = ?',
      [gatewayId]
    );

    if (!gateway || !gateway.is_enabled) {
      return res.status(400).json({ error: 'Payment gateway not available' });
    }

    let paymentIntentId;
    let clientSecret;

    switch (gatewayId) {
      case 'stripe':
        const stripeIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: currency.toLowerCase(),
          metadata: {
            bookingId,
            ...metadata
          }
        });
        paymentIntentId = stripeIntent.id;
        clientSecret = stripeIntent.client_secret;
        break;

      case 'paypal':
        const paypalOrder = await createPayPalOrder(amount, currency, bookingId);
        paymentIntentId = paypalOrder.id;
        clientSecret = paypalOrder.client_secret;
        break;

      case 'square':
        const squarePayment = await createSquarePayment(amount, currency, bookingId);
        paymentIntentId = squarePayment.id;
        clientSecret = squarePayment.client_secret;
        break;

      case 'tap':
        const tapCharge = await createTapCharge(amount, currency, bookingId);
        paymentIntentId = tapCharge.id;
        clientSecret = tapCharge.client_secret;
        break;

      default:
        return res.status(400).json({ error: 'Invalid payment gateway' });
    }

    // Create payment record in database
    const [result] = await db.query(
      `INSERT INTO payment_transactions 
        (id, booking_id, gateway_id, amount, currency, status, metadata) 
       VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
      [paymentIntentId, bookingId, gatewayId, amount, currency, JSON.stringify(metadata)]
    );

    res.json({
      id: paymentIntentId,
      amount,
      currency,
      status: 'pending',
      clientSecret,
      gatewayId,
      bookingId,
      metadata
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// Confirm payment
router.post('/confirm', isAuthenticated, [
  body('paymentIntentId').isString(),
  body('status').isString()
], async (req, res) => {
  const { paymentIntentId, status } = req.body;

  try {
    await db.query(
      'UPDATE payment_transactions SET status = ? WHERE id = ?',
      [status, paymentIntentId]
    );

    const [payment] = await db.query(
      'SELECT * FROM payment_transactions WHERE id = ?',
      [paymentIntentId]
    );

    res.json(payment);
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// Generate receipt
router.post('/:paymentId/receipt', isAuthenticated, async (req, res) => {
  const { paymentId } = req.params;

  try {
    const [payment] = await db.query(
      `SELECT pt.*, b.*, u.*, s.*
       FROM payment_transactions pt
       JOIN bookings b ON pt.booking_id = b.id
       JOIN users u ON b.user_id = u.id
       JOIN services s ON b.service_id = s.id
       WHERE pt.id = ?`,
      [paymentId]
    );

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const receiptFileName = `receipt-${uuidv4()}.pdf`;
    const receiptPath = path.join(__dirname, '../public/receipts', receiptFileName);

    // Generate PDF receipt
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(receiptPath);

    doc.pipe(stream);

    // Add company logo
    doc.image(path.join(__dirname, '../public/images/logo.png'), 50, 45, { width: 150 });

    // Add receipt content
    doc.fontSize(20).text('Receipt', 50, 200);
    doc.fontSize(10).text(`Receipt Number: ${payment.id}`, 50, 230);
    doc.text(`Date: ${new Date(payment.created_at).toLocaleDateString()}`, 50, 250);

    doc.text('Bill To:', 50, 280);
    doc.text(payment.user_name, 50, 300);
    doc.text(payment.user_email, 50, 320);

    doc.text('Service Details:', 50, 360);
    doc.text(`Service: ${payment.service_name}`, 50, 380);
    doc.text(`Booking Date: ${new Date(payment.booking_date).toLocaleDateString()}`, 50, 400);
    doc.text(`Booking Time: ${payment.booking_time}`, 50, 420);
    doc.text(`Number of Guests: ${payment.guests}`, 50, 440);

    doc.text('Payment Details:', 50, 480);
    doc.text(`Amount: ${payment.currency} ${payment.amount.toFixed(2)}`, 50, 500);
    doc.text(`Payment Method: ${payment.payment_method || payment.gateway_id}`, 50, 520);
    doc.text(`Status: ${payment.status}`, 50, 540);

    doc.end();

    // Wait for the PDF to be written
    stream.on('finish', async () => {
      const receiptUrl = `/receipts/${receiptFileName}`;
      
      // Update payment record with receipt URL
      await db.query(
        'UPDATE payment_transactions SET payment_details = JSON_SET(payment_details, "$.receiptUrl", ?) WHERE id = ?',
        [receiptUrl, paymentId]
      );

      res.json({ receiptUrl });
    });
  } catch (error) {
    console.error('Error generating receipt:', error);
    res.status(500).json({ error: 'Failed to generate receipt' });
  }
});

// Stripe webhook handler
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
      case 'charge.refunded':
        await handleRefund(event.data.object);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook error' });
  }
});

// PayPal webhook handler
router.post('/webhook/paypal', async (req, res) => {
  try {
    const { event_type, resource } = req.body;

    switch (event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePayPalPaymentSuccess(resource);
        break;
      case 'PAYMENT.CAPTURE.DENIED':
        await handlePayPalPaymentFailure(resource);
        break;
      case 'REFUND.COMPLETED':
        await handlePayPalRefund(resource);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('PayPal webhook error:', error);
    res.status(400).json({ error: 'Webhook error' });
  }
});

// Helper functions for payment processing
async function createPayPalOrder(amount: number, currency: string, bookingId: number) {
  try {
    const response = await axios.post(
      'https://api-m.sandbox.paypal.com/v2/checkout/orders',
      {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency,
            value: amount.toString()
          },
          reference_id: bookingId.toString()
        }]
      },
      {
        auth: {
          username: process.env.PAYPAL_CLIENT_ID!,
          password: process.env.PAYPAL_SECRET!
        }
      }
    );

    return {
      id: response.data.id,
      client_secret: response.data.id // PayPal uses order ID as client secret
    };
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    throw new Error('Failed to create PayPal order');
  }
}

async function createSquarePayment(amount: number, currency: string, bookingId: number) {
  const { Client, Environment } = require('square');
  const client = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: Environment.Sandbox
  });

  try {
    const response = await client.paymentsApi.createPayment({
      sourceId: 'EXTERNAL', // Will be replaced with actual source ID from client
      amountMoney: {
        amount: Math.round(amount * 100),
        currency
      },
      idempotencyKey: uuidv4(),
      referenceId: bookingId.toString()
    });

    return {
      id: response.result.payment.id,
      client_secret: response.result.payment.id // Square uses payment ID as client secret
    };
  } catch (error) {
    console.error('Error creating Square payment:', error);
    throw new Error('Failed to create Square payment');
  }
}

async function createTapCharge(amount: number, currency: string, bookingId: number) {
  try {
    const response = await axios.post(
      'https://api.tap.company/v2/charges',
      {
        amount,
        currency,
        reference: { booking: bookingId },
        description: `Booking #${bookingId}`,
        source: { id: 'src_card' } // Will be replaced with actual source
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.TAP_SECRET_KEY}`
        }
      }
    );

    return {
      id: response.data.id,
      client_secret: response.data.id // Tap uses charge ID as client secret
    };
  } catch (error) {
    console.error('Error creating Tap charge:', error);
    throw new Error('Failed to create Tap charge');
  }
}

// Webhook event handlers
async function handlePaymentSuccess(paymentIntent: any) {
  await db.query(
    'UPDATE payment_transactions SET status = ?, payment_method = ? WHERE id = ?',
    ['completed', paymentIntent.payment_method_types[0], paymentIntent.id]
  );

  // Update booking status
  await db.query(
    'UPDATE bookings SET status = ? WHERE id = ?',
    ['confirmed', paymentIntent.metadata.bookingId]
  );
}

async function handlePaymentFailure(paymentIntent: any) {
  await db.query(
    'UPDATE payment_transactions SET status = ?, error_message = ? WHERE id = ?',
    ['failed', paymentIntent.last_payment_error?.message, paymentIntent.id]
  );
}

async function handleRefund(charge: any) {
  await db.query(
    'UPDATE payment_transactions SET status = ? WHERE id = ?',
    ['refunded', charge.payment_intent]
  );
}

async function handlePayPalPaymentSuccess(resource: any) {
  const orderId = resource.id;
  await db.query(
    'UPDATE payment_transactions SET status = ?, payment_method = ? WHERE id = ?',
    ['completed', 'paypal', orderId]
  );
}

async function handlePayPalPaymentFailure(resource: any) {
  const orderId = resource.id;
  await db.query(
    'UPDATE payment_transactions SET status = ?, error_message = ? WHERE id = ?',
    ['failed', resource.status_details?.reason, orderId]
  );
}

async function handlePayPalRefund(resource: any) {
  const orderId = resource.id;
  await db.query(
    'UPDATE payment_transactions SET status = ? WHERE id = ?',
    ['refunded', orderId]
  );
}

export default router; 