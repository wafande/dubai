import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Clock, CreditCard, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { PaymentStatus, PaymentHistoryItem, paymentTracking } from '../services/paymentTracking';

interface PaymentTrackingProps {
  bookingId: string;
  onError?: (error: Error) => void;
}

const PaymentTracking = ({ bookingId, onError }: PaymentTrackingProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await paymentTracking.getPaymentStatus(bookingId);
        if (response.success && response.data) {
          setPaymentStatus(response.data);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch payment status';
        setError(message);
        onError?.(error as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentStatus();
  }, [bookingId, onError]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'overdue':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

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

  if (!paymentStatus) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Payment Progress */}
      <div className="bg-gray-900 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Payment Progress</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-400">Total Amount</p>
              <p className="text-2xl font-bold">
                {formatAmount(paymentStatus.totalAmount, paymentStatus.currency)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Remaining</p>
              <p className="text-xl font-bold">
                {formatAmount(paymentStatus.remainingAmount, paymentStatus.currency)}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-white/10">
                  {Math.round((paymentStatus.paidAmount / paymentStatus.totalAmount) * 100)}% Paid
                </span>
              </div>
            </div>
            <div className="flex h-2 mb-4 overflow-hidden bg-white/10 rounded">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(paymentStatus.paidAmount / paymentStatus.totalAmount) * 100}%` }}
                transition={{ duration: 1 }}
                className="bg-white"
              />
            </div>
          </div>

          {/* Next Payment Info */}
          {paymentStatus.remainingAmount > 0 && (
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-3 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Next Payment Due</p>
                  <p className="font-semibold">{formatDate(paymentStatus.dueDate)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Amount Due</p>
                <p className="font-semibold">
                  {formatAmount(paymentStatus.nextPaymentAmount, paymentStatus.currency)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center">
            <CreditCard className="w-5 h-5 mr-3" />
            <span className="font-semibold">Payment History</span>
          </div>
          {showHistory ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>

        {showHistory && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3 }}
            className="px-6 pb-4"
          >
            <div className="space-y-4">
              {paymentStatus.paymentHistory.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
                >
                  <div>
                    <p className="font-semibold">
                      {formatAmount(payment.amount, payment.currency)}
                    </p>
                    <p className="text-sm text-gray-400">
                      {payment.method} • {formatDate(payment.date)}
                    </p>
                  </div>
                  <span className={`text-sm font-medium ${getStatusColor(payment.status)}`}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PaymentTracking; 