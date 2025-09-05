import React, { useState } from 'react';
import { X, AlertTriangle, CreditCard, XCircle } from 'lucide-react';

interface CancelRefundModalProps {
  booking: {
    id: string;
    customer_name: string;
    package_name?: string;
    tour_packages?: { name: string };
    destination_name?: string;
    destinations?: { name: string };
    total_amount: number;
    status: string;
    payment_status: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (action: 'cancel' | 'refund', reason?: string) => void;
}

const CancelRefundModal: React.FC<CancelRefundModalProps> = ({
  booking,
  isOpen,
  onClose,
  onConfirm
}) => {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !booking) return null;

  // Utility function to extract package name from booking data
  const getPackageName = (booking: any): string => {
    if (booking.package_name) return booking.package_name;
    if (booking.tour_packages?.name) return booking.tour_packages.name;
    return 'Custom Package';
  };

  // Utility function to extract destination name from booking data
  const getDestinationName = (booking: any): string => {
    if (booking.destination_name) return booking.destination_name;
    if (booking.destinations?.name) return booking.destinations.name;
    return 'Multiple Destinations';
  };

  const canCancel = ['pending', 'confirmed'].includes(booking.status);
  const canRefund = booking.status === 'completed' && booking.payment_status === 'paid';
  const action = canRefund ? 'refund' : 'cancel';
  const actionText = canRefund ? 'Refund' : 'Cancel';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm(action, reason.trim() || undefined);
      setReason('');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center">
            {canRefund ? (
              <CreditCard className="w-5 h-5 text-orange-500 mr-2" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500 mr-2" />
            )}
            <h2 className="text-lg font-semibold text-gray-900">
              {actionText} Booking
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
                  {canRefund ? 'Refund Warning' : 'Cancellation Warning'}
                </h3>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  {canRefund 
                    ? 'This will refund the customer and cancel the booking permanently.'
                    : 'This will cancel the booking permanently.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Booking Details - Compact */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Booking Details</h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Customer:</span>
                <span className="font-medium text-gray-900 truncate ml-2">{booking.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Package:</span>
                <span className="font-medium text-gray-900 truncate ml-2">{getPackageName(booking)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount:</span>
                <span className="font-semibold text-green-600">{formatCurrency(booking.total_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className="font-medium capitalize text-gray-900">{booking.status}</span>
              </div>
            </div>
          </div>

          {/* Reason Input - Compact */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Reason for {actionText.toLowerCase()} (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={`Enter reason for ${actionText.toLowerCase()}...`}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={2}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-2 p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-3 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`
              px-3 py-2 text-sm rounded-lg transition-colors font-medium flex items-center
              ${canRefund 
                ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                : 'bg-red-600 hover:bg-red-700 text-white'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {isLoading ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5" />
                Processing...
              </>
            ) : (
              `${actionText} Booking`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelRefundModal;