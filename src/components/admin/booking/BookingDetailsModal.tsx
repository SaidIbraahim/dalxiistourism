import React from 'react';
import { X, Calendar, MapPin, Users, CreditCard, FileText, Clock } from 'lucide-react';
import { components } from '../../../styles/designSystem';
import { formatBookingId } from '../../../utils/bookingIdGenerator';

interface BookingDetailsModalProps {
  booking: {
    id: string;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    package_name: string;
    destination?: string;
    booking_date: string;
    travel_date?: string;
    end_date?: string;
    adults: number;
    children: number;
    total_amount: number;
    status: string;
    payment_status: string;
    payment_method?: string;
    selected_services?: any[];
    special_requests?: string;
    dietary_requirements?: string;
    nationality?: string;
    created_at: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  booking,
  isOpen,
  onClose
}) => {
  if (!isOpen || !booking) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
      confirmed: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
      completed: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${config.bg} ${config.text} ${config.border}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentBadge = (status: string) => {
    const paymentConfig = {
      paid: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
      failed: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' }
    };
    
    const config = paymentConfig[status as keyof typeof paymentConfig] || paymentConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${config.bg} ${config.text} ${config.border}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${components.modal.base} ${components.modal.full} max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className={`${components.modal.header} flex items-center justify-between`}>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
            <p className="text-sm text-gray-600 mt-1">Booking ID: {formatBookingId(booking.id, booking.created_at, 'full')}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className={`${components.modal.body} space-y-6`}>
          {/* Customer Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-500" />
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Full Name</label>
                <p className="text-gray-900 font-medium">{booking.customer_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-900 font-medium">{booking.customer_email}</p>
              </div>
              {booking.customer_phone && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-gray-900 font-medium">{booking.customer_phone}</p>
                </div>
              )}
              {booking.nationality && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Nationality</label>
                  <p className="text-gray-900 font-medium">{booking.nationality}</p>
                </div>
              )}
            </div>
          </div>

          {/* Travel Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-green-500" />
              Travel Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Package</label>
                <p className="text-gray-900 font-medium">{booking.package_name}</p>
              </div>
              {booking.destination && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Destination</label>
                  <p className="text-gray-900 font-medium">{booking.destination}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-600">Travel Dates</label>
                <p className="text-gray-900 font-medium">
                  {formatDate(booking.travel_date || booking.booking_date)}
                  {booking.end_date && ` - ${formatDate(booking.end_date)}`}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Guests</label>
                <p className="text-gray-900 font-medium">
                  {booking.adults} Adult{booking.adults !== 1 ? 's' : ''}
                  {booking.children > 0 && `, ${booking.children} Child${booking.children !== 1 ? 'ren' : ''}`}
                </p>
              </div>
            </div>
          </div>

          {/* Booking Status */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-purple-500" />
              Booking Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <div className="mt-1">{getStatusBadge(booking.status)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Payment Status</label>
                <div className="mt-1">{getPaymentBadge(booking.payment_status)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Booking Date</label>
                <p className="text-gray-900 font-medium">{formatDate(booking.booking_date)}</p>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-orange-500" />
              Financial Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Total Amount</label>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(booking.total_amount)}</p>
              </div>
              {booking.payment_method && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Payment Method</label>
                  <p className="text-gray-900 font-medium capitalize">{booking.payment_method}</p>
                </div>
              )}
            </div>
          </div>

          {/* Special Requests */}
          {(booking.special_requests || booking.dietary_requirements) && (
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-indigo-500" />
                Special Requirements
              </h3>
              <div className="space-y-4">
                {booking.special_requests && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Special Requests</label>
                    <p className="text-gray-900 mt-1">{booking.special_requests}</p>
                  </div>
                )}
                {booking.dietary_requirements && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Dietary Requirements</label>
                    <p className="text-gray-900 mt-1">{booking.dietary_requirements}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;
