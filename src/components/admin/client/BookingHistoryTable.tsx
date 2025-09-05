import React, { useState, useMemo } from 'react';
import { 
  Calendar, Search, Filter, ChevronLeft, ChevronRight, 
  Eye, FileText, Printer, XCircle, Download, SortAsc, SortDesc,
  AlertCircle, CheckCircle, Clock, DollarSign, User, MapPin
} from 'lucide-react';
import { formatBookingId } from '../../../utils/bookingIdGenerator';

interface Booking {
  id: string;
  package_name?: string;
  destination_name?: string;
  booking_date: string;
  end_date: string | null;
  adults: number;
  children: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
  payment_status: 'pending' | 'paid' | 'refunded';
  payment_method?: 'cash' | 'sahal' | 'e_dahab' | 'mycash' | 'bank_transfer' | 'cheque' | 'other';
  special_requests: string | null;
  selected_services: Array<{
    id: string;
    name: string;
    price: number;
    category: string;
    quantity: number;
  }> | null;
  created_at: string;
  updated_at: string;
}

interface BookingHistoryTableProps {
  bookings: Booking[];
  onViewBooking: (bookingId: string) => void;
  onViewInvoice: (bookingId: string) => void;
  onPrintTicket: (bookingId: string) => void;
  onDownloadInvoice: (bookingId: string) => void;
  onCancelRefund: (bookingId: string) => void;
}

const BookingHistoryTable: React.FC<BookingHistoryTableProps> = ({
  bookings,
  onViewBooking,
  onViewInvoice,
  onPrintTicket,
  onDownloadInvoice,
  onCancelRefund
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const filteredAndSortedBookings = useMemo(() => {
    let filtered = bookings.filter(booking => {
      // Search filter
      const matchesSearch = !searchTerm || 
        booking.package_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.destination_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatBookingId(booking.id, booking.created_at, 'short').toLowerCase().includes(searchTerm.toLowerCase());

      // Date range filter
      const bookingDate = new Date(booking.booking_date);
      const matchesDateFrom = !dateFrom || bookingDate >= new Date(dateFrom);
      const matchesDateTo = !dateTo || bookingDate <= new Date(dateTo);

      // Status filter
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

      return matchesSearch && matchesDateFrom && matchesDateTo && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'amount':
          aValue = a.total_amount;
          bValue = b.total_amount;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default: // date
          aValue = new Date(a.booking_date).getTime();
          bValue = new Date(b.booking_date).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [bookings, searchTerm, dateFrom, dateTo, statusFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedBookings.length / itemsPerPage);
  const paginatedBookings = filteredAndSortedBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const canPrintTicket = (booking: Booking) => {
    return booking.payment_status === 'paid' && booking.status === 'confirmed';
  };

  const canCancelRefund = (booking: Booking) => {
    return ['confirmed', 'pending'].includes(booking.status) && booking.payment_status !== 'refunded';
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Bookings</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by service, destination, or booking ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <div className="flex space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="status">Status</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {sortOrder === 'asc' ? <SortAsc className="w-5 h-5" /> : <SortDesc className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Date Range Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
            >
              Clear Filters
            </button>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {/* TODO: Export filtered results */}}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium flex items-center justify-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold">{paginatedBookings.length}</span> of{' '}
            <span className="font-semibold">{filteredAndSortedBookings.length}</span> bookings
          </div>
          {(searchTerm || dateFrom || dateTo || statusFilter !== 'all') && (
            <div className="text-sm text-blue-600">
              Filters active • <button onClick={clearFilters} className="underline hover:no-underline">Clear all</button>
            </div>
          )}
        </div>
      </div>

      {/* Booking Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {paginatedBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Booking Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Travel Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{booking.package_name || 'Custom Package'}</div>
                        <div className="text-sm text-gray-600 flex items-center mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {booking.destination_name || 'Multiple Destinations'}
                        </div>
                        <div className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded mt-2 inline-block">
                          {formatBookingId(booking.id, booking.created_at, 'short')}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{formatDate(booking.booking_date)}</div>
                        {booking.end_date && (
                          <div className="text-sm text-gray-600">to {formatDate(booking.end_date)}</div>
                        )}
                        <div className="text-xs text-gray-500 mt-1 flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {booking.adults + booking.children} guest{(booking.adults + booking.children) !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{formatCurrency(booking.total_amount)}</div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getStatusIcon(booking.status)}
                        <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          booking.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                          booking.payment_status === 'refunded' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.payment_status}
                        </span>
                        {booking.payment_method && (
                          <div className="text-xs text-gray-500 mt-1 capitalize">
                            via {booking.payment_method}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        {/* View Details */}
                        <button
                          onClick={() => onViewBooking(booking.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="View Booking Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {/* View Invoice */}
                        <button
                          onClick={() => onViewInvoice(booking.id)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                          title={booking.payment_status === 'paid' ? 'View Receipt' : 'View Invoice'}
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        
                        {/* Print Ticket */}
                        <button
                          onClick={() => canPrintTicket(booking) ? onPrintTicket(booking.id) : null}
                          disabled={!canPrintTicket(booking)}
                          className={`p-2 rounded-lg transition-colors duration-200 ${
                            canPrintTicket(booking)
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-gray-300 cursor-not-allowed'
                          }`}
                          title={
                            canPrintTicket(booking)
                              ? 'Print Ticket'
                              : 'Print Ticket (Only available for system-paid bookings)'
                          }
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        
                        {/* Download Invoice */}
                        <button
                          onClick={() => onDownloadInvoice(booking.id)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                          title="Download Invoice"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        
                        {/* Cancel/Refund */}
                        <button
                          onClick={() => canCancelRefund(booking) ? onCancelRefund(booking.id) : null}
                          disabled={!canCancelRefund(booking)}
                          className={`p-2 rounded-lg transition-colors duration-200 ${
                            canCancelRefund(booking)
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-gray-300 cursor-not-allowed'
                          }`}
                          title={
                            canCancelRefund(booking)
                              ? 'Cancel/Refund Booking'
                              : 'Cancel/Refund (Not available for this booking status)'
                          }
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-500">
              {searchTerm || dateFrom || dateTo || statusFilter !== 'all'
                ? 'Try adjusting your search criteria or filters.'
                : 'This customer has no booking history yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-6 py-4">
          <div className="text-sm text-gray-600">
            Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
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
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium flex items-center"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingHistoryTable;