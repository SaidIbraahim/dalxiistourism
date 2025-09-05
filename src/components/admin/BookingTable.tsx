import React from 'react';
import { Eye, Edit, Check, X, Clock, User, Calendar, DollarSign, MapPin } from 'lucide-react';
import { exportBookingsToExcel } from '../../utils/excelExport';
import { colors, components, getStatusColor, getPaymentColor, getBadgeClass } from '../../styles/designSystem';
import { formatBookingId } from '../../utils/bookingIdGenerator';

interface BookingTableProps {
  bookings: Array<{
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

    created_at?: string;
    updated_at?: string;
  }>;
  searchTerm: string;
  statusFilter: string;
  dateFilter: string;
  selectedBookings: string[];
  onStatusChange: (bookingId: string, newStatus: string) => void;
  onView: (bookingId: string) => void;
  onEdit: (bookingId: string) => void;
  onSelect: (bookingId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onBulkAction: (action: string) => void;
}

const BookingTable: React.FC<BookingTableProps> = ({
  bookings,
  searchTerm,
  statusFilter,
  dateFilter,
  selectedBookings,
  onStatusChange,
  onView,
  onEdit,
  onSelect,
  onSelectAll,
  onBulkAction
}) => {
  const filteredBookings = bookings.filter(booking => {
    const friendlyId = formatBookingId(booking.id, booking.created_at, 'short');
    const fullFriendlyId = formatBookingId(booking.id, booking.created_at, 'full');
    
    const matchesSearch = 
      booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.package_name && booking.package_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.destination_name && booking.destination_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      friendlyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fullFriendlyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    const matchesDate = dateFilter === 'all' || 
      (dateFilter === 'today' && new Date(booking.booking_date).toDateString() === new Date().toDateString()) ||
      (dateFilter === 'week' && new Date(booking.booking_date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (dateFilter === 'month' && new Date(booking.booking_date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const allSelected = filteredBookings.length > 0 && selectedBookings.length === filteredBookings.length;

  const getStatusBadgeClass = (status: string) => {
    return getBadgeClass(status);
  };

  const getPaymentStatusColor = (status: string) => {
    const paymentColors = getPaymentColor(status);
    return `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${paymentColors.bg} ${paymentColors.text}`;
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

  return (
    <div className="space-y-6">
      {/* Standardized Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        {filteredBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <span>Customer</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <span>Services</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span>Travel Date</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span>Status</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center justify-end space-x-2">
                      <DollarSign className="w-4 h-4 text-green-700" />
                      <span>Amount</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking, index) => (
                  <tr key={booking.id} className="hover:bg-blue-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center">
                            <span className="text-sm font-bold text-white">
                              {booking.customer_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">{booking.customer_name}</div>
                          <div className="text-sm text-gray-500">{booking.customer_email}</div>
                          <div className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded mt-1 inline-block">
                            {formatBookingId(booking.id, booking.created_at, 'short')}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.package_name || 'Custom Services'}
                      </div>
                      <div className="text-sm text-gray-500">
                        📍 {booking.destination_name || 'Multiple Destinations'}
                      </div>
                      {booking.selected_services && booking.selected_services.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                            {booking.selected_services.length} service{booking.selected_services.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </td>
                    
                    <td className="min-w-[180px] px-6 py-6">
                      <div className="space-y-2">
                        <p className="text-base font-semibold text-gray-900 whitespace-nowrap">
                          {formatDate(booking.booking_date)}
                        </p>
                        {booking.end_date && (
                          <p className="text-sm text-gray-700 whitespace-nowrap">
                            → {formatDate(booking.end_date)}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          {booking.adults + booking.children} guest{(booking.adults + booking.children) !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </td>
                    
                    <td className="min-w-[140px] px-6 py-6">
                      <div className="flex justify-center">
                        <div className="inline-flex items-center px-3 py-2 rounded-full text-sm font-bold border-2 shadow-sm bg-white whitespace-nowrap">
                          {booking.status === 'pending' && (
                            <>
                              <span className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></span>
                              <span className="text-yellow-800">Pending</span>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <>
                              <span className="w-3 h-3 bg-green-400 rounded-full mr-2"></span>
                              <span className="text-green-800">Confirmed</span>
                            </>
                          )}
                          {booking.status === 'completed' && (
                            <>
                              <span className="w-3 h-3 bg-blue-400 rounded-full mr-2"></span>
                              <span className="text-blue-800">Completed</span>
                            </>
                          )}
                          {booking.status === 'cancelled' && (
                            <>
                              <span className="w-3 h-3 bg-gray-400 rounded-full mr-2"></span>
                              <span className="text-gray-800">Cancelled</span>
                            </>
                          )}
                          {booking.status === 'rejected' && (
                            <>
                              <span className="w-3 h-3 bg-red-400 rounded-full mr-2"></span>
                              <span className="text-red-800">Rejected</span>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="min-w-[120px] px-6 py-6">
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900 whitespace-nowrap">
                          {formatCurrency(booking.total_amount)}
                        </p>
                      </div>
                    </td>
                    
                    <td className="min-w-[200px] px-6 py-6">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => onView(booking.id)}
                          className="p-3 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200 hover:shadow-md hover:scale-105 border-2 border-transparent hover:border-blue-300"
                          title="👁️ View Full Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => onEdit(booking.id)}
                          className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:shadow-md hover:scale-105 border-2 border-transparent hover:border-gray-300"
                          title="✏️ Edit Booking"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => onStatusChange(booking.id, 'confirmed')}
                              className="p-3 text-green-600 hover:bg-green-100 rounded-lg transition-all duration-200 hover:shadow-md hover:scale-105 border-2 border-transparent hover:border-green-300"
                              title="✅ Approve Booking"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => onStatusChange(booking.id, 'rejected')}
                              className="p-3 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 hover:shadow-md hover:scale-105 border-2 border-transparent hover:border-red-300"
                              title="❌ Reject Booking"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => onStatusChange(booking.id, 'completed')}
                            className="p-3 text-purple-600 hover:bg-purple-100 rounded-lg transition-all duration-200 hover:shadow-md hover:scale-105 border-2 border-transparent hover:border-purple-300"
                            title="✅ Mark as Completed"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">No bookings found</h3>
            <p className="text-sm text-gray-600 max-w-md mx-auto mb-6 leading-relaxed">
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your search or filter criteria to find more results. You can also clear all filters to see all bookings.'
                : 'No bookings have been submitted yet. When customers make bookings through the website, they will appear here for you to manage.'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && dateFilter === 'all' ? (
              <div className="space-y-3">
                <button className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-cyan-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 shadow-md">
                  📝 Create Manual Booking
                </button>
                <p className="text-xs text-gray-500">Or wait for customers to submit bookings online</p>
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                Try adjusting your search or filter criteria to find more results.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Results Summary */}
      {filteredBookings.length > 0 && (
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-t-2 border-blue-200 px-4 py-3 rounded-b-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                <span className="font-bold text-blue-600">{filteredBookings.length}</span> of <span className="font-medium">{bookings.length}</span> bookings
                {searchTerm && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    🔍 "{searchTerm}"
                  </span>
                )}
              </div>
              {(statusFilter !== 'all' || dateFilter !== 'all') && (
                <div className="flex items-center space-x-2">
                  {statusFilter !== 'all' && (
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                      Status: {statusFilter}
                    </span>
                  )}
                  {dateFilter !== 'all' && (
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                      Date: {dateFilter}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Live data</span>
              </div>
              <span>Updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingTable;