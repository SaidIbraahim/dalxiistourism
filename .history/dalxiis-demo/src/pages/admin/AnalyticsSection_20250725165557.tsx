import React, { useState } from 'react';
import PaginationControls from './PaginationControls';
import { BarChart3, TrendingUp, Trash2 } from 'lucide-react';

const demoAnalytics = [
  { id: 1, event: 'New Booking', detail: 'Booking for Garowe to Bosaso', date: '2024-07-25' },
  { id: 2, event: 'New Customer', detail: 'Sarah Johnson registered', date: '2024-07-25' },
  { id: 3, event: 'Service Updated', detail: 'Vehicle Rental price changed', date: '2024-07-24' },
  { id: 4, event: 'Booking Completed', detail: 'Omar Ali completed Puntland Explorer', date: '2024-07-24' },
  { id: 5, event: 'Destination Added', detail: 'Caluula added to Destinations', date: '2024-07-23' },
  { id: 6, event: 'Booking Cancelled', detail: 'Fatima Al-Zahra cancelled Cultural Heritage Tour', date: '2024-07-23' }
];

const AnalyticsSection = ({ analytics, setAnalytics }) => {
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const maxPage = Math.ceil(analytics.length / itemsPerPage);
  const paginated = analytics.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleClearAnalytics = () => setAnalytics([]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
        <button onClick={handleClearAnalytics} className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors flex items-center"><Trash2 className="h-4 w-4 mr-2" />Clear Log</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
          <BarChart3 className="h-16 w-16 text-[#f29520] mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Booking Trends</h3>
          <p className="text-gray-600">Chart visualization would go here</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
          <TrendingUp className="h-16 w-16 text-[#2f67b5] mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Revenue Analytics</h3>
          <p className="text-gray-600">Chart visualization would go here</p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Analytics Events</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Event</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Detail</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{item.event}</td>
                  <td className="py-3 px-4 text-gray-600">{item.detail}</td>
                  <td className="py-3 px-4 text-gray-600">{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <PaginationControls page={page} maxPage={maxPage} goTo={setPage} />
      </div>
    </div>
  );
};

export default AnalyticsSection; 