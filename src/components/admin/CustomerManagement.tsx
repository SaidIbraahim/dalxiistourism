import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, Calendar, MapPin, Star, Eye, Edit, Trash2, Search, Filter, 
  Users, TrendingUp, ChevronDown, ChevronUp, Grid, List, SortAsc, SortDesc,
  Award, Clock, DollarSign, Activity, MoreHorizontal, Download, RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  nationality: string;
  gender: string;
  totalBookings: number;
  totalSpent: number;
  lastBooking: string;
  status: 'active' | 'inactive';
  joinDate: string;
  bookings: any[];
  customerType: 'new' | 'returning';
  averageBookingValue: number;
  daysSinceLastBooking: number;
}

interface CustomerManagementProps {
  bookings: any[];
}

const CustomerManagement: React.FC<CustomerManagementProps> = ({ bookings }) => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterType, setFilterType] = useState<'all' | 'new' | 'returning'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'totalSpent' | 'totalBookings' | 'lastBooking'>('totalSpent');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const { showToast } = useToast();

  useEffect(() => {
    processCustomerData();
  }, [bookings]);

  const processCustomerData = () => {
    setLoading(true);
    
    // Group bookings by customer email
    const customerMap = new Map<string, Customer>();
    
    bookings.forEach(booking => {
      if (!booking.customer_email) return;
      
      const email = booking.customer_email;
      
      if (customerMap.has(email)) {
        const customer = customerMap.get(email)!;
        customer.totalBookings += 1;
        customer.totalSpent += typeof booking.total_amount === 'string' ? parseFloat(booking.total_amount) || 0 : booking.total_amount || 0;
        customer.bookings.push(booking);
        
        // Update last booking date
        if (new Date(booking.created_at) > new Date(customer.lastBooking)) {
          customer.lastBooking = booking.created_at;
        }
      } else {
        customerMap.set(email, {
          id: booking.customer_email,
          name: booking.customer_name || 'Unknown',
          email: booking.customer_email,
          phone: booking.customer_phone || '',
          nationality: booking.nationality || '',
          gender: booking.gender || '',
          totalBookings: 1,
          totalSpent: typeof booking.total_amount === 'string' ? parseFloat(booking.total_amount) || 0 : booking.total_amount || 0,
          lastBooking: booking.created_at,
          status: booking.status === 'confirmed' || booking.status === 'pending' ? 'active' : 'inactive',
          joinDate: booking.created_at,
          bookings: [booking],
          customerType: 'new',
          averageBookingValue: 0,
          daysSinceLastBooking: 0
        });
      }
    });
    
    // Process customer analytics
    const customerList = Array.from(customerMap.values()).map(customer => {
      const averageBookingValue = customer.totalBookings > 0 ? customer.totalSpent / customer.totalBookings : 0;
      const daysSinceLastBooking = Math.floor((Date.now() - new Date(customer.lastBooking).getTime()) / (1000 * 60 * 60 * 24));
      
      let customerType: 'new' | 'returning' = 'new';
      if (customer.totalBookings > 1) {
        customerType = 'returning';
      }
      
      return {
        ...customer,
        averageBookingValue,
        daysSinceLastBooking,
        customerType
      };
    });
    
    setCustomers(customerList);
    setLoading(false);
  };

  const filteredAndSortedCustomers = customers
    .filter(customer => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           customer.nationality.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
      const matchesType = filterType === 'all' || customer.customerType === filterType;
      
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'totalSpent':
          aValue = a.totalSpent;
          bValue = b.totalSpent;
          break;
        case 'totalBookings':
          aValue = a.totalBookings;
          bValue = b.totalBookings;
          break;
        case 'lastBooking':
          aValue = new Date(a.lastBooking).getTime();
          bValue = new Date(b.lastBooking).getTime();
          break;
        default:
          aValue = a.totalSpent;
          bValue = b.totalSpent;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredAndSortedCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewCustomer = (customer: Customer) => {
    // Navigate to dedicated client detail page
    navigate(`/admin/clients/${encodeURIComponent(customer.email)}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f29520]"></div>
        <span className="ml-2 text-sm text-gray-600">Processing customer data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-blue-100 text-sm font-medium uppercase tracking-wide">Total Customers</div>
              <div className="text-3xl font-bold mt-2">{customers.length}</div>
              <div className="text-blue-200 text-sm mt-1">Unique customers</div>
            </div>
            <div className="w-12 h-12 bg-blue-400 bg-opacity-30 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-green-100 text-sm font-medium uppercase tracking-wide">Active Customers</div>
              <div className="text-3xl font-bold mt-2">{customers.filter(c => c.status === 'active').length}</div>
              <div className="text-green-200 text-sm mt-1">Recent activity</div>
            </div>
            <div className="w-12 h-12 bg-green-400 bg-opacity-30 rounded-xl flex items-center justify-center">
              <Activity className="h-6 w-6" />
            </div>
          </div>
        </div>
        
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-orange-100 text-sm font-medium uppercase tracking-wide">Total Revenue</div>
              <div className="text-3xl font-bold mt-2">{formatCurrency(customers.reduce((sum, c) => sum + c.totalSpent, 0))}</div>
              <div className="text-orange-200 text-sm mt-1">All customers</div>
            </div>
            <div className="w-12 h-12 bg-orange-400 bg-opacity-30 rounded-xl flex items-center justify-center">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Search and Filter Controls */}
      <div className="rounded-2xl overflow-hidden border border-gray-200">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="font-semibold">Customers — Filters</div>
          <div className="text-xs opacity-90">Refine the list by status, type, and search</div>
        </div>
        <div className="bg-white p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, or nationality..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-[#f29520] focus:border-[#f29520] placeholder-gray-500"
                />
              </div>
            </div>
            
            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative min-w-[160px]">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="w-full pl-12 pr-10 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-[#f29520] focus:border-[#f29520] appearance-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div className="relative min-w-[160px]">
                <Award className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="w-full pl-12 pr-10 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-[#f29520] focus:border-[#f29520] appearance-none cursor-pointer"
                >
                  <option value="all">All Types</option>
                  <option value="new">New</option>
                  <option value="returning">Returning</option>
                </select>
              </div>
            </div>

            {/* Sort */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative min-w-[180px]">
                <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full pl-12 pr-10 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-[#f29520] focus:border-[#f29520] appearance-none cursor-pointer"
                >
                  <option value="totalSpent">Total Spent</option>
                  <option value="name">Name</option>
                  <option value="totalBookings">Total Bookings</option>
                  <option value="lastBooking">Last Booking</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
        
        {/* Results Summary */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{paginatedCustomers.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{filteredAndSortedCustomers.length}</span> customers
          </div>
          <div className="flex items-center space-x-2">
            <button className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button 
              onClick={() => processCustomerData()}
              className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      
      {/* Customer Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedCustomers.map((customer) => (
            <CustomerCard key={customer.id} customer={customer} onView={handleViewCustomer} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Bookings</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Spent</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Last Activity</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedCustomers.map((customer) => (
                  <CustomerRow key={customer.id} customer={customer} onView={handleViewCustomer} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-2xl shadow-lg border border-gray-100 px-6 py-4">
          <div className="text-sm text-gray-600">
            Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
            >
              Previous
            </button>
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredAndSortedCustomers.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">No customers found</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            {searchTerm || filterStatus !== 'all' || filterType !== 'all'
              ? 'Try adjusting your search criteria or filters to find more results.'
              : 'No customers have been registered yet. They will appear here once bookings are made.'}
          </p>
          {(searchTerm || filterStatus !== 'all' || filterType !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setFilterType('all');
              }}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}


    </div>
  );
};

// Customer Card Component for Grid View
interface CustomerCardProps {
  customer: Customer;
  onView: (customer: Customer) => void;
}

const CustomerCard: React.FC<CustomerCardProps> = ({ customer, onView }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const headerBg = 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white';

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
      {/* Header */}
      <div className={`${headerBg} p-4`}>
        <div className="flex items-center justify-between">
          <div />
          <div className={`w-12 h-12 rounded-full ${customer.status === 'active' ? 'bg-white bg-opacity-20' : 'bg-gray-500 bg-opacity-20'} flex items-center justify-center`}>
            <span className="text-lg font-bold">
              {customer.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{customer.name}</h3>
          <p className="text-sm text-gray-600 truncate">{customer.email}</p>
          {customer.nationality && (
            <div className="flex items-center mt-2 text-xs text-gray-500">
              <MapPin className="w-3 h-3 mr-1" />
              <span>{customer.nationality}</span>
            </div>
          )}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-blue-600">{customer.totalBookings}</div>
            <div className="text-xs text-gray-600 uppercase tracking-wide">Bookings</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <div className="text-lg font-bold text-green-600">{formatCurrency(customer.totalSpent)}</div>
            <div className="text-xs text-gray-600 uppercase tracking-wide">Total Spent</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-4 p-3 bg-gray-50 rounded-xl">
          <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
            <span>Average per booking</span>
            <span className="font-semibold text-gray-900">{formatCurrency(customer.averageBookingValue)}</span>
          </div>
          <div className="flex justify-between items-center text-xs text-gray-600">
            <span>Last activity</span>
            <span className="font-semibold text-gray-900">{customer.daysSinceLastBooking} days ago</span>
          </div>
        </div>

        {/* Status and Last Activity */}
        <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
            customer.status === 'active'
              ? 'bg-green-100 text-green-800 border-green-200'
              : 'bg-gray-100 text-gray-800 border-gray-200'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              customer.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
            {customer.status}
          </span>
          <div className="text-xs text-gray-500">
            <Clock className="w-3 h-3 inline mr-1" />
            {formatDate(customer.lastBooking)}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onView(customer)}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 group-hover:shadow-lg"
        >
          <Eye className="w-4 h-4 inline mr-2" />
          View Full Profile
        </button>
      </div>
    </div>
  );
};

// Customer Row Component for List View
interface CustomerRowProps {
  customer: Customer;
  onView: (customer: Customer) => void;
}

const CustomerRow: React.FC<CustomerRowProps> = ({ customer, onView }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  
  return (
    <tr className="hover:bg-blue-50 transition-colors duration-150">
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-12 w-12">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center shadow-md">
              <span className="text-sm font-bold text-white">
                {customer.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-semibold text-gray-900">{customer.name}</div>
            <div className="text-sm text-gray-600">{customer.email}</div>
            {customer.nationality && (
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <MapPin className="w-3 h-3 mr-1" />
                <span>{customer.nationality}</span>
              </div>
            )}
          </div>
        </div>
      </td>

      <td className="px-6 py-4">
        <span className="text-xs text-gray-500">—</span>
      </td>
      
      <td className="px-6 py-4">
        <div className="text-lg font-bold text-gray-900">{customer.totalBookings}</div>
        <div className="text-xs text-gray-500">
          Avg: {formatCurrency(customer.averageBookingValue)}
        </div>
      </td>
      
      <td className="px-6 py-4">
        <div className="text-lg font-bold text-green-600">
          {formatCurrency(customer.totalSpent)}
        </div>
      </td>
      
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900">{formatDate(customer.lastBooking)}</div>
        <div className="text-xs text-gray-500">
          {customer.daysSinceLastBooking} days ago
        </div>
      </td>
      
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onView(customer)}
            className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 font-medium text-sm"
          >
            <Eye className="w-4 h-4 mr-2" />
            View
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};



export default CustomerManagement;