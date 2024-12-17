import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { PaymentIntent } from '../../services/PaymentService';
import { paymentService } from '../../services/PaymentService';

interface StripePaymentFormProps {
  paymentIntent: PaymentIntent;
  onSuccess: (paymentIntent: PaymentIntent) => void;
  onError: (error: Error) => void;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  paymentIntent,
  onSuccess,
  onError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw submitError;
      }

      const { paymentMethod } = await stripe.createPaymentMethod({
        elements,
      });

      if (!paymentMethod) {
        throw new Error('Failed to create payment method');
      }

      const result = await paymentService.processStripePayment(
        paymentIntent,
        paymentMethod.id
      );

      onSuccess(result);
    } catch (err) {
      console.error('Payment failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      onError(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className={`w-full py-2 px-4 rounded-md text-white font-medium ${
          processing
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-teal-600 hover:bg-teal-700'
        }`}
      >
        {processing ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </span>
        ) : (
          'Pay Now'
        )}
      </button>

      <p className="text-xs text-gray-500 text-center mt-4">
        Your payment is secured by Stripe. We never store your card details.
      </p>
    </form>
  );
};

export default StripePaymentForm; 