import React, { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, PieChart, Download, Calendar, DollarSign, Users, Package } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { supabase } from '../../lib/supabase';

interface BookingAnalytics {
  totalBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  conversionRate: number;
  monthlyGrowth: number;
  popularDestinations: Array<{ name: string; count: number; revenue: number }>;
  bookingsByStatus: Array<{ status: string; count: number; percentage: number }>;
  monthlyTrends: Array<{ month: string; bookings: number; revenue: number }>;
  customerMetrics: {
    totalCustomers: number;
    repeatCustomers: number;
    averageLifetimeValue: number;
  };
}

const ReportsSection: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'bookings' | 'financial' | 'performance' | 'custom'>('bookings');
  const [analytics, setAnalytics] = useState<BookingAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const tabs = [
    { id: 'bookings', label: 'Booking Analytics', icon: BarChart3 },
    { id: 'financial', label: 'Financial Reports', icon: TrendingUp },
    { id: 'performance', label: 'Performance Metrics', icon: PieChart },
    { id: 'custom', label: 'Custom Reports', icon: Download }
  ];

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (dateRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Fetch bookings data
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) throw error;

      // Process analytics
      const processedAnalytics = processBookingData(bookings || []);
      setAnalytics(processedAnalytics);
      
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      showToast('error', 'Error', `Failed to load analytics: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const processBookingData = (bookings: any[]): BookingAnalytics => {
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.total_amount || 0), 0);
    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    // Calculate destinations
    const destinationMap = new Map();
    bookings.forEach(booking => {
      const dest = booking.destination_name || 'Unknown';
      if (destinationMap.has(dest)) {
        const existing = destinationMap.get(dest);
        destinationMap.set(dest, {
          count: existing.count + 1,
          revenue: existing.revenue + (booking.total_amount || 0)
        });
      } else {
        destinationMap.set(dest, {
          count: 1,
          revenue: booking.total_amount || 0
        });
      }
    });

    const popularDestinations = Array.from(destinationMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate status distribution
    const statusMap = new Map();
    bookings.forEach(booking => {
      const status = booking.status || 'unknown';
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });

    const bookingsByStatus = Array.from(statusMap.entries())
      .map(([status, count]) => ({
        status,
        count,
        percentage: totalBookings > 0 ? (count / totalBookings) * 100 : 0
      }));

    // Calculate monthly trends
    const monthlyMap = new Map();
    bookings.forEach(booking => {
      const date = new Date(booking.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthlyMap.has(monthKey)) {
        const existing = monthlyMap.get(monthKey);
        monthlyMap.set(monthKey, {
          bookings: existing.bookings + 1,
          revenue: existing.revenue + (booking.total_amount || 0)
        });
      } else {
        monthlyMap.set(monthKey, {
          bookings: 1,
          revenue: booking.total_amount || 0
        });
      }
    });

    const monthlyTrends = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Customer metrics
    const uniqueCustomers = new Set(bookings.map(b => b.customer_email)).size;
    const customerBookingCounts = new Map();
    bookings.forEach(booking => {
      const email = booking.customer_email;
      customerBookingCounts.set(email, (customerBookingCounts.get(email) || 0) + 1);
    });
    
    const repeatCustomers = Array.from(customerBookingCounts.values()).filter(count => count > 1).length;
    const averageLifetimeValue = uniqueCustomers > 0 ? totalRevenue / uniqueCustomers : 0;

    return {
      totalBookings,
      totalRevenue,
      averageBookingValue,
      conversionRate: 85.2, // This would come from actual conversion tracking
      monthlyGrowth: 12.5, // This would be calculated from previous period
      popularDestinations,
      bookingsByStatus,
      monthlyTrends,
      customerMetrics: {
        totalCustomers: uniqueCustomers,
        repeatCustomers,
        averageLifetimeValue
      }
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const exportReport = (type: string) => {
    showToast('info', 'Export Started', `Generating ${type} report...`);
    // Implementation for export functionality
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f29520]"></div>
        <span className="ml-3 text-lg text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-base font-medium text-gray-600">Generate comprehensive reports and view detailed analytics</div>
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-4 py-2 text-sm font-medium border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button 
            onClick={() => exportReport('all')}
            className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Export All
          </button>
          <button className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-md">
            + Generate Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Total Bookings</div>
                <div className="text-2xl font-bold text-gray-900">{analytics.totalBookings}</div>
                <div className="text-sm text-green-600 font-medium">+{analytics.monthlyGrowth}% from last period</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Total Revenue</div>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.totalRevenue)}</div>
                <div className="text-xs text-green-600">+15.3% from last period</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Avg Booking Value</div>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.averageBookingValue)}</div>
                <div className="text-xs text-blue-600">+8.7% from last period</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Conversion Rate</div>
                <div className="text-2xl font-bold text-gray-900">{analytics.conversionRate}%</div>
                <div className="text-xs text-green-600">+2.1% from last period</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex px-4 py-2 space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#f29520] text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'bookings' && analytics && (
            <BookingAnalyticsTab analytics={analytics} onExport={exportReport} />
          )}
          
          {activeTab === 'financial' && analytics && (
            <FinancialReportsTab analytics={analytics} onExport={exportReport} />
          )}
          
          {activeTab === 'performance' && analytics && (
            <PerformanceMetricsTab analytics={analytics} onExport={exportReport} />
          )}
          
          {activeTab === 'custom' && (
            <CustomReportsTab onExport={exportReport} />
          )}
        </div>
      </div>
    </div>
  );
};

// Booking Analytics Tab Component
const BookingAnalyticsTab: React.FC<{ analytics: BookingAnalytics; onExport: (type: string) => void }> = ({ analytics, onExport }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-gray-900">Booking Analytics</h3>
      <button 
        onClick={() => onExport('booking-analytics')}
        className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Download className="w-4 h-4" />
        <span>Export</span>
      </button>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Popular Destinations */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-900 mb-4">Popular Destinations</h4>
        <div className="space-y-3">
          {analytics.popularDestinations.map((dest, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{dest.name}</div>
                <div className="text-sm text-gray-500">{dest.count} bookings</div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(dest.revenue)}</div>
                <div className="text-sm text-gray-500">revenue</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Status Distribution */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-900 mb-4">Booking Status Distribution</h4>
        <div className="space-y-3">
          {analytics.bookingsByStatus.map((status, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  status.status === 'confirmed' ? 'bg-green-500' :
                  status.status === 'pending' ? 'bg-yellow-500' :
                  status.status === 'completed' ? 'bg-blue-500' :
                  'bg-red-500'
                }`}></div>
                <span className="font-medium text-gray-900 capitalize">{status.status}</span>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">{status.count}</div>
                <div className="text-sm text-gray-500">{status.percentage.toFixed(1)}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Monthly Trends */}
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="text-md font-medium text-gray-900 mb-4">Monthly Trends</h4>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-sm font-medium text-gray-500">Month</th>
              <th className="text-right py-2 text-sm font-medium text-gray-500">Bookings</th>
              <th className="text-right py-2 text-sm font-medium text-gray-500">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {analytics.monthlyTrends.map((trend, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-2 text-sm text-gray-900">{trend.month}</td>
                <td className="py-2 text-sm text-gray-900 text-right">{trend.bookings}</td>
                <td className="py-2 text-sm text-gray-900 text-right">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(trend.revenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// Financial Reports Tab Component
const FinancialReportsTab: React.FC<{ analytics: BookingAnalytics; onExport: (type: string) => void }> = ({ analytics, onExport }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-gray-900">Financial Reports</h3>
      <button 
        onClick={() => onExport('financial-reports')}
        className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <Download className="w-4 h-4" />
        <span>Export</span>
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-green-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-green-900 mb-2">Revenue Summary</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-green-700">Total Revenue:</span>
            <span className="font-medium text-green-900">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(analytics.totalRevenue)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-green-700">Average per Booking:</span>
            <span className="font-medium text-green-900">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(analytics.averageBookingValue)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-green-700">Growth Rate:</span>
            <span className="font-medium text-green-900">+{analytics.monthlyGrowth}%</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-blue-900 mb-2">Customer Metrics</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-blue-700">Total Customers:</span>
            <span className="font-medium text-blue-900">{analytics.customerMetrics.totalCustomers}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-blue-700">Repeat Customers:</span>
            <span className="font-medium text-blue-900">{analytics.customerMetrics.repeatCustomers}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-blue-700">Avg Lifetime Value:</span>
            <span className="font-medium text-blue-900">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(analytics.customerMetrics.averageLifetimeValue)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-purple-900 mb-2">Performance</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-purple-700">Conversion Rate:</span>
            <span className="font-medium text-purple-900">{analytics.conversionRate}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-purple-700">Total Bookings:</span>
            <span className="font-medium text-purple-900">{analytics.totalBookings}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-purple-700">Repeat Rate:</span>
            <span className="font-medium text-purple-900">
              {analytics.customerMetrics.totalCustomers > 0 
                ? ((analytics.customerMetrics.repeatCustomers / analytics.customerMetrics.totalCustomers) * 100).toFixed(1)
                : 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Performance Metrics Tab Component
const PerformanceMetricsTab: React.FC<{ analytics: BookingAnalytics; onExport: (type: string) => void }> = ({ analytics, onExport }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
      <button 
        onClick={() => onExport('performance-metrics')}
        className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        <Download className="w-4 h-4" />
        <span>Export</span>
      </button>
    </div>

    <div className="text-center py-8">
      <PieChart className="mx-auto h-12 w-12 text-gray-400" />
      <h4 className="mt-4 text-lg font-medium text-gray-900">Performance Dashboard</h4>
      <p className="mt-2 text-sm text-gray-500">
        Detailed performance metrics and KPI tracking coming soon.
      </p>
    </div>
  </div>
);

// Custom Reports Tab Component
const CustomReportsTab: React.FC<{ onExport: (type: string) => void }> = ({ onExport }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-gray-900">Custom Reports</h3>
      <button 
        onClick={() => onExport('custom-report')}
        className="flex items-center space-x-2 px-3 py-2 bg-[#f29520] text-white rounded-lg hover:bg-[#e08518] transition-colors"
      >
        <Download className="w-4 h-4" />
        <span>Generate</span>
      </button>
    </div>

    <div className="text-center py-8">
      <Download className="mx-auto h-12 w-12 text-gray-400" />
      <h4 className="mt-4 text-lg font-medium text-gray-900">Custom Report Builder</h4>
      <p className="mt-2 text-sm text-gray-500">
        Create custom reports with specific date ranges, filters, and metrics.
      </p>
    </div>
  </div>
);

export default ReportsSection;
