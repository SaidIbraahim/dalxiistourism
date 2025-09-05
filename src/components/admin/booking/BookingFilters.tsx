import React from 'react';
import { Search, Filter, FileSpreadsheet, Calendar } from 'lucide-react';

interface BookingFiltersProps {
  searchTerm: string;
  statusFilter: string;
  dateFilter: string;
  onSearchChange: (term: string) => void;
  onStatusFilterChange: (status: string) => void;
  onDateFilterChange: (date: string) => void;
  onExport: () => void;
}

const BookingFilters: React.FC<BookingFiltersProps> = ({
  searchTerm,
  statusFilter,
  dateFilter,
  onSearchChange,
  onStatusFilterChange,
  onDateFilterChange,
  onExport
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4 shadow-sm">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search bookings by customer name, email, booking ID, services, or destination..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border-2 border-blue-200 rounded-lg text-gray-800 font-medium focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 placeholder-blue-400"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="pl-10 pr-8 py-3 border-2 border-blue-200 rounded-lg text-sm font-medium focus:ring-4 focus:ring-blue-200 focus:border-blue-500 bg-white min-w-[140px] text-gray-800 transition-all duration-300"
            >
              <option value="all">All Statuses</option>
              <option value="pending">🟡 Pending</option>
              <option value="confirmed">🟢 Confirmed</option>
              <option value="completed">🔵 Completed</option>
              <option value="cancelled">⚫ Cancelled</option>
              <option value="rejected">🔴 Rejected</option>
            </select>
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4" />
            <select
              value={dateFilter}
              onChange={(e) => onDateFilterChange(e.target.value)}
              className="pl-10 pr-8 py-3 border-2 border-blue-200 rounded-lg text-sm font-medium focus:ring-4 focus:ring-blue-200 focus:border-blue-500 bg-white min-w-[140px] text-gray-800 transition-all duration-300"
            >
              <option value="all">All Dates</option>
              <option value="today">📅 Today</option>
              <option value="week">📊 This Week</option>
              <option value="month">📈 This Month</option>
            </select>
          </div>

          <button
            onClick={onExport}
            className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-700 focus:ring-4 focus:ring-green-200 transition-all duration-200 shadow-md whitespace-nowrap"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingFilters;


