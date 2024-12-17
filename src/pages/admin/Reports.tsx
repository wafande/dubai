import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  Download,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiService } from '../../services/api';

interface ServiceRevenue {
  name: string;
  revenue: number;
  bookingCount: number;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
  bookings: number;
}

interface Customer {
  name: string;
  email: string;
  totalSpent: number;
  bookings: number;
}

interface ReportMetrics {
  totalRevenue: number;
  totalBookings: number;
  averageBookingValue: number;
  activeUsers: number;
  revenueByService: {
    [key: string]: number;
  };
  bookingsByStatus: {
    [key: string]: number;
  };
  revenueByMonth: {
    [key: string]: number;
  };
  topCustomers: Customer[];
}

export function Reports() {
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    loadMetrics();
  }, [dateRange]);

  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.read(`/api/admin/analytics/dashboard?range=${dateRange}`);
      
      if (!data || !data.summary) {
        throw new Error('Invalid response format');
      }
      
      // Transform the API data into the format we need
      const metrics: ReportMetrics = {
        totalRevenue: data.summary.totalRevenue || 0,
        totalBookings: data.summary.totalBookings || 0,
        averageBookingValue: data.summary.totalBookings > 0 
          ? data.summary.totalRevenue / data.summary.totalBookings 
          : 0,
        activeUsers: data.summary.totalUsers || 0,
        revenueByService: Array.isArray(data.topServices) 
          ? data.topServices.reduce<Record<string, number>>((acc, service: ServiceRevenue) => {
              if (service?.name && typeof service.revenue === 'number') {
                acc[service.name] = service.revenue;
              }
              return acc;
            }, {})
          : {},
        bookingsByStatus: {
          completed: data.summary.completedBookings || 0,
          pending: data.summary.pendingBookings || 0,
          cancelled: data.summary.cancelledBookings || 0
        },
        revenueByMonth: Array.isArray(data.monthlyRevenue)
          ? data.monthlyRevenue.reduce<Record<string, number>>((acc, item: MonthlyRevenue) => {
              if (item?.month && typeof item.revenue === 'number') {
                acc[item.month] = item.revenue;
              }
              return acc;
            }, {})
          : {},
        topCustomers: Array.isArray(data.topCustomers) ? data.topCustomers : []
      };

      setMetrics(metrics);
    } catch (error) {
      toast.error('Failed to load metrics');
      console.error('Error loading metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      // In a real app, this would generate a PDF/Excel report
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate downloading a file
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent('Report data'));
      element.setAttribute('download', `report_${dateRange}_${new Date().toISOString()}.csv`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      toast.success('Report generated successfully');
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  if (isLoading || !metrics) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
            className="rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
            aria-label="Select date range"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={handleGenerateReport}
            disabled={isGeneratingReport}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50"
          >
            {isGeneratingReport ? (
              <RefreshCw className="animate-spin h-5 w-5 mr-2" />
            ) : (
              <Download className="h-5 w-5 mr-2" />
            )}
            Generate Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${metrics.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-amber-100 rounded-full">
              <DollarSign className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-semibold text-gray-900">
                {metrics.totalBookings.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Booking Value</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${metrics.averageBookingValue.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-semibold text-gray-900">
                {metrics.activeUsers.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Service */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Service</h3>
          <div className="space-y-4">
            {Object.entries(metrics.revenueByService).map(([service, revenue]) => (
              <div key={service} className="flex items-center">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-600">
                      {service.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      ${revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full"
                      style={{
                        width: `${(revenue / metrics.totalRevenue) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Customers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Customers</h3>
          <div className="space-y-4">
            {metrics.topCustomers.map((customer, index) => (
              <div key={customer.email} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="text-amber-600 font-medium">#{index + 1}</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                    <p className="text-sm text-gray-500">{customer.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ${customer.totalSpent.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">{customer.bookings} bookings</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bookings by Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">Bookings by Status</h3>
          <div className="space-y-4">
            {Object.entries(metrics.bookingsByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-600">
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {count} bookings
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        status === 'confirmed'
                          ? 'bg-green-500'
                          : status === 'pending'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{
                        width: `${(count / metrics.totalBookings) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Monthly Revenue Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Revenue Trend</h3>
          <div className="space-y-4">
            {Object.entries(metrics.revenueByMonth).map(([month, revenue]) => (
              <div key={month} className="flex items-center">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-600">{month}</span>
                    <span className="text-sm font-medium text-gray-900">
                      ${revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(revenue / metrics.totalRevenue) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 