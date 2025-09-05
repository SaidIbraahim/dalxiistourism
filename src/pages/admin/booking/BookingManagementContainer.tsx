import React, { useState, useEffect } from 'react';
import { useToast } from '../../../context/ToastContext';
import { exportBookingsToExcel } from '../../../utils/excelExport';
import { BookingsService } from '../../../services/api';
import BookingTabs from '../../../components/admin/booking/BookingTabs';
import BookingTable from '../../../components/admin/BookingTable';
import BookingFilters from '../../../components/admin/booking/BookingFilters';
import BookingDetailsModal from '../../../components/admin/BookingDetailsModal';
import AdminBookingForm from '../../../components/admin/booking/form/AdminBookingForm';
import { DataService } from '../../../services/dataService';
import CustomerManagement from '../../../components/admin/CustomerManagement';
import IncomingRequestsView from '../../../components/admin/booking/IncomingRequestsView';
import { usePackages } from '../../../stores/appStore';

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

const BookingManagementContainer: React.FC = () => {
  const { showToast } = useToast();
  const packages = usePackages();
  const [activeTab, setActiveTab] = useState<'incoming' | 'customers'>('incoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
  const [selectedBookingForView, setSelectedBookingForView] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await BookingsService.getBookings(1, 100);
      if (response.success && response.data) {
        const transformedBookings: Booking[] = (response.data as any[]).map((booking: any) => ({
          id: booking.id,
          customer_name: booking.customer_name,
          customer_email: booking.customer_email,
          customer_phone: booking.customer_phone,
          gender: booking.gender,
          nationality: booking.nationality,
          package_name: getPackageNameFromServices(booking.selected_services),
          destination_name: getDestinationFromServices(booking.selected_services),
          booking_date: booking.booking_date,
          end_date: booking.end_date,
          participants: booking.participants,
          adults: booking.adults || 1,
          children: booking.children || 0,
          total_amount: parseFloat(booking.total_amount.toString()),
          status: booking.status as 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected',
          payment_status: booking.payment_status as 'pending' | 'paid' | 'refunded',
          dietary_requirements: booking.dietary_requirements,
          selected_services: booking.selected_services as any,
          special_requests: booking.special_requests,
          created_at: booking.created_at,
          updated_at: booking.updated_at
        }));
        setBookings(transformedBookings);
        // Removed automatic success notification to prevent duplicates
      } else {
        throw new Error(response.error?.message || 'Failed to fetch bookings');
      }
    } catch (error: any) {
      console.error('Failed to load bookings:', error);
      showToast('error', 'Error', `Failed to load bookings: ${error.message}`);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const getPackageNameFromServices = (services: any): string => {
    if (!services || !Array.isArray(services)) return 'Custom Services';
    const packageService = services.find((s: any) => s.category === 'Package');
    if (packageService) return packageService.name;
    if (services.length === 1) return services[0].name;
    if (services.length > 1) return `${services.length} Services`;
    return 'Custom Services';
  };

  const getDestinationFromServices = (services: any): string => {
    if (!services || !Array.isArray(services)) return 'Multiple Destinations';
    const destinations = services
      .map((s: any) => s.location || s.destination)
      .filter(Boolean)
      .filter((dest: any, index: number, arr: any[]) => arr.indexOf(dest) === index);
    if (destinations.length === 1) return destinations[0];
    if (destinations.length > 1) return 'Multiple Destinations';
    return 'Multiple Destinations';
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
    // Removed automatic refresh notification to prevent duplicates
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const response = await BookingsService.updateBookingStatus(
        bookingId,
        newStatus as 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected'
      );
      if (response.success && response.data) {
        setBookings(prev => prev.map(booking =>
          booking.id === bookingId
            ? { ...booking, status: newStatus as any, updated_at: response.data!.updated_at }
            : booking
        ));
        if (selectedBookingForView?.id === bookingId) {
          setSelectedBookingForView(prev => prev ? { ...prev, status: newStatus as any, updated_at: response.data!.updated_at } : null);
        }
        showToast('success', 'Success', `Booking status updated to ${newStatus}`);
      } else {
        throw new Error(response.error?.message || 'Failed to update status');
      }
    } catch (error: any) {
      console.error('Status update failed:', error);
      showToast('error', 'Error', `Failed to update booking status: ${error.message}`);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedBookings.length === 0) {
      showToast('warning', 'Warning', 'Please select bookings first');
      return;
    }
    try {
      let newStatus: string;
      switch (action) {
        case 'approve':
          newStatus = 'confirmed';
          break;
        case 'reject':
          newStatus = 'rejected';
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }
      const updatePromises = selectedBookings.map(bookingId =>
        BookingsService.updateBookingStatus(
          bookingId,
          newStatus as 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected'
        )
      );
      const results = await Promise.allSettled(updatePromises);
      const successCount = results.filter(result => result.status === 'fulfilled' && (result as any).value.success).length;
      if (successCount > 0) {
        await loadBookings();
        showToast('success', 'Success', `${successCount} booking(s) ${action}d successfully`);
      }
      if (successCount < selectedBookings.length) {
        const failedCount = selectedBookings.length - successCount;
        showToast('warning', 'Warning', `${failedCount} booking(s) failed to update`);
      }
      setSelectedBookings([]);
    } catch (error: any) {
      console.error('Bulk action failed:', error);
      showToast('error', 'Error', `Failed to perform bulk ${action}: ${error.message}`);
    }
  };

  const handleView = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      setSelectedBookingForView(booking);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBookingForView(null);
  };

  const handleCloseNewBookingModal = () => {
    setIsNewBookingModalOpen(false);
  };

  const handleEdit = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      setSelectedBookingForView(booking);
      setIsModalOpen(true);
      showToast('info', 'Edit Mode', 'Booking details opened for editing');
    }
  };

  const handleSelect = (bookingId: string, selected: boolean) => {
    if (selected) {
      setSelectedBookings(prev => [...prev, bookingId]);
    } else {
      setSelectedBookings(prev => prev.filter(id => id !== bookingId));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedBookings(bookings.map(b => b.id));
    } else {
      setSelectedBookings([]);
    }
  };

  const handleExport = () => {
    try {
      exportBookingsToExcel(bookings as any, 'DLX-bookings-export');
      showToast('success', 'Success', 'Bookings exported to Excel successfully');
    } catch (error) {
      console.error('Export failed:', error);
      showToast('error', 'Error', 'Failed to export bookings');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">Loading booking data...</div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f29520] mx-auto mb-4"></div>
            <p className="text-gray-600">Fetching bookings from database...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-none">
      <div className="flex items-center justify-between">
        <div className="text-base font-medium text-gray-600">Manage client bookings and requests efficiently</div>
        <div className="flex items-center space-x-3">
          <button onClick={handleRefresh} disabled={refreshing} className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button onClick={handleExport} className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md">
            Export to Excel
          </button>
          <button 
            onClick={() => setIsNewBookingModalOpen(true)}
            className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-md"
          >
            + New Booking
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-200">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Pending</div>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-blue-600">{bookings.filter(b => b.status === 'pending').length}</div>
            <span className="text-sm text-blue-600 font-medium">Attention</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-200">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Confirmed</div>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-green-600">{bookings.filter(b => b.status === 'confirmed').length}</div>
            <span className="text-sm text-green-600 font-medium">Active</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-200">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Completed</div>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-purple-600">{bookings.filter(b => b.status === 'completed').length}</div>
            <span className="text-sm text-purple-600 font-medium">Done</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-200">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Customers</div>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-orange-600">{new Set(bookings.map(b => b.customer_email)).size}</div>
            <span className="text-sm text-orange-600 font-medium">Unique</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-100 w-full max-w-none">
        <BookingTabs
          items={[
            { id: 'incoming', label: 'Incoming', count: bookings.filter(b => b.status === 'pending').length },
            { id: 'customers', label: 'Customers', count: new Set(bookings.map(b => b.customer_email)).size }
          ]}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id)}
        />

        <div className="p-6">
          {activeTab === 'incoming' && (
            <IncomingRequestsView
              bookings={bookings.filter(b => b.status === 'pending')}
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              dateFilter={dateFilter}
              selectedBookings={selectedBookings}
              onSearchChange={setSearchTerm}
              onStatusFilterChange={setStatusFilter}
              onDateFilterChange={setDateFilter}
              onStatusChange={handleStatusChange}
              onView={handleView}
              onEdit={handleEdit}
              onSelect={handleSelect}
              onSelectAll={handleSelectAll}
              onBulkAction={handleBulkAction}
              onExport={handleExport}
            />
          )}



          {activeTab === 'customers' && (
            <CustomerManagement bookings={bookings.filter(b => b.status === 'confirmed')} />
          )}
        </div>
      </div>

      <BookingDetailsModal
        booking={selectedBookingForView}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onStatusChange={handleStatusChange}
      />

      {/* New Booking Modal */}
      {isNewBookingModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold">Create New Booking</h2>
                <button
                  onClick={handleCloseNewBookingModal}
                  className="text-white hover:bg-white/20 rounded-full p-3 transition-all duration-200 hover:scale-110"
                  title="Close Modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <AdminBookingForm
                onSubmit={async (values) => {
                  try {
                    // Calculate total amount including package price and selected services
                    const packagePrice = packages.find(p => p.id === values.package_id)?.price || 0;
                    const servicesTotal = (values.selected_services || []).reduce((sum, s) => sum + s.price * (s.quantity || 1), 0);
                    const total_amount = packagePrice + servicesTotal;
                    const payload: any = {
                      customer_name: values.customer_name,
                      customer_email: values.customer_email,
                      customer_phone: values.customer_phone,
                      nationality: values.nationality || null,
                      booking_date: values.booking_date,
                      end_date: values.end_date || null,
                      adults: values.adults,
                      children: values.children,
                      participants: values.adults + values.children,
                      special_requests: values.special_requests || null,
                      dietary_requirements: values.dietary_requirements || null,
                      package_id: values.package_id || null,
                      destination_id: values.destination_id || null,
                      selected_services: values.selected_services || [],
                      total_amount,
                      status: values.status || 'confirmed',
                      payment_status: values.payment_status || 'pending'
                    };
                    const res = await DataService.createBooking(payload);
                    if (res.success) {
                      showToast('success', 'Booking created', 'The booking has been created successfully.');
                      handleCloseNewBookingModal();
                      handleRefresh();
                    } else {
                      showToast('error', 'Error', res.error?.message || 'Failed to create booking');
                    }
                  } catch (err: any) {
                    showToast('error', 'Error', err.message || 'Failed to create booking');
                  }
                }}
                onCancel={handleCloseNewBookingModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagementContainer;


