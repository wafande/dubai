import express from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../../db';
import { isAdmin } from '../../middleware/auth';
import axios from 'axios';

const router = express.Router();

// Get payment settings
router.get('/payment-settings', isAdmin, async (req, res) => {
  try {
    const [settings] = await db.query(
      'SELECT * FROM payment_settings WHERE id = 1'
    );

    if (!settings) {
      return res.status(404).json({ error: 'Payment settings not found' });
    }

    const [gateways] = await db.query('SELECT * FROM payment_gateways');

    const formattedSettings = {
      ...settings,
      gateways: gateways.map((gateway: any) => ({
        ...gateway,
        isEnabled: Boolean(gateway.is_enabled),
        testMode: Boolean(gateway.test_mode),
        features: JSON.parse(gateway.features),
        supportedCurrencies: JSON.parse(gateway.supported_currencies)
      }))
    };

    res.json(formattedSettings);
  } catch (error) {
    console.error('Error fetching payment settings:', error);
    res.status(500).json({ error: 'Failed to fetch payment settings' });
  }
});

// Update payment settings
router.post('/payment-settings', isAdmin, [
  body('currency').isString().isLength({ min: 3, max: 3 }),
  body('currencySymbol').isString().isLength({ min: 1, max: 10 }),
  body('depositPercentage').isInt({ min: 0, max: 100 }),
  body('taxSettings.enabled').isBoolean(),
  body('taxSettings.percentage').isFloat({ min: 0, max: 100 }),
  body('taxSettings.taxNumber').isString(),
  body('refundPolicy.type').isIn(['flexible', 'moderate', 'strict']),
  body('refundPolicy.deadlineHours').isInt({ min: 0 }),
  body('refundPolicy.refundPercentage').isInt({ min: 0, max: 100 }),
  body('gateways').isArray()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    currency,
    currencySymbol,
    depositPercentage,
    taxSettings,
    refundPolicy,
    gateways
  } = req.body;

  try {
    // Update main settings
    await db.query(
      `UPDATE payment_settings SET 
        currency = ?,
        currency_symbol = ?,
        deposit_percentage = ?,
        tax_enabled = ?,
        tax_percentage = ?,
        tax_number = ?,
        refund_policy_type = ?,
        refund_deadline_hours = ?,
        refund_percentage = ?
      WHERE id = 1`,
      [
        currency,
        currencySymbol,
        depositPercentage,
        taxSettings.enabled,
        taxSettings.percentage,
        taxSettings.taxNumber,
        refundPolicy.type,
        refundPolicy.deadlineHours,
        refundPolicy.refundPercentage
      ]
    );

    // Update gateways
    for (const gateway of gateways) {
      await db.query(
        `UPDATE payment_gateways SET 
          is_enabled = ?,
          api_key = ?,
          secret_key = ?,
          webhook_secret = ?,
          test_mode = ?,
          features = ?,
          supported_currencies = ?
        WHERE id = ?`,
        [
          gateway.isEnabled,
          gateway.apiKey,
          gateway.secretKey,
          gateway.webhookSecret,
          gateway.testMode,
          JSON.stringify(gateway.features),
          JSON.stringify(gateway.supportedCurrencies),
          gateway.id
        ]
      );
    }

    res.json({ message: 'Payment settings updated successfully' });
  } catch (error) {
    console.error('Error updating payment settings:', error);
    res.status(500).json({ error: 'Failed to update payment settings' });
  }
});

// Test payment gateway connection
router.post('/test-gateway/:gatewayId', isAdmin, async (req, res) => {
  const { gatewayId } = req.params;
  const { apiKey, secretKey, testMode } = req.body;

  try {
    switch (gatewayId) {
      case 'stripe':
        const stripeTest = await testStripeConnection(apiKey, secretKey, testMode);
        return res.json(stripeTest);

      case 'paypal':
        const paypalTest = await testPayPalConnection(apiKey, secretKey, testMode);
        return res.json(paypalTest);

      case 'square':
        const squareTest = await testSquareConnection(apiKey, secretKey, testMode);
        return res.json(squareTest);

      case 'tap':
        const tapTest = await testTapConnection(apiKey, secretKey, testMode);
        return res.json(tapTest);

      default:
        return res.status(400).json({ error: 'Invalid gateway ID' });
    }
  } catch (error) {
    console.error(`Error testing ${gatewayId} connection:`, error);
    res.status(500).json({ error: `Failed to test ${gatewayId} connection` });
  }
});

async function testStripeConnection(apiKey: string, secretKey: string, testMode: boolean) {
  try {
    const stripe = require('stripe')(testMode ? apiKey : secretKey);
    await stripe.paymentIntents.list({ limit: 1 });
    return { success: true, message: 'Successfully connected to Stripe' };
  } catch (error) {
    throw new Error('Failed to connect to Stripe');
  }
}

async function testPayPalConnection(clientId: string, secretKey: string, testMode: boolean) {
  try {
    const baseURL = testMode
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com';

    const auth = Buffer.from(`${clientId}:${secretKey}`).toString('base64');
    const response = await axios.post(
      `${baseURL}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return { success: true, message: 'Successfully connected to PayPal' };
  } catch (error) {
    throw new Error('Failed to connect to PayPal');
  }
}

async function testSquareConnection(accessToken: string, testMode: boolean) {
  try {
    const { Client, Environment } = require('square');
    const client = new Client({
      accessToken,
      environment: testMode ? Environment.Sandbox : Environment.Production
    });

    await client.locationsApi.listLocations();
    return { success: true, message: 'Successfully connected to Square' };
  } catch (error) {
    throw new Error('Failed to connect to Square');
  }
}

async function testTapConnection(apiKey: string, testMode: boolean) {
  try {
    const baseURL = testMode
      ? 'https://api.tap.company/v2/test'
      : 'https://api.tap.company/v2';

    await axios.get(`${baseURL}/tokens`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return { success: true, message: 'Successfully connected to Tap Payments' };
  } catch (error) {
    throw new Error('Failed to connect to Tap Payments');
  }
}

export default router; 