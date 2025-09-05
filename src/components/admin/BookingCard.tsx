import React from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Users, 
  DollarSign, 
  Package, 
  MapPin,
  CheckCircle,
  XCircle,
  Eye,
  Edit
} from 'lucide-react';

interface BookingCardProps {
  booking: {
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
  };
  onStatusChange: (bookingId: string, newStatus: string) => void;
  onView: (bookingId: string) => void;
  onEdit: (bookingId: string) => void;
  isSelected: boolean;
  onSelect: (bookingId: string, selected: boolean) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onStatusChange,
  onView,
  onEdit,
  isSelected,
  onSelect
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'refunded': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
      isSelected ? 'ring-2 ring-[#f29520] border-[#f29520]' : 'border-gray-200'
    }`}>
      {/* Header with Checkbox and Status */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(booking.id, e.target.checked)}
            className="rounded border-gray-300 text-[#f29520] focus:ring-[#f29520]"
          />
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
              {booking.status}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(booking.payment_status)}`}>
              {booking.payment_status}
            </span>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex space-x-1">
          {booking.status === 'pending' && (
            <>
              <button
                onClick={() => onStatusChange(booking.id, 'confirmed')}
                className="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors"
                title="Confirm"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => onStatusChange(booking.id, 'rejected')}
                className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                title="Reject"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={() => onView(booking.id)}
            className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(booking.id)}
            className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Customer Information - Compact Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {/* Customer Details */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <User className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-gray-900">{booking.customer_name}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Mail className="w-4 h-4" />
            <span className="truncate">{booking.customer_email}</span>
          </div>
          {booking.customer_phone && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{booking.customer_phone}</span>
            </div>
          )}
        </div>

        {/* Booking Details */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-gray-900">
              {new Date(booking.booking_date).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{booking.participants} participant{booking.participants !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <DollarSign className="w-4 h-4" />
            <span className="font-medium">${booking.total_amount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Package & Destination */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {booking.package_name && (
          <div className="flex items-center space-x-2 text-sm">
            <Package className="w-4 h-4 text-blue-500" />
            <span className="text-gray-700">{booking.package_name}</span>
          </div>
        )}
        {booking.destination_name && (
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="w-4 h-4 text-green-500" />
            <span className="text-gray-700">{booking.destination_name}</span>
          </div>
        )}
      </div>

      {/* Special Requests */}
      {booking.special_requests && (
        <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
          <span className="font-medium">Special Requests:</span> {booking.special_requests}
        </div>
      )}
    </div>
  );
};

export default BookingCard;
