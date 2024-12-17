import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/stripe-js';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { loadStripe } from '@stripe/stripe-js';
import { PAYMENT_CONFIG, getEnabledPaymentGateways } from '../../config/payment';
import { PaymentIntent } from '../../services/PaymentService';
import { paymentService } from '../../services/PaymentService';
import StripePaymentForm from './StripePaymentForm';
import TapPaymentForm from './TapPaymentForm';
import SquarePaymentForm from './SquarePaymentForm';

interface PaymentFormProps {
  amount: number;
  currency: string;
  bookingId: number;
  onSuccess: (paymentIntent: PaymentIntent) => void;
  onError: (error: Error) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  currency,
  bookingId,
  onSuccess,
  onError,
}) => {
  const [selectedGateway, setSelectedGateway] = useState<string>('stripe');
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enabledGateways = getEnabledPaymentGateways();

  useEffect(() => {
    const initializePayment = async () => {
      try {
        setLoading(true);
        const intent = await paymentService.createPayment(
          amount,
          currency,
          selectedGateway,
          bookingId,
          {}
        );
        setPaymentIntent(intent);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize payment');
        onError(err instanceof Error ? err : new Error('Failed to initialize payment'));
      } finally {
        setLoading(false);
      }
    };

    initializePayment();
  }, [amount, currency, selectedGateway, bookingId]);

  const handlePaymentSuccess = async (intent: PaymentIntent) => {
    try {
      onSuccess(intent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment processing failed');
      onError(err instanceof Error ? err : new Error('Payment processing failed'));
    }
  };

  const handlePaymentError = (err: Error) => {
    setError(err.message);
    onError(err);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Payment Method
        </label>
        <select
          value={selectedGateway}
          onChange={(e) => setSelectedGateway(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          aria-label="Select payment method"
          id="payment-method-select"
        >
          {enabledGateways.map((gateway) => (
            <option key={gateway.id} value={gateway.id}>
              {gateway.name}
            </option>
          ))}
        </select>
      </div>

      {paymentIntent && (
        <div className="space-y-4">
          {selectedGateway === 'stripe' && (
            <Elements
              stripe={loadStripe(PAYMENT_CONFIG.paymentGateways[0].apiKey)}
              options={{ appearance: PAYMENT_CONFIG.stripeElements.appearance }}
            >
              <StripePaymentForm
                paymentIntent={paymentIntent}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </Elements>
          )}

          {selectedGateway === 'paypal' && (
            <PayPalButtons
              createOrder={() => paymentIntent.id}
              onApprove={async (data) => {
                try {
                  const result = await paymentService.processPayPalPayment(
                    paymentIntent,
                    data.orderID
                  );
                  handlePaymentSuccess(result);
                } catch (err) {
                  handlePaymentError(
                    err instanceof Error ? err : new Error('PayPal payment failed')
                  );
                }
              }}
            />
          )}

          {selectedGateway === 'square' && (
            <SquarePaymentForm
              paymentIntent={paymentIntent}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          )}

          {selectedGateway === 'tap' && (
            <TapPaymentForm
              paymentIntent={paymentIntent}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          )}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        <p>Amount: {new Intl.NumberFormat('en-AE', {
          style: 'currency',
          currency: currency
        }).format(amount)}</p>
      </div>
    </div>
  );
};

export default PaymentForm; 