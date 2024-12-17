import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Check } from 'lucide-react';
import { loadPayPalScript, createPayPalButtons, PaymentResult } from '../services/payment';
import { api } from '../services/api';
import { EMAIL_TEMPLATES } from '../services/emailTemplates';

interface PayPalPaymentProps {
  amount: number;
  currency: string;
  bookingId: string;
  description: string;
  email: string;
  onSuccess: (result: PaymentResult) => void;
  onError: (error: Error) => void;
}

const PayPalPayment = ({
  amount,
  currency,
  bookingId,
  description,
  email,
  onSuccess,
  onError,
}: PayPalPaymentProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const initializePayPal = async () => {
      try {
        await loadPayPalScript();
        setIsLoading(false);

        createPayPalButtons(
          { amount, currency, bookingId, description },
          async (result) => {
            setIsProcessing(true);
            try {
              // Send payment confirmation email
              await api.sendEmail({
                to: email,
                templateId: EMAIL_TEMPLATES.PAYMENT_CONFIRMATION,
                data: {
                  name: 'Customer', // TODO: Get customer name
                  email,
                  date: new Date().toISOString(),
                  bookingId,
                  transactionId: result.transactionId,
                  amount: result.amount,
                  currency: result.currency,
                  paymentMethod: result.paymentMethod,
                  status: result.status,
                },
              });

              onSuccess(result);
            } catch (error) {
              onError(error as Error);
            } finally {
              setIsProcessing(false);
            }
          },
          (error) => {
            setError(error.message);
            onError(error);
          }
        );
      } catch (error) {
        setError('Failed to load PayPal. Please try again later.');
        setIsLoading(false);
      }
    };

    initializePayPal();
  }, [amount, currency, bookingId, description, email, onSuccess, onError]);

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg">
        <p className="text-sm text-red-500 flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isLoading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center p-8"
        >
          <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </motion.div>
      ) : isProcessing ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center p-8 space-y-4"
        >
          <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-gray-300">Processing your payment...</p>
        </motion.div>
      ) : (
        <>
          <div className="bg-gray-900 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-gray-400">Total Amount</p>
                <p className="text-2xl font-bold">{currency} {amount.toLocaleString()}</p>
              </div>
              {amount > 0 && (
                <div className="text-right">
                  <p className="text-sm text-gray-400">Deposit Required</p>
                  <p className="text-lg font-bold">{currency} {(amount * 0.5).toLocaleString()}</p>
                </div>
              )}
            </div>
            <div className="text-sm text-gray-400 space-y-1">
              <p>• Secure payment via PayPal</p>
              <p>• 50% deposit to confirm booking</p>
              <p>• Remaining balance due 48 hours before service</p>
            </div>
          </div>

          <div id="paypal-button-container" className="min-h-[50px]" />
        </>
      )}
    </div>
  );
};

export default PayPalPayment; 