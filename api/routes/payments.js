const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const pool = require('../config/database');

// Helper function to simulate payment processing
async function simulatePaymentProcessing(paymentId) {
  // In a real application, this would integrate with a payment gateway
  // For now, we'll just simulate a successful payment after a short delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  await pool.query(
    `UPDATE payments SET 
      status = 'completed',
      transaction_id = ?,
      completed_at = NOW(),
      updated_at = NOW()
    WHERE id = ?`,
    [`sim_${Date.now()}`, paymentId]
  );
}

// Get all payments (admin only)
router.get('/payments', auth, async (req, res) => {
  try {
    const [payments] = await pool.query(
      `SELECT p.*, b.user_id, u.username 
       FROM payments p 
       JOIN bookings b ON p.booking_id = b.id 
       JOIN users u ON b.user_id = u.id 
       ORDER BY p.created_at DESC`
    );

    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Get payment status for a booking
router.get('/bookings/:bookingId/payment', auth, async (req, res) => {
  try {
    const [payments] = await pool.query(
      `SELECT * FROM payments WHERE booking_id = ?`,
      [req.params.bookingId]
    );

    if (payments.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(payments[0]);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ error: 'Failed to fetch payment status' });
  }
});

// Create a new payment for a booking
router.post('/bookings/:bookingId/payment', auth, async (req, res) => {
  try {
    const { amount, currency, paymentMethod } = req.body;
    const bookingId = req.params.bookingId;

    // Validate booking exists and belongs to user
    const [bookings] = await pool.query(
      'SELECT * FROM bookings WHERE id = ? AND user_id = ?',
      [bookingId, req.user.id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ error: 'Booking not found or unauthorized' });
    }

    // Check if payment already exists
    const [existingPayments] = await pool.query(
      'SELECT * FROM payments WHERE booking_id = ?',
      [bookingId]
    );

    if (existingPayments.length > 0) {
      return res.status(400).json({ error: 'Payment already exists for this booking' });
    }

    // Create payment record
    const [result] = await pool.query(
      `INSERT INTO payments (
        booking_id, amount, currency, status,
        payment_method, created_at, updated_at
      ) VALUES (?, ?, ?, 'pending', ?, NOW(), NOW())`,
      [bookingId, amount, currency, paymentMethod]
    );

    // Simulate payment processing
    await simulatePaymentProcessing(result.insertId);

    const [newPayment] = await pool.query(
      'SELECT * FROM payments WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newPayment[0]);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// Process refund for a booking
router.post('/bookings/:bookingId/refund', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    const bookingId = req.params.bookingId;

    // Validate booking exists and belongs to user
    const [bookings] = await pool.query(
      'SELECT * FROM bookings WHERE id = ? AND user_id = ?',
      [bookingId, req.user.id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ error: 'Booking not found or unauthorized' });
    }

    // Get payment record
    const [payments] = await pool.query(
      'SELECT * FROM payments WHERE booking_id = ? AND status = ?',
      [bookingId, 'completed']
    );

    if (payments.length === 0) {
      return res.status(400).json({ error: 'No completed payment found for this booking' });
    }

    const payment = payments[0];

    // Process refund
    await pool.query(
      `UPDATE payments SET 
        status = 'refunded',
        refund_reason = ?,
        refunded_at = NOW(),
        updated_at = NOW()
      WHERE id = ?`,
      [reason, payment.id]
    );

    // Update booking status
    await pool.query(
      `UPDATE bookings SET 
        status = 'refunded',
        updated_at = NOW()
      WHERE id = ?`,
      [bookingId]
    );

    const [updatedPayment] = await pool.query(
      'SELECT * FROM payments WHERE id = ?',
      [payment.id]
    );

    res.json(updatedPayment[0]);
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ error: 'Failed to process refund' });
  }
});

module.exports = router; 