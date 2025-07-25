import React from 'react';
import { LogOut } from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  clientRequests: any[];
  handleLogout: () => void;
  sidebarItems: SidebarItem[];
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab, clientRequests, handleLogout, sidebarItems }) => (
  <aside className="fixed top-0 left-0 h-full w-60 bg-gradient-to-b from-[#2f67b5] to-[#f29520] flex flex-col z-30 shadow-none">
    <div>
      {/* Logo & Title */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-lg">D</span>
        </div>
        <div>
          <div className="text-lg font-bold text-white tracking-tight">Dalxiis</div>
          <div className="text-xs text-white/80 font-medium tracking-wide">Admin Panel</div>
        </div>
      </div>
      {/* Sidebar Navigation */}
      <nav className="flex flex-col gap-2 mt-8 px-4">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/10
              ${activeTab === item.id
                ? 'bg-white/20 text-white shadow-md'
                : 'text-white/80 hover:text-white hover:bg-white/10'}
            `}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <span>{item.label}</span>
            {item.id === 'requests' && clientRequests.filter(r => r.status === 'new').length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {clientRequests.filter(r => r.status === 'new').length}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
    {/* Spacer to push logout button to the bottom */}
    <div className="flex-1" />
    {/* Sidebar Logout (always at the bottom) */}
    <div className="px-4 pb-6">
      <button
        onClick={handleLogout}
        className="flex items-center justify-center w-full bg-white/10 text-white px-4 py-3 rounded-lg hover:bg-red-400/30 hover:text-white transition-colors font-medium text-base gap-2"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </div>
  </aside>
);

export default AdminSidebar; 