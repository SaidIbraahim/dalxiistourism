import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  BarChart3, Calendar, DollarSign, FileText, Globe, Package, Settings, Users, TrendingUp, Activity, LogOut
} from 'lucide-react';
import OverviewSection from './admin/OverviewSection';
import BookingManagementSection from './admin/BookingManagementSection';
import FinancialManagementSection from './admin/FinancialManagementSection';
import ReportsSection from './admin/ReportsSection';
import CMSSection from './admin/CMSSection';
import SettingsSection from './admin/SettingsSection';

type DashboardSection = 'overview' | 'bookings' | 'financial' | 'reports' | 'cms' | 'settings';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState<DashboardSection>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Read section from URL parameters on component mount
  useEffect(() => {
    const sectionParam = searchParams.get('section') as DashboardSection;
    if (sectionParam && ['overview', 'bookings', 'financial', 'reports', 'cms', 'settings'].includes(sectionParam)) {
      setActiveSection(sectionParam);
    }
  }, [searchParams]);

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3, description: 'Dashboard overview and key metrics' },
    { id: 'bookings', label: 'Booking Management', icon: Calendar, description: 'Manage client bookings and requests' },
    { id: 'financial', label: 'Financial Management', icon: DollarSign, description: 'Handle expenses and financial operations' },
    { id: 'reports', label: 'Reports & Analytics', icon: TrendingUp, description: 'Generate reports and view analytics' },
    { id: 'cms', label: 'Content Management', icon: Globe, description: 'Manage packages and destinations' },
    { id: 'settings', label: 'Settings', icon: Settings, description: 'System configuration and user management' }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      showToast('success', 'Success', 'Logged out successfully');
    } catch (error) {
      showToast('error', 'Error', 'Logout failed');
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection />;
      case 'bookings':
        return <BookingManagementSection />;
      case 'financial':
        return <FinancialManagementSection />;
      case 'reports':
        return <ReportsSection />;
      case 'cms':
        return <CMSSection />;
      case 'settings':
        return <SettingsSection />;
      default:
        return <OverviewSection />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You must be logged in to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Standardized Sidebar */}
      <div className={`bg-white border-r border-gray-200 shadow-lg transition-all duration-300 flex-shrink-0 flex flex-col relative ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        
        {/* Removed duplicate floating toggle to avoid UI duplication */}

        {/* Header */}
        <div className="border-b border-gray-200 p-3 relative">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              {!sidebarCollapsed && (
                <div className="transition-all duration-300">
                  <span className="text-lg font-bold text-gray-900">Dalxiis</span>
                  <div className="text-xs text-gray-500">Tourism Admin</div>
                </div>
              )}
            </div>
            
            {/* Toggle Button - uses design system colors */}
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg transition-all duration-200 hover:scale-105 flex-shrink-0 z-10 bg-gradient-to-r from-orange-500 to-orange-600 text-white focus:ring-4 focus:ring-orange-200 shadow-md"
              title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              aria-label={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <svg 
                className="w-5 h-5 text-white transition-transform duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {sidebarCollapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 space-y-2 transition-all duration-300 ${
          sidebarCollapsed ? 'p-2' : 'p-4'
        }`}>
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id as DashboardSection);
                setSearchParams({ section: item.id });
              }}
              className={`w-full flex items-center rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                sidebarCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'
              } ${
                activeSection === item.id
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title={sidebarCollapsed ? `${item.label} - ${item.description}` : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <div className={`ml-3 text-left transition-all duration-300 overflow-hidden ${
                sidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
              }`}>
                <div className="font-semibold whitespace-nowrap">{item.label}</div>
                <div className={`text-xs whitespace-nowrap ${
                  activeSection === item.id ? 'text-orange-100' : 'text-gray-500'
                }`}>
                  {item.description}
                </div>
              </div>
              
              {/* Tooltip for collapsed state */}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  <div className="font-semibold">{item.label}</div>
                  <div className="text-xs text-gray-300">{item.description}</div>
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* User Section */}
        <div className={`border-t border-gray-200 space-y-3 transition-all duration-300 ${
          sidebarCollapsed ? 'p-2' : 'p-4'
        }`}>
          {user && (
            <div className={`bg-gray-50 rounded-xl transition-all duration-300 overflow-hidden ${
              sidebarCollapsed ? 'p-2' : 'p-4'
            }`}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">
                    {(user.user_metadata?.full_name || user.email).charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className={`flex-1 min-w-0 transition-all duration-300 overflow-hidden ${
                  sidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                }`}>
                  <p className="text-sm font-semibold text-gray-900 truncate whitespace-nowrap">
                    {user.user_metadata?.full_name || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500 truncate whitespace-nowrap">{user.email}</p>
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className={`w-full flex items-center rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200 ${
              sidebarCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'
            }`}
            title={sidebarCollapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className={`ml-3 transition-all duration-300 overflow-hidden whitespace-nowrap ${
              sidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
            }`}>
              Logout
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {navigationItems.find(item => item.id === activeSection)?.label}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {navigationItems.find(item => item.id === activeSection)?.description}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-500">
                Welcome back, {user?.user_metadata?.full_name || 'Admin'}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50">
          {renderSection()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
