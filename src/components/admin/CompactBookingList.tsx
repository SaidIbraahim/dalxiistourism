import React from 'react';
import { Search, Filter, Download, FileSpreadsheet } from 'lucide-react';
import { exportBookingsToExcel } from '../../utils/excelExport';
import BookingCard from './BookingCard';
import BulkActionsStrip from './booking/BulkActionsStrip';

interface CompactBookingListProps {
  bookings: Array<{
    id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string | null;
    package_name?: string;
    destination_name?: string;
    booking_date: string;
    participants: number;
    total_amount: number;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
    payment_status: 'pending' | 'paid' | 'refunded';
    special_requests: string | null;
    created_at?: string;
  }>;
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

const CompactBookingList: React.FC<CompactBookingListProps> = ({
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
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.package_name && booking.package_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.destination_name && booking.destination_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    const matchesDate = dateFilter === 'all' || 
      (dateFilter === 'today' && new Date(booking.booking_date).toDateString() === new Date().toDateString()) ||
      (dateFilter === 'week' && new Date(booking.booking_date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (dateFilter === 'month' && new Date(booking.booking_date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const allSelected = filteredBookings.length > 0 && selectedBookings.length === filteredBookings.length;

  const handleExport = () => {
    try {
      exportBookingsToExcel(bookings as any, 'dalxiis-bookings-filtered');
      onExport(); // Call the parent's onExport callback
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Search and Filters */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search bookings by customer name, email, package, or destination..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f29520] focus:border-transparent text-sm"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f29520] focus:border-transparent text-sm bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => onDateFilterChange(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f29520] focus:border-transparent text-sm bg-white"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      <BulkActionsStrip
        selectedCount={selectedBookings.length}
        totalCount={filteredBookings.length}
        onBulkAction={onBulkAction}
        onSelectAll={onSelectAll}
        allSelected={allSelected}
      />



      {/* Enhanced Bookings Grid */}
      {filteredBookings.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onStatusChange={onStatusChange}
              onView={onView}
              onEdit={onEdit}
              isSelected={selectedBookings.includes(booking.id)}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
              ? 'Try adjusting your search or filter criteria to find more results.'
              : 'Get started by creating a new booking or importing existing data.'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && dateFilter === 'all' && (
            <button className="mt-4 bg-[#f29520] text-white px-6 py-2 rounded-lg hover:bg-[#e08518] transition-colors">
              Create First Booking
            </button>
          )}
        </div>
      )}

      {/* Enhanced Export Options */}
      {filteredBookings.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-6 border-t border-gray-200 gap-4">
          <div className="text-sm text-gray-500">
            <span className="font-medium">Showing {filteredBookings.length}</span> of {bookings.length} total bookings
            {searchTerm && <span className="ml-2">• Filtered by "{searchTerm}"</span>}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onExport}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export to Excel</span>
            </button>
            <button className="flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompactBookingList;
