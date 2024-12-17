import { PaymentGatewayConfig } from '../services/PaymentService';

export const SUPPORTED_CURRENCIES = ['AED', 'USD', 'EUR', 'GBP'] as const;
export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];

export const PAYMENT_GATEWAYS: PaymentGatewayConfig[] = [
  {
    id: 'stripe',
    name: 'Credit Card (Stripe)',
    isEnabled: true,
    apiKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY || '',
    testMode: import.meta.env.MODE !== 'production',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    isEnabled: true,
    apiKey: import.meta.env.VITE_PAYPAL_CLIENT_ID || '',
    testMode: import.meta.env.MODE !== 'production',
  },
  {
    id: 'square',
    name: 'Square',
    isEnabled: true,
    apiKey: import.meta.env.VITE_SQUARE_APP_ID || '',
    testMode: import.meta.env.MODE !== 'production',
  },
  {
    id: 'tap',
    name: 'Tap Payments',
    isEnabled: true,
    apiKey: import.meta.env.VITE_TAP_PUBLIC_KEY || '',
    testMode: import.meta.env.MODE !== 'production',
  }
];

export const DEFAULT_CURRENCY: SupportedCurrency = 'AED';

export const PAYMENT_CONFIG = {
  minimumAmount: 1,
  maximumAmount: 1000000,
  defaultCurrency: DEFAULT_CURRENCY,
  supportedCurrencies: SUPPORTED_CURRENCIES,
  testMode: import.meta.env.MODE !== 'production',
  paymentGateways: PAYMENT_GATEWAYS,
  stripeElements: {
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#0F766E',
        colorBackground: '#ffffff',
        colorText: '#1F2937',
        colorDanger: '#dc2626',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  },
} as const;

export const getEnabledPaymentGateways = () => 
  PAYMENT_GATEWAYS.filter(gateway => gateway.isEnabled);

export const getPaymentGateway = (gatewayId: string) =>
  PAYMENT_GATEWAYS.find(gateway => gateway.id === gatewayId); 