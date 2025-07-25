import React from 'react';
import { Search, Bell, AlertCircle } from 'lucide-react';

interface AdminHeaderProps {
  activeTab: string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  clientRequests: any[];
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ activeTab, searchTerm, setSearchTerm, showNotifications, setShowNotifications, clientRequests }) => (
  <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-20">
    <div>
      <h1 className="text-3xl font-extrabold text-[#1c2c54] tracking-tight capitalize leading-tight">{activeTab.replace('-', ' ')}</h1>
      <p className="text-gray-400 text-sm mt-1">Manage your tourism business</p>
    </div>
    <div className="flex items-center gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-300" />
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-base focus:ring-2 focus:ring-[#f29520] focus:border-transparent outline-none"
        />
      </div>
      <div className="relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 text-gray-400 hover:text-[#f29520] focus:outline-none"
        >
          <Bell className="h-5 w-5" />
          {clientRequests.filter(r => r.status === 'new').length > 0 && (
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          )}
        </button>
        {showNotifications && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-50">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-[#1c2c54] text-sm">Notifications</h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {clientRequests.filter(r => r.status === 'new').map(request => (
                <div key={request.id} className="p-4 border-b border-gray-50 hover:bg-gray-50">
                  <div className="flex items-start">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-1 mr-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-[#1c2c54]">New request from {request.name}</p>
                      <p className="text-xs text-gray-500">{request.subject}</p>
                      <p className="text-xs text-gray-400 mt-1">{request.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <img
          src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100"
          alt="Admin"
          className="w-8 h-8 rounded-full object-cover border border-gray-200"
        />
        <span className="text-base font-semibold text-gray-700">Admin User</span>
      </div>
    </div>
  </header>
);

export default AdminHeader; 