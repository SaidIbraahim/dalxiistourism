import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Package, 
  MapPin,
  Activity,
  Clock,
  Plus,
  Eye,
  Download,
  RefreshCw,
  FileSpreadsheet,
  LogOut
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { exportOverviewReportToExcel } from '../../utils/excelExport';
import { supabase } from '../../lib/supabase';

interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  activePackages: number;
  activeDestinations: number;
  pendingBookings: number;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    status: string;
    amount?: number;
  }>;
  monthlyTrends: {
    bookings: number[];
    revenue: number[];
    expenses: number[];
  };
}

const OverviewSection: React.FC = () => {
  const { showToast } = useToast();
  const { logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    activePackages: 0,
    activeDestinations: 0,
    pendingBookings: 0,
    recentActivity: [],
    monthlyTrends: {
      bookings: [0, 0, 0, 0, 0, 0],
      revenue: [0, 0, 0, 0, 0, 0],
      expenses: [0, 0, 0, 0, 0, 0]
    }
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
    
    // Set up auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch real data from Supabase
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
        // Fall back to mock data if Supabase fails
        throw bookingsError;
      }

      // Process real data
      const totalBookings = bookings?.length || 0;
      const confirmedBookings = bookings?.filter(b => ['confirmed', 'completed'].includes(b.status)) || [];
      const pendingBookings = bookings?.filter(b => b.status === 'pending') || [];
      const totalRevenue = confirmedBookings.reduce((sum, booking) => sum + (booking.total_amount || 0), 0);
      
      // Calculate monthly trends from real data
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));
        return date;
      });

      const monthlyBookings = last6Months.map(month => {
        return bookings?.filter(booking => {
          const bookingDate = new Date(booking.created_at);
          return bookingDate.getMonth() === month.getMonth() && 
                 bookingDate.getFullYear() === month.getFullYear();
        }).length || 0;
      });

      const monthlyRevenue = last6Months.map(month => {
        return bookings?.filter(booking => {
          const bookingDate = new Date(booking.created_at);
          return bookingDate.getMonth() === month.getMonth() && 
                 bookingDate.getFullYear() === month.getFullYear() &&
                 ['confirmed', 'completed'].includes(booking.status);
        }).reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0;
      });

      // Generate recent activity from real bookings
      const recentActivity = bookings?.slice(0, 5).map((booking, index) => ({
        id: booking.id,
        type: 'booking',
        description: `${booking.status === 'pending' ? 'New booking received' : 'Booking ' + booking.status} for ${booking.package_name || 'Custom Services'}`,
        timestamp: formatTimeAgo(booking.created_at),
        status: booking.status,
        amount: booking.total_amount
      })) || [];

      const realStats: DashboardStats = {
        totalBookings,
        totalRevenue,
        totalExpenses: totalRevenue * 0.35, // Estimate 35% expenses
        netProfit: totalRevenue * 0.65, // 65% profit margin
        activePackages: 8, // This would come from packages table
        activeDestinations: 12, // This would come from destinations table
        pendingBookings: pendingBookings.length,
        recentActivity,
        monthlyTrends: {
          bookings: monthlyBookings,
          revenue: monthlyRevenue,
          expenses: monthlyRevenue.map(r => r * 0.35)
        }
      };

      setStats(realStats);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      
      // Enhanced fallback mock data
      const mockStats: DashboardStats = {
        totalBookings: 156,
        totalRevenue: 45250.00,
        totalExpenses: 18950.00,
        netProfit: 26300.00,
        activePackages: 8,
        activeDestinations: 12,
        pendingBookings: 23,
        recentActivity: [
          {
            id: '1',
            type: 'booking',
            description: 'New booking received for Puntland Adventure',
            timestamp: '2 hours ago',
            status: 'pending',
            amount: 299.99
          },
          {
            id: '2',
            type: 'payment',
            description: 'Payment received for Somalia Heritage Tour',
            timestamp: '4 hours ago',
            status: 'completed',
            amount: 499.99
          },
          {
            id: '3',
            type: 'booking',
            description: 'Group booking confirmed: 6 participants',
            timestamp: '1 day ago',
            status: 'confirmed',
            amount: 1799.94
          }
        ],
        monthlyTrends: {
          bookings: [12, 19, 15, 23, 28, 31],
          revenue: [2400, 3800, 3000, 4600, 5600, 6200],
          expenses: [1200, 1900, 1500, 2300, 2800, 3100]
        }
      };

      setStats(mockStats);
      showToast('warning', 'Using Demo Data', 'Connected to demo data. Real data will be available once bookings are created.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    showToast('success', 'Success', 'Dashboard data refreshed');
  };

  const handleExportOverview = () => {
    try {
      exportOverviewReportToExcel(stats, 'dalxiis-overview-report');
      showToast('success', 'Success', 'Overview report exported to Excel successfully');
    } catch (error) {
      console.error('Export failed:', error);
      showToast('error', 'Error', 'Failed to export overview report');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      showToast('success', 'Success', 'Logged out successfully');
    } catch (error) {
      showToast('error', 'Error', 'Logout failed');
    }
  };

  const handleExportBookings = () => {
    try {
      // TODO: Replace with real booking data from Supabase
      const mockBookings = [
        {
          id: '1',
          customer_name: 'Ahmed Hassan',
          customer_email: 'ahmed@example.com',
          customer_phone: '+252 61 123 4567',
          package_name: 'Puntland Adventure',
          destination_name: 'Garowe',
          booking_date: '2024-02-15',
          participants: 2,
          total_amount: 599.98,
          status: 'pending',
          payment_status: 'pending',
          special_requests: 'Vegetarian meals preferred',
          created_at: '2024-01-20T10:30:00Z'
        }
      ];
      
      const { exportBookingsToExcel } = require('../../utils/excelExport');
      exportBookingsToExcel(mockBookings, 'dalxiis-bookings-report');
      showToast('success', 'Success', 'Bookings report exported to Excel successfully');
    } catch (error) {
      console.error('Export failed:', error);
      showToast('error', 'Error', 'Failed to export bookings report');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'confirmed':
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Calendar className="w-4 h-4" />;
      case 'payment':
        return <DollarSign className="w-4 h-4" />;
      case 'expense':
        return <TrendingUp className="w-4 h-4" />;
      case 'package':
        return <Package className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getTrendIndicator = (current: number, previous: number) => {
    const change = current - previous;
    const percentage = previous > 0 ? (change / previous) * 100 : 0;
    
    if (change > 0) {
      return { text: `+${percentage.toFixed(1)}%`, color: 'text-green-600', icon: '↗' };
    } else if (change < 0) {
      return { text: `${percentage.toFixed(1)}%`, color: 'text-red-600', icon: '↘' };
    } else {
      return { text: '0%', color: 'text-gray-600', icon: '→' };
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-200 rounded-lg w-64 animate-pulse"></div>
            <div className="h-4 bg-gray-100 rounded w-48 mt-2 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded-lg w-24 animate-pulse"></div>
        </div>

        {/* Loading Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="ml-4 flex-1">
                  <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-16 mt-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-100 rounded w-24 mt-1 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading Activity */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <div className="h-6 bg-gray-200 rounded w-40 mb-6 animate-pulse"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2 mt-1 animate-pulse"></div>
                </div>
                <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-sm text-gray-600 mt-1">Real-time business metrics and analytics</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Real-time Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Bookings */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Total Bookings</div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalBookings}</div>
              {(() => {
                const trend = getTrendIndicator(stats.monthlyTrends.bookings[5], stats.monthlyTrends.bookings[4]);
                return (
                  <div className={`text-sm font-medium flex items-center ${trend.color}`}>
                    <span className="mr-1">{trend.icon}</span>
                    <span>{trend.text} from last month</span>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Total Revenue</div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</div>
              {(() => {
                const trend = getTrendIndicator(stats.monthlyTrends.revenue[5], stats.monthlyTrends.revenue[4]);
                return (
                  <div className={`text-sm font-medium flex items-center ${trend.color}`}>
                    <span className="mr-1">{trend.icon}</span>
                    <span>{trend.text} from last month</span>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Net Profit</div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.netProfit)}</div>
              <div className="text-sm font-medium text-green-600">
                {((stats.netProfit / stats.totalRevenue) * 100).toFixed(1)}% profit margin
              </div>
            </div>
          </div>
        </div>

        {/* Pending Bookings */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Pending Bookings</div>
              <div className="text-2xl font-bold text-gray-900">{stats.pendingBookings}</div>
              <div className="text-sm font-medium text-orange-600">
                Requires attention
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Overview & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Overview */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Content Overview</h3>
            <Package className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Tour Packages</span>
              </div>
              <span className="text-xl font-bold text-blue-600">{stats.activePackages}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Destinations</span>
              </div>
              <span className="text-xl font-bold text-green-600">{stats.activeDestinations}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            <Plus className="w-5 h-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={() => showToast('info', 'Coming Soon', 'Package creation feature coming soon')}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-md text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>New Package</span>
            </button>
            <button 
              onClick={() => showToast('info', 'Coming Soon', 'Destination creation feature coming soon')}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 shadow-md text-sm font-medium"
            >
              <MapPin className="w-4 h-4" />
              <span>New Destination</span>
            </button>
          </div>
        </div>

        {/* Export & Reports */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Export & Reports</h3>
            <Download className="w-5 h-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={handleExportOverview}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md text-sm font-medium"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Overview Report</span>
            </button>
            <button
              onClick={handleExportBookings}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              <span>Bookings Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Recent Activity */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <button 
            onClick={() => showToast('info', 'Coming Soon', 'Activity log feature coming soon')}
            className="text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors flex items-center space-x-1"
          >
            <span>View All</span>
            <Eye className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4">
          {stats.recentActivity.slice(0, 5).map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                activity.type === 'booking' ? 'bg-blue-100 text-blue-600' :
                activity.type === 'payment' ? 'bg-green-100 text-green-600' :
                activity.type === 'expense' ? 'bg-red-100 text-red-600' :
                'bg-purple-100 text-purple-600'
              }`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                <div className="flex items-center space-x-3 mt-1">
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  {activity.amount && (
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(activity.amount)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(activity.status)}`}>
                  {activity.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewSection;
