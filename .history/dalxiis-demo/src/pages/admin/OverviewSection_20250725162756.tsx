import React from 'react';
import { BarChart3, TrendingUp, Calendar, Star, MapPin } from 'lucide-react';

interface OverviewSectionProps {
  stats: any[];
  bookings: any[];
  setActiveTab: (tab: string) => void;
}

const OverviewSection: React.FC<OverviewSectionProps> = ({ stats, bookings, setActiveTab }) => (
  <div className="space-y-6">
    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
            </div>
            <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
              {stat.icon ? (
                <stat.icon className="h-6 w-6 text-white" />
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
    {/* Charts Row */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Trends</h3>
        <div className="h-64 bg-gradient-to-br from-[#f29520]/10 to-[#2f67b5]/10 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="h-16 w-16 text-[#f29520] mx-auto mb-4" />
            <p className="text-gray-600">Chart visualization would go here</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Analytics</h3>
        <div className="h-64 bg-gradient-to-br from-[#2f67b5]/10 to-[#f29520]/10 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="h-16 w-16 text-[#2f67b5] mx-auto mb-4" />
            <p className="text-gray-600">Revenue chart would go here</p>
          </div>
        </div>
      </div>
    </div>
    {/* Recent Activity */}
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
        <button 
          onClick={() => setActiveTab('bookings')}
          className="text-[#f29520] hover:text-[#e08420] font-medium"
        >
          View All
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-600">Customer</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Package</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
            </tr>
          </thead>
          <tbody>
            {bookings.slice(0, 5).map((booking) => (
              <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900">{booking.customer}</td>
                <td className="py-3 px-4 text-gray-600">{booking.package}</td>
                <td className="py-3 px-4 text-gray-600">{booking.date}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800`}>
                    {booking.status}
                  </span>
                </td>
                <td className="py-3 px-4 font-medium text-gray-900">{booking.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default OverviewSection; 