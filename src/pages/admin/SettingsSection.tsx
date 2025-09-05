import React, { useState } from 'react';
import {
  Users,
  Shield,
  Settings as SettingsIcon,
  FileText,
  User,
  Download
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const SettingsSection: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'users' | 'security' | 'system' | 'audit'>('users');

  const tabs = [
    { id: 'users', label: 'User Management', icon: Users, description: 'Manage admin accounts and roles' },
    { id: 'security', label: 'Security & Access', icon: Shield, description: 'Configure security settings and permissions' },
    { id: 'system', label: 'System Config', icon: SettingsIcon, description: 'System-wide configuration and settings' },
    { id: 'audit', label: 'Audit Logs', icon: FileText, description: 'View system activity and audit trails' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-base font-medium text-gray-600">Manage system configuration and user access</div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => showToast('info', 'Coming Soon', 'Backup feature coming soon')}
            className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Backup
          </button>
          <button 
            onClick={() => showToast('info', 'Coming Soon', 'User management feature coming soon')}
            className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-md"
          >
            + Add User
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Admin Users</div>
              <div className="text-2xl font-bold text-gray-900">3</div>
              <div className="text-sm text-blue-600 font-medium">Active</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Security Status</div>
              <div className="text-2xl font-bold text-gray-900">100%</div>
              <div className="text-sm text-green-600 font-medium">Secure</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Audit Logs</div>
              <div className="text-2xl font-bold text-gray-900">247</div>
              <div className="text-sm text-purple-600 font-medium">This Month</div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Container */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex px-6 py-4 space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'users' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-gray-900">User Management</h3>
                <button className="bg-[#f29520] text-white px-2 py-1 rounded text-xs hover:bg-[#e08518] transition-colors">
                  Add New User
                </button>
              </div>

              <div className="bg-gray-50 rounded p-3 text-center">
                <User className="mx-auto h-6 w-6 text-gray-400" />
                <h3 className="mt-1 text-xs font-medium text-gray-900">User Management</h3>
                <p className="mt-1 text-xs text-gray-500">
                  Manage admin accounts, roles, and permissions.
                </p>
                <div className="mt-3">
                  <button className="bg-[#f29520] text-white px-3 py-1 rounded text-xs hover:bg-[#e08518] transition-colors">
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-gray-900">Security & Access</h3>
                <button className="bg-[#f29520] text-white px-2 py-1 rounded text-xs hover:bg-[#e08518] transition-colors">
                  Update Security
                </button>
              </div>

              <div className="bg-gray-50 rounded p-3 text-center">
                <Shield className="mx-auto h-6 w-6 text-gray-400" />
                <h3 className="mt-1 text-xs font-medium text-gray-900">Security Settings</h3>
                <p className="mt-1 text-xs text-gray-500">
                  Configure authentication, permissions, and access control.
                </p>
                <div className="mt-3">
                  <button className="bg-[#f29520] text-white px-3 py-1 rounded text-xs hover:bg-[#e08518] transition-colors">
                    Configure
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-gray-900">System Configuration</h3>
                <button className="bg-[#f29520] text-white px-2 py-1 rounded text-xs hover:bg-[#e08518] transition-colors">
                  Save Changes
                </button>
              </div>

              <div className="bg-gray-50 rounded p-3 text-center">
                <SettingsIcon className="mx-auto h-6 w-6 text-gray-400" />
                <h3 className="mt-1 text-xs font-medium text-gray-900">System Settings</h3>
                <p className="mt-1 text-xs text-gray-500">
                  Configure business rules, notifications, and integrations.
                </p>
                <div className="mt-3">
                  <button className="bg-[#f29520] text-white px-3 py-1 rounded text-xs hover:bg-[#e08518] transition-colors">
                    Configure
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-gray-900">Audit Logs</h3>
                <div className="flex space-x-1">
                  <button className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-200 transition-colors">
                    <Download className="w-3 h-3 inline mr-1" />
                    Export
                  </button>
                  <button className="bg-[#f29520] text-white px-2 py-1 rounded text-xs hover:bg-[#e08518] transition-colors">
                    View All
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded p-3 text-center">
                <FileText className="mx-auto h-6 w-6 text-gray-400" />
                <h3 className="mt-1 text-xs font-medium text-gray-900">Audit Trail</h3>
                <p className="mt-1 text-xs text-gray-500">
                  Monitor system activity and track user actions.
                </p>
                <div className="mt-3">
                  <button className="bg-[#f29520] text-white px-3 py-1 rounded text-xs hover:bg-[#e08518] transition-colors">
                    View Logs
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsSection;
