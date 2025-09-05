import React, { useState, useEffect } from 'react';
import { 
  User, Calendar, MapPin, DollarSign, Clock, Check, X, Eye, 
  Filter, Search, SortAsc, SortDesc, Grid, List, Users, Phone, Mail,
  AlertCircle, CheckCircle, Star, Award
} from 'lucide-react';
import { formatBookingId } from '../../../utils/bookingIdGenerator';

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  gender: string | null;
  nationality: string | null;
  package_name?: string;
  destination_name?: string;
  booking_date: string;
  end_date: string | null;
  participants: number;
  adults: number;
  children: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
  payment_status: 'pending' | 'paid' | 'refunded';
  dietary_requirements: string | null;
  selected_services: Array<{
    id: string;
    name: string;
    price: number;
    category: string;
    quantity: number;
  }> | null;
  special_requests: string | null;
  created_at: string;
  updated_at: string;
}

interface IncomingRequestsViewProps {
  bookings: Booking[];
  searchTerm: string;
  statusFilter: string;
  dateFilter: string;
  selectedBookings: string[];
  onSearchChange: (term: string) => void;
  onStatusFilterChange: (status: string) => void;
  onDateFilterChange: (date: string) => void;
  onStatusChange: (bookingId: string, newStatus: string) => void;
  onView: (bookingId: string) => void;
  onEdit: (bookingId: string) => void;
  onSelect: (bookingId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onBulkAction: (action: string) => void;
  onExport: () => void;
}

const IncomingRequestsView: React.FC<IncomingRequestsViewProps> = ({
  bookings,
  searchTerm,
  statusFilter,
  dateFilter,
  selectedBookings,
  onSearchChange,
  onStatusFilterChange,
  onDateFilterChange,
  onStatusChange,
  onView,
  onEdit,
  onSelect,
  onSelectAll,
  onBulkAction,
  onExport
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'compact'>('cards');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return formatDate(dateString);
  };

  const getUrgencyLevel = (booking: Booking) => {
    const hoursOld = Math.floor((Date.now() - new Date(booking.created_at).getTime()) / (1000 * 60 * 60));
    const bookingDate = new Date(booking.booking_date);
    const daysUntilTravel = Math.floor((bookingDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    if (hoursOld > 48) return 'high'; // Old request
    if (daysUntilTravel <= 7) return 'high'; // Travel soon
    if (hoursOld > 24) return 'medium';
    return 'low';
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      default: return 'border-l-green-500 bg-green-50';
    }
  };

  const sortedBookings = [...bookings].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'amount':
        aValue = a.total_amount;
        bValue = b.total_amount;
        break;
      case 'name':
        aValue = a.customer_name.toLowerCase();
        bValue = b.customer_name.toLowerCase();
        break;
      default: // date
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const totalPages = Math.max(1, Math.ceil(sortedBookings.length / pageSize));
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortOrder, viewMode, bookings.length]);

  const RequestCard: React.FC<{ booking: Booking }> = ({ booking }) => {
    const urgencyLevel = getUrgencyLevel(booking);
    const urgencyColor = getUrgencyColor(urgencyLevel);
    const isSelected = selectedBookings.includes(booking.id);

    const bgTint =
      urgencyLevel === 'high'
        ? 'bg-red-50'
        : urgencyLevel === 'medium'
        ? 'bg-amber-50'
        : 'bg-emerald-50';

    return (
      <div className={`relative rounded-2xl border border-gray-200 ${bgTint} shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden`}> 
        {/* Gradient accent bar */}
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500" />

        {/* Header */}
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onSelect(booking.id, e.target.checked)}
                className="w-4 h-4 text-[#f29520] border-gray-300 rounded focus:ring-[#f29520]"
              />
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center ring-2 ring-white/70 shadow">
                <span className="text-sm font-bold text-white">
                  {booking.customer_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{booking.customer_name}</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Mail className="w-3 h-3" />
                  <span>{booking.customer_email}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700 shadow-sm">
                {formatCurrency(booking.total_amount)}
              </div>
              <div className="text-xs text-gray-500 mt-1">{formatTimeAgo(booking.created_at)}</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Service Info */}
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                <span className="font-medium">Service</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">{booking.package_name || 'Custom Package'}</div>
                <div className="text-sm text-gray-600">{booking.destination_name}</div>
                {booking.selected_services && (
                  <div className="text-xs text-gray-500 mt-1">
                    {booking.selected_services.length} service{booking.selected_services.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>

            {/* Travel Info */}
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                <span className="font-medium">Travel Date</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">{formatDate(booking.booking_date)}</div>
                {booking.end_date && (
                  <div className="text-sm text-gray-600">to {formatDate(booking.end_date)}</div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  <Users className="w-3 h-3 inline mr-1" />
                  {booking.adults + booking.children} guest{(booking.adults + booking.children) !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <User className="w-4 h-4 mr-2 text-green-600" />
                <span className="font-medium">Contact</span>
              </div>
              <div>
                {booking.customer_phone && (
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <Phone className="w-3 h-3 mr-1" />
                    <span>{booking.customer_phone}</span>
                  </div>
                )}
                {booking.nationality && (
                  <div className="text-sm text-gray-600">
                    📍 {booking.nationality}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Special Requests */}
          {booking.special_requests && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">Special Requests</div>
              <div className="text-sm text-blue-800">{booking.special_requests}</div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono bg-white text-gray-700 px-2 py-1 rounded border border-gray-200 shadow-sm">
                {formatBookingId(booking.id, booking.created_at, 'short')}
              </span>
              {urgencyLevel === 'high' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Urgent
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onView(booking.id)}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => onStatusChange(booking.id, 'rejected')}
                className="px-3 py-2 bg-red-600/10 text-red-700 rounded-lg hover:bg-red-600/20 transition-colors duration-200 text-sm font-medium"
              >
                <X className="w-4 h-4 inline mr-1" />
                Reject
              </button>
              <button
                onClick={() => onStatusChange(booking.id, 'confirmed')}
                className="px-3 py-2 bg-emerald-600/10 text-emerald-700 rounded-lg hover:bg-emerald-600/20 transition-colors duration-200 text-sm font-medium"
              >
                <Check className="w-4 h-4 inline mr-1" />
                Approve
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CompactRow: React.FC<{ booking: Booking }> = ({ booking }) => {
    const urgencyLevel = getUrgencyLevel(booking);
    const isSelected = selectedBookings.includes(booking.id);

    return (
      <div className={`bg-white border-l-4 ${getUrgencyColor(urgencyLevel)} p-4 hover:bg-gray-50 transition-colors duration-200`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(booking.id, e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {booking.customer_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-4">
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 truncate">{booking.customer_name}</div>
                  <div className="text-sm text-gray-500 truncate">{booking.customer_email}</div>
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-gray-900">{booking.package_name || 'Custom'}</div>
                  <div className="text-xs text-gray-500">{booking.destination_name}</div>
                </div>
                <div className="hidden lg:block">
                  <div className="text-sm text-gray-900">{formatDate(booking.booking_date)}</div>
                  <div className="text-xs text-gray-500">{booking.adults + booking.children} guests</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">{formatCurrency(booking.total_amount)}</div>
                  <div className="text-xs text-gray-500">{formatTimeAgo(booking.created_at)}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            {urgencyLevel === 'high' && (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
            <button
              onClick={() => onView(booking.id)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onStatusChange(booking.id, 'rejected')}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={() => onStatusChange(booking.id, 'confirmed')}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Incoming Requests</h2>
          <p className="text-sm text-gray-600 mt-1">
            {bookings.length} pending request{bookings.length !== 1 ? 's' : ''} • 
            {bookings.filter(b => getUrgencyLevel(b) === 'high').length} urgent
          </p>
        </div>
        
        {/* Bulk Actions */}
        {selectedBookings.length > 0 && (
          <div className="flex items-center space-x-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <span className="text-sm font-medium text-blue-900">
              {selectedBookings.length} selected
            </span>
            <button
              onClick={() => onBulkAction('approve')}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors duration-200"
            >
              Approve All
            </button>
            <button
              onClick={() => onBulkAction('reject')}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors duration-200"
            >
              Reject All
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Filters */}
      <div className="rounded-xl overflow-hidden border border-gray-200">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 flex items-center justify-between">
          <div className="font-semibold">Incoming Requests — Filters</div>
          <div className="text-xs opacity-90">Use search and sort to narrow results</div>
        </div>
        <div className="bg-white p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by customer name, email, or service..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white text-gray-900 placeholder:text-gray-500 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#f29520] focus:border-[#f29520]"
                />
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex items-center space-x-3">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-3 bg-white text-gray-800 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#f29520] focus:border-[#f29520]"
              >
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
                <option value="name">Sort by Name</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-3 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200"
              >
                {sortOrder === 'asc' ? <SortAsc className="w-5 h-5" /> : <SortDesc className="w-5 h-5" />}
              </button>
              
              {/* View Mode */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-2 rounded-md transition-colors duration-200 ${
                    viewMode === 'cards' 
                      ? 'bg-white shadow-sm text-[#f29520]' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('compact')}
                  className={`px-3 py-2 rounded-md transition-colors duration-200 ${
                    viewMode === 'compact' 
                      ? 'bg-white shadow-sm text-[#f29520]' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              
              <button
                onClick={onExport}
                className="px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200 font-medium"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Select All */}
      {bookings.length > 0 && (
        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedBookings.length === bookings.length}
              onChange={(e) => onSelectAll(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Select all {bookings.length} request{bookings.length !== 1 ? 's' : ''}
            </span>
          </label>
          <div className="text-sm text-gray-500">
            {selectedBookings.length} of {bookings.length} selected
          </div>
        </div>
      )}

      {/* Requests Display with pagination */}
      {bookings.length > 0 ? (
        <>
          <div className={viewMode === 'cards' ? 'grid grid-cols-1 xl:grid-cols-2 gap-6' : 'space-y-2'}>
            {sortedBookings.slice((currentPage-1)*pageSize, currentPage*pageSize).map((booking) => (
              viewMode === 'cards' ? (
                <RequestCard key={booking.id} booking={booking} />
              ) : (
                <CompactRow key={booking.id} booking={booking} />
              )
            ))}
          </div>
          {/* Pagination Controls */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {(currentPage-1)*pageSize + 1}–{Math.min(currentPage*pageSize, sortedBookings.length)} of {sortedBookings.length}
            </div>
            <div className="inline-flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p-1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p+1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h3>
          <p className="text-gray-500">No pending requests at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default IncomingRequestsView;