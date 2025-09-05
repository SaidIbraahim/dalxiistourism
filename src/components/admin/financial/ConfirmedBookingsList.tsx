import React from 'react';
import { CreditCard, DollarSign, User } from 'lucide-react';
import { components, componentSizes, typography } from '../../../styles/designSystem';
import { formatBookingId } from '../../../utils/bookingIdGenerator';

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
  payment_status: 'pending' | 'paid' | 'refunded';
  booking_date: string;
  created_at: string;
  tour_packages: { name: string };
  destinations: { name: string };
  payment_records?: Array<{
    id: string;
    amount: number;
    payment_method: string;
    discount_type?: string;
    discount_value?: number;
    created_at: string;
  }>;
}

interface ConfirmedBookingsListProps {
  bookings: Booking[];
  onProcessPayment: (booking: Booking) => void;
  loading?: boolean;
}

const ConfirmedBookingsList: React.FC<ConfirmedBookingsListProps> = ({
  bookings,
  onProcessPayment,
  loading = false
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Ensure total_amount is a number
  const getTotalAmount = (booking: Booking) => {
    return typeof booking.total_amount === 'string' 
      ? parseFloat(booking.total_amount) || 0 
      : booking.total_amount || 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'refunded': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f29520]"></div>
        <span className="ml-3 text-lg text-gray-600">Loading confirmed bookings...</span>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-dashed border-gray-300">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
          <CreditCard className="w-10 h-10 text-blue-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">No confirmed bookings found</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          All confirmed bookings are up to date with their payments.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <h4 className="text-lg font-bold text-gray-900">{booking.customer_name}</h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border-2 ${getPaymentStatusColor(booking.payment_status)}`}>
                    Payment: {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Email:</span> {booking.customer_email}</p>
                  <p><span className="font-medium">Package:</span> {booking.tour_packages?.name || 'Custom Package'}</p>
                  <p><span className="font-medium">Destination:</span> {booking.destinations?.name || 'Multiple Destinations'}</p>
                  <p><span className="font-medium">Booking Date:</span> {formatDate(booking.booking_date)}</p>
                  <p><span className="font-medium">Original Amount:</span> <span className="font-bold text-lg text-gray-700">{formatCurrency(getTotalAmount(booking))}</span></p>
                  
                  {/* Payment Information for Paid Bookings */}
                  {booking.payment_status === 'paid' && booking.payment_records && booking.payment_records.length > 0 && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="font-medium text-green-800 mb-2">Payment Details:</p>
                      {booking.payment_records.map((payment, index) => (
                        <div key={payment.id || index} className="text-xs space-y-1">
                          <p><span className="font-medium">Method:</span> {payment.payment_method?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                          <p><span className="font-medium">Amount Paid:</span> <span className="font-bold text-green-600">{formatCurrency(payment.amount)}</span></p>
                          {payment.discount_type && payment.discount_type !== 'none' && (
                            <p><span className="font-medium">Discount:</span> 
                              <span className="text-orange-600 font-semibold">
                                {payment.discount_type === 'percent' ? ` ${payment.discount_value}% off` : ` $${payment.discount_value} off`}
                              </span>
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              {booking.payment_status === 'pending' && (
                <button
                  onClick={() => onProcessPayment(booking)}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Process Payment</span>
                </button>
              )}
              {booking.payment_status === 'paid' && (
                <button
                  onClick={() => onProcessPayment(booking)}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg text-sm font-medium hover:from-red-600 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Process Refund</span>
                </button>
              )}
              <div className="text-xs text-gray-500 text-center">
                Booking ID: {formatBookingId(booking.id, booking.created_at, 'full')}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConfirmedBookingsList;
