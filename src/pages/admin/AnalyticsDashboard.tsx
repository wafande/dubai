import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../services/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  Scatter
} from 'recharts';
import { 
  Users,
  Ship,
  Plane,
  Car,
  DollarSign,
  Calendar,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock as PendingIcon,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { CSVLink } from 'react-csv';
import { debounce } from '../../utils/performance';

interface DashboardStats {
  overall: {
    total_bookings: number;
    completed_bookings: number;
    pending_bookings: number;
    cancelled_bookings: number;
    total_revenue: number;
  };
  byVehicleType: Array<{
    type: string;
    total_bookings: number;
    revenue: number;
  }>;
  recentBookings: Array<{
    id: number;
    vehicle_name: string;
    vehicle_type: string;
    customer_name: string;
    total_amount: number;
    status: string;
    created_at: string;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    bookings: number;
  }>;
}

const defaultStats: DashboardStats = {
  overall: {
    total_bookings: 0,
    completed_bookings: 0,
    pending_bookings: 0,
    cancelled_bookings: 0,
    total_revenue: 0
  },
  byVehicleType: [],
  recentBookings: [],
  monthlyRevenue: []
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// Helper functions for icons and colors
function getVehicleIcon(type: string) {
  switch (type.toLowerCase()) {
    case 'yacht':
      return Ship;
    case 'aircraft':
      return Plane;
    default:
      return Car;
  }
}

function getStatusIcon(status: string) {
  switch (status.toLowerCase()) {
    case 'completed':
      return CheckCircle;
    case 'cancelled':
      return XCircle;
    default:
      return PendingIcon;
  }
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'text-green-500';
    case 'cancelled':
      return 'text-red-500';
    default:
      return 'text-amber-500';
  }
}

export function AnalyticsDashboard() {
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date()
  });
  const [exportData, setExportData] = useState<any[]>([]);
  const [refreshInterval, setRefreshInterval] = useState<number>(30); // seconds

  // Enhanced fetchStats with date range
  const fetchStats = useCallback(async () => {
    try {
      const data = await apiService.read('/api/admin/stats', {
        params: {
          start_date: format(startOfDay(dateRange.start), 'yyyy-MM-dd'),
          end_date: format(endOfDay(dateRange.end), 'yyyy-MM-dd')
        }
      });
      
      setStats({
        overall: {
          total_bookings: data.overall?.total_bookings ?? 0,
          completed_bookings: data.overall?.completed_bookings ?? 0,
          pending_bookings: data.overall?.pending_bookings ?? 0,
          cancelled_bookings: data.overall?.cancelled_bookings ?? 0,
          total_revenue: data.overall?.total_revenue ?? 0
        },
        byVehicleType: data.byVehicleType ?? [],
        recentBookings: data.recentBookings ?? [],
        monthlyRevenue: data.monthlyRevenue ?? []
      });

      // Prepare export data
      const exportableData = [
        ...data.monthlyRevenue.map((item: any) => ({
          period: item.month,
          revenue: item.revenue,
          bookings: item.bookings,
          type: 'Monthly Revenue'
        })),
        ...data.byVehicleType.map((item: any) => ({
          vehicle_type: item.type,
          bookings: item.total_bookings,
          revenue: item.revenue,
          type: 'Vehicle Performance'
        }))
      ];
      setExportData(exportableData);
      
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  // Debounced fetch for date range changes
  const debouncedFetch = debounce(fetchStats, 500);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [fetchStats, refreshInterval]);

  // Date range handlers
  const handleDateRangeChange = (range: { start: Date; end: Date }) => {
    setDateRange(range);
    debouncedFetch();
  };

  // Custom date range selector component
  const DateRangeSelector = () => (
    <div className="flex items-center space-x-4">
      <label className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Start Date</span>
        <input
          type="date"
          title="Start date"
          aria-label="Start date"
          value={format(dateRange.start, 'yyyy-MM-dd')}
          onChange={(e) => handleDateRangeChange({
            ...dateRange,
            start: new Date(e.target.value)
          })}
          className="px-3 py-2 border rounded-lg"
        />
      </label>
      <span>to</span>
      <label className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">End Date</span>
        <input
          type="date"
          title="End date"
          aria-label="End date"
          value={format(dateRange.end, 'yyyy-MM-dd')}
          onChange={(e) => handleDateRangeChange({
            ...dateRange,
            end: new Date(e.target.value)
          })}
          className="px-3 py-2 border rounded-lg"
        />
      </label>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Bookings',
      value: stats.overall.total_bookings.toString(),
      icon: Calendar,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Revenue',
      value: `$${stats.overall.total_revenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Completed Bookings',
      value: stats.overall.completed_bookings.toString(),
      icon: CheckCircle,
      color: 'bg-teal-500'
    },
    {
      title: 'Pending Bookings',
      value: stats.overall.pending_bookings.toString(),
      icon: Clock,
      color: 'bg-amber-500'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <div className="flex items-center space-x-4">
          <DateRangeSelector />
          
          <label className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Auto Refresh</span>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="px-3 py-2 border rounded-lg"
              title="Auto refresh interval"
              aria-label="Auto refresh interval"
            >
              <option value="15">Refresh: 15s</option>
              <option value="30">Refresh: 30s</option>
              <option value="60">Refresh: 1m</option>
              <option value="300">Refresh: 5m</option>
            </select>
          </label>

          <CSVLink
            data={exportData}
            filename={`analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <Download size={16} />
            <span>Export</span>
          </CSVLink>

          <button
            onClick={() => fetchStats()}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center space-x-2"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="mt-2 text-3xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                  <Icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enhanced Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart - Enhanced with Area */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={stats.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  fill="#8884d8"
                  stroke="#8884d8"
                  fillOpacity={0.3}
                  name="Revenue ($)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="bookings"
                  stroke="#82ca9d"
                  name="Bookings"
                />
                <Scatter
                  yAxisId="left"
                  dataKey="revenue"
                  fill="#8884d8"
                  name="Data Points"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Performance Matrix */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Vehicle Performance Matrix</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={stats.byVehicleType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="total_bookings"
                  fill="#8884d8"
                  name="Bookings"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#82ca9d"
                  name="Revenue ($)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Enhanced Booking Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Status</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Completed', value: stats.overall.completed_bookings },
                    { name: 'Pending', value: stats.overall.pending_bookings },
                    { name: 'Cancelled', value: stats.overall.cancelled_bookings }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Bookings - Enhanced with status filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Recent Bookings</h3>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800">
                Completed
              </button>
              <button className="px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800">
                Pending
              </button>
              <button className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-800">
                Cancelled
              </button>
            </div>
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {stats.recentBookings.length > 0 ? (
              stats.recentBookings.map((booking, index) => {
                const Icon = getVehicleIcon(booking.vehicle_type);
                const StatusIcon = getStatusIcon(booking.status);
                return (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Icon className="w-5 h-5 text-amber-500" />
                      <div>
                        <p className="font-medium text-gray-900">{booking.vehicle_name}</p>
                        <p className="text-sm text-gray-500">{booking.customer_name}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center space-x-4">
                      <div>
                        <p className="font-medium text-gray-900">${booking.total_amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(booking.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <StatusIcon className={`w-5 h-5 ${getStatusColor(booking.status)}`} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-500 py-8">
                No bookings yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 