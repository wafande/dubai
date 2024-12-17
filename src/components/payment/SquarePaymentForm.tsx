import React, { useEffect, useState } from 'react';
import { PaymentIntent } from '../../services/PaymentService';
import { paymentService } from '../../services/PaymentService';
import { PAYMENT_CONFIG } from '../../config/payment';

interface SquarePaymentFormProps {
  paymentIntent: PaymentIntent;
  onSuccess: (paymentIntent: PaymentIntent) => void;
  onError: (error: Error) => void;
}

declare global {
  interface Window {
    Square?: any;
  }
}

const SquarePaymentForm: React.FC<SquarePaymentFormProps> = ({
  paymentIntent,
  onSuccess,
  onError,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [card, setCard] = useState<any>(null);

  useEffect(() => {
    const loadSquareScript = async () => {
      try {
        if (!window.Square) {
          const script = document.createElement('script');
          script.src = 'https://sandbox.web.squarecdn.com/v1/square.js';
          script.async = true;
          document.body.appendChild(script);

          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load Square SDK'));
          });
        }

        await initializeSquare();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load Square payment';
        setError(errorMessage);
        onError(err instanceof Error ? err : new Error(errorMessage));
      } finally {
        setLoading(false);
      }
    };

    loadSquareScript();

    return () => {
      if (card) {
        card.destroy();
      }
    };
  }, []);

  const initializeSquare = async () => {
    if (!window.Square) return;

    const payments = window.Square.payments(
      PAYMENT_CONFIG.paymentGateways.find(g => g.id === 'square')?.apiKey,
      PAYMENT_CONFIG.testMode ? 'sandbox' : 'production'
    );

    const card = await payments.card();
    await card.attach('#square-card');
    setCard(card);
    setLoading(false);
  };

  const handlePayment = async () => {
    if (!card) return;

    try {
      setLoading(true);
      setError(null);

      const result = await card.tokenize();
      if (result.status === 'OK') {
        const response = await paymentService.processSquarePayment(
          paymentIntent,
          result.token
        );
        onSuccess(response);
      } else {
        throw new Error(result.errors[0].message);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      onError(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div id="square-card" className="min-h-[200px] w-full"></div>
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={loading}
        className={`w-full py-2 px-4 rounded-md text-white font-medium ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-teal-600 hover:bg-teal-700'
        }`}
      >
        {loading ? (
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
        Your payment is secured by Square. We never store your card details.
      </p>
    </div>
  );
};

export default SquarePaymentForm; 