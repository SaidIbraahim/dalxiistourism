import React from 'react';

interface StatusActionsBarProps {
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
  payment_status: 'pending' | 'paid' | 'refunded';
  onApprove: () => void;
  onReject: () => void;
  onComplete: () => void;
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'completed':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'cancelled':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const StatusActionsBar: React.FC<StatusActionsBarProps> = ({ status, payment_status, onApprove, onReject, onComplete }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gradient-to-r from-gray-100 to-gray-50 p-5 rounded-xl border-2 border-gray-200 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-3 sm:mb-0">
        <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 shadow-sm ${getStatusClass(status)}`}>
          <span className="ml-1 capitalize">{status}</span>
        </span>
        <div className="bg-white px-3 py-2 rounded-lg border border-gray-300 shadow-sm">
          <span className="text-sm text-gray-700 font-medium">
            Payment: <span className="font-bold text-gray-900 capitalize">{payment_status}</span>
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {status === 'pending' && (
          <>
            <button onClick={onApprove} className="bg-gradient-to-r from-green-600 to-green-700 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105">✅ Approve</button>
            <button onClick={onReject} className="bg-gradient-to-r from-red-600 to-red-700 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105">❌ Reject</button>
          </>
        )}
        {status === 'confirmed' && (
          <button onClick={onComplete} className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105">✅ Mark Complete</button>
        )}
        

      </div>
    </div>
  );
};

export default StatusActionsBar;


