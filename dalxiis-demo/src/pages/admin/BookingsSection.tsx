import React from 'react';
import PaginationControls from './PaginationControls';
import { Eye, Edit, Trash2, Mail, Phone } from 'lucide-react';

interface BookingsSectionProps {
  bookingsPagination: any;
  updateBookingStatus: (id: number, status: string) => void;
}

const BookingsSection: React.FC<BookingsSectionProps> = ({ bookingsPagination, updateBookingStatus }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold text-gray-900">Bookings Management</h2>
      <div className="flex items-center space-x-3">
        <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f29520] focus:border-transparent">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
    </div>
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-4 px-6 font-medium text-gray-600">Customer</th>
              <th className="text-left py-4 px-6 font-medium text-gray-600">Contact</th>
              <th className="text-left py-4 px-6 font-medium text-gray-600">Package</th>
              <th className="text-left py-4 px-6 font-medium text-gray-600">Date</th>
              <th className="text-left py-4 px-6 font-medium text-gray-600">Status</th>
              <th className="text-left py-4 px-6 font-medium text-gray-600">Amount</th>
              <th className="text-left py-4 px-6 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookingsPagination.paginated.map((booking: any) => (
              <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-6">
                  <div className="font-medium text-gray-900">{booking.customer}</div>
                </td>
                <td className="py-4 px-6">
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center mb-1"><Mail className="h-3 w-3 mr-1" />{booking.email}</div>
                    <div className="flex items-center"><Phone className="h-3 w-3 mr-1" />{booking.phone}</div>
                  </div>
                </td>
                <td className="py-4 px-6 text-gray-600">{booking.package}</td>
                <td className="py-4 px-6 text-gray-600">{booking.date}</td>
                <td className="py-4 px-6">
                  <select
                    value={booking.status}
                    onChange={e => updateBookingStatus(booking.id, e.target.value)}
                    className={`px-2 py-1 rounded-full text-xs font-medium border-0 bg-blue-100 text-blue-800`}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="py-4 px-6 font-medium text-gray-900">{booking.amount}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-2">
                    <button className="text-gray-400 hover:text-[#f29520] p-1"><Eye className="h-4 w-4" /></button>
                    <button className="text-gray-400 hover:text-[#2f67b5] p-1"><Edit className="h-4 w-4" /></button>
                    <button className="text-gray-400 hover:text-red-500 p-1"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PaginationControls page={bookingsPagination.page} maxPage={bookingsPagination.maxPage} goTo={bookingsPagination.goTo} />
    </div>
  </div>
);

export default BookingsSection; 