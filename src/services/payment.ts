import { ApiError, ApiResponse } from './api';

interface PayPalConfig {
  clientId: string;
  currency: string;
  intent: 'CAPTURE' | 'AUTHORIZE';
}

interface PaymentDetails {
  amount: number;
  currency: string;
  bookingId: string;
  description: string;
}

interface PaymentResult {
  transactionId: string;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod: string;
  amount: number;
  currency: string;
}

const PAYPAL_CONFIG: PayPalConfig = {
  clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || '',
  currency: 'AED',
  intent: 'CAPTURE',
};

export const loadPayPalScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CONFIG.clientId}&currency=${PAYPAL_CONFIG.currency}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load PayPal SDK'));
    document.body.appendChild(script);
  });
};

export const createPayPalOrder = async (details: PaymentDetails): Promise<string> => {
  try {
    const response = await fetch('/api/paypal/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: PAYPAL_CONFIG.intent,
        purchase_units: [
          {
            reference_id: details.bookingId,
            description: details.description,
            amount: {
              currency_code: details.currency,
              value: details.amount.toString(),
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create PayPal order');
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    throw new ApiError(500, 'Failed to create PayPal order');
  }
};

export const capturePayPalOrder = async (orderId: string): Promise<ApiResponse<PaymentResult>> => {
  try {
    const response = await fetch(`/api/paypal/capture-order/${orderId}`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to capture PayPal payment');
    }

    const data = await response.json();
    return {
      success: true,
      data: {
        transactionId: data.purchase_units[0].payments.captures[0].id,
        status: 'completed',
        paymentMethod: 'PayPal',
        amount: parseFloat(data.purchase_units[0].amount.value),
        currency: data.purchase_units[0].amount.currency_code,
      },
    };
  } catch (error) {
    throw new ApiError(500, 'Failed to capture PayPal payment');
  }
};

export const createPayPalButtons = (
  details: PaymentDetails,
  onApprove: (result: PaymentResult) => void,
  onError: (error: Error) => void
): void => {
  if (!window.paypal) {
    throw new Error('PayPal SDK not loaded');
  }

  window.paypal.Buttons({
    createOrder: () => createPayPalOrder(details),
    onApprove: async (data: { orderID: string }) => {
      try {
        const result = await capturePayPalOrder(data.orderID);
        if (result.success && result.data) {
          onApprove(result.data);
        }
      } catch (error) {
        onError(error as Error);
      }
    },
    onError: (err: Error) => {
      onError(err);
    },
    style: {
      layout: 'horizontal',
      color: 'black',
      shape: 'rect',
      label: 'pay',
    },
  }).render('#paypal-button-container');
};

// Add PayPal types to window object
declare global {
  interface Window {
    paypal: any;
  }
} 