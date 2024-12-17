import React, { useEffect, useRef, useState } from 'react';
import { PaymentIntent } from '../../services/PaymentService';
import { paymentService } from '../../services/PaymentService';
import { PAYMENT_CONFIG } from '../../config/payment';

interface TapPaymentFormProps {
  paymentIntent: PaymentIntent;
  onSuccess: (paymentIntent: PaymentIntent) => void;
  onError: (error: Error) => void;
}

declare global {
  interface Window {
    Tap?: any;
  }
}

const TapPaymentForm: React.FC<TapPaymentFormProps> = ({
  paymentIntent,
  onSuccess,
  onError,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const tapButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadTapScript = async () => {
      try {
        if (!window.Tap) {
          const script = document.createElement('script');
          script.src = 'https://secure.tap.company/v2/sdk.js';
          script.async = true;
          document.body.appendChild(script);

          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load Tap SDK'));
          });
        }

        initializeTap();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load Tap payment';
        setError(errorMessage);
        onError(err instanceof Error ? err : new Error(errorMessage));
      } finally {
        setLoading(false);
      }
    };

    loadTapScript();

    return () => {
      // Cleanup if needed
      if (window.Tap?.elements) {
        window.Tap.elements.destroy();
      }
    };
  }, []);

  const initializeTap = () => {
    if (!window.Tap) return;

    const tapElement = window.Tap.elements({
      publicKey: PAYMENT_CONFIG.paymentGateways.find(g => g.id === 'tap')?.apiKey,
      lang: 'en',
      mode: PAYMENT_CONFIG.testMode ? 'test' : 'production',
    });

    const style = {
      base: {
        color: '#535353',
        lineHeight: '18px',
        fontFamily: 'sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: 'rgba(0, 0, 0, 0.26)',
          fontSize: '15px'
        }
      },
      invalid: {
        color: 'red',
      }
    };

    const card = tapElement.create('card', { style });

    card.mount(tapButtonRef.current!);

    card.addEventListener('change', (event: any) => {
      if (event.error) {
        setError(event.error.message);
      } else {
        setError(null);
      }
    });

    card.addEventListener('ready', () => {
      setLoading(false);
    });

    card.addEventListener('token', async (event: any) => {
      try {
        const result = await paymentService.processTapPayment(
          paymentIntent,
          event.token
        );
        onSuccess(result);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Payment failed';
        setError(errorMessage);
        onError(err instanceof Error ? err : new Error(errorMessage));
      }
    });
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
      <div ref={tapButtonRef} className="min-h-[200px] w-full"></div>
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <p className="text-xs text-gray-500 text-center mt-4">
        Your payment is secured by Tap. We never store your card details.
      </p>
    </div>
  );
};

export default TapPaymentForm; 