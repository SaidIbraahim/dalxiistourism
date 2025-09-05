import React, { useState, useMemo } from 'react';
import { X, DollarSign, CreditCard, Receipt, Percent } from 'lucide-react';
import { components, componentSizes, typography } from '../../../../styles/designSystem';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  customerName: string;
  totalAmount: number;
  currentPaymentStatus: 'pending' | 'paid' | 'refunded';
  onPaymentRecorded: (paymentData: PaymentData) => void;
}

interface PaymentData {
  amount: number;
  payment_method?: string;
  transaction_id?: string;
  notes?: string;
  type: 'payment' | 'refund';
  discount_type?: 'none' | 'percent' | 'fixed';
  discount_value?: number;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  customerName,
  totalAmount,
  currentPaymentStatus,
  onPaymentRecorded
}) => {
  // Ensure totalAmount is a number
  const numericTotalAmount = typeof totalAmount === 'string' ? parseFloat(totalAmount) || 0 : totalAmount || 0;

  const [paymentData, setPaymentData] = useState<PaymentData>({
    amount: numericTotalAmount,
    payment_method: 'cash',
    transaction_id: '',
    notes: '',
    type: 'payment',
    discount_type: 'none',
    discount_value: 0
  });

  const payable = useMemo(() => {
    if (paymentData.type === 'refund') return paymentData.amount; // refunds use entered amount
    let discount = 0;
    if (paymentData.discount_type === 'percent') {
      discount = (numericTotalAmount * (paymentData.discount_value || 0)) / 100;
    } else if (paymentData.discount_type === 'fixed') {
      discount = paymentData.discount_value || 0;
    }
    const value = Math.max(0, numericTotalAmount - discount);
    return parseFloat(value.toFixed(2));
  }, [paymentData.discount_type, paymentData.discount_value, paymentData.type, numericTotalAmount, paymentData.amount]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...paymentData };
    if (paymentData.type === 'payment') {
      payload.amount = payable;
    }
    onPaymentRecorded(payload);
    onClose();
  };

  const resetForm = () => {
    setPaymentData({
      amount: numericTotalAmount,
      payment_method: 'cash',
      transaction_id: '',
      notes: '',
      type: 'payment',
      discount_type: 'none',
      discount_value: 0
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'refunded': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-5 h-5" />
              <h2 className="text-lg font-bold">Payment Management</h2>
            </div>
            <button 
              onClick={onClose} 
              className="hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="text-sm opacity-90 mt-1">Record payment or refund for {customerName}</div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Booking Summary - More Compact */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-500 text-xs font-medium mb-1">Booking ID</div>
                <div className="font-mono font-semibold text-gray-900 text-sm">{bookingId}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs font-medium mb-1">Total Amount</div>
                <div className="font-semibold text-gray-900 text-sm">${numericTotalAmount.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs font-medium mb-1">Customer</div>
                <div className="font-semibold text-gray-900 text-sm">{customerName}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs font-medium mb-1">Status</div>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(currentPaymentStatus)}`}>
                  {currentPaymentStatus.charAt(0).toUpperCase() + currentPaymentStatus.slice(1)}
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Transaction Type - More Compact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 cursor-pointer transition-all ${
                  paymentData.type === 'payment' 
                    ? 'bg-green-50 border-green-300 text-green-700' 
                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}>
                  <input 
                    type="radio" 
                    className="hidden" 
                    checked={paymentData.type === 'payment'} 
                    onChange={() => setPaymentData(prev => ({ ...prev, type: 'payment' }))} 
                  />
                  <CreditCard className="w-4 h-4 mr-2" />
                  Payment
                </label>
                <label className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 cursor-pointer transition-all ${
                  paymentData.type === 'refund' 
                    ? 'bg-red-50 border-red-300 text-red-700' 
                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}>
                  <input 
                    type="radio" 
                    className="hidden" 
                    checked={paymentData.type === 'refund'} 
                    onChange={() => setPaymentData(prev => ({ ...prev, type: 'refund' }))} 
                  />
                  <Receipt className="w-4 h-4 mr-2" />
                  Refund
                </label>
              </div>
            </div>

            {/* Discount Section (only for payment) */}
            {paymentData.type === 'payment' && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                  <Percent className="w-4 h-4 mr-2" />
                  Discount Options
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Discount Type</label>
                    <select 
                      value={paymentData.discount_type} 
                      onChange={(e) => setPaymentData(prev => ({ ...prev, discount_type: e.target.value as any }))} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="none">None</option>
                      <option value="percent">Percentage (%)</option>
                      <option value="fixed">Fixed amount ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Discount Value</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      value={paymentData.discount_value} 
                      onChange={(e) => setPaymentData(prev => ({ ...prev, discount_value: parseFloat(e.target.value) || 0 }))} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      placeholder="0" 
                    />
                  </div>
                </div>
                <div className="mt-3 text-sm text-blue-800">
                  <span className="font-medium">Payable amount after discount: </span>
                  <span className="font-bold text-lg">${payable.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount ({paymentData.type === 'refund' ? 'Refund' : 'Payment'})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={paymentData.type === 'refund' ? numericTotalAmount : undefined}
                  value={paymentData.type === 'payment' ? payable : paymentData.amount}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg text-lg font-semibold focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <select
                value={paymentData.payment_method}
                onChange={(e) => setPaymentData(prev => ({ ...prev, payment_method: e.target.value }))}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="cash">Cash</option>
                <option value="sahal">Sahal</option>
                <option value="e_dahab">E-Dahab</option>
                <option value="mycash">MyCash</option>
                <option value="bank_transfer">Bank transfer</option>
                <option value="cheque">Cheque</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Transaction ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transaction ID (Optional)</label>
              <input
                value={paymentData.transaction_id}
                onChange={(e) => setPaymentData(prev => ({ ...prev, transaction_id: e.target.value }))}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., TXN123456789"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
              <textarea
                value={paymentData.notes}
                onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                placeholder="Additional details about this transaction..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button 
                type="button" 
                onClick={() => { resetForm(); onClose(); }} 
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className={`px-6 py-3 rounded-lg font-medium text-white transition-colors ${
                  paymentData.type === 'refund' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {paymentData.type === 'refund' ? 'Process Refund' : 'Record Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;