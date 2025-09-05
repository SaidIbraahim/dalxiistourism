import React, { useState } from 'react';
import { FileText, Package, MapPin, Image, Plus } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const CMSSection: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'packages' | 'destinations' | 'content' | 'media'>('packages');

  const tabs = [
    { id: 'packages', label: 'Tour Packages', icon: Package, count: 8 },
    { id: 'destinations', label: 'Destinations', icon: MapPin, count: 12 },
    { id: 'content', label: 'Content Editor', icon: FileText, count: 15 },
    { id: 'media', label: 'Media Library', icon: Image, count: 45 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-base font-medium text-gray-600">Manage tour packages, destinations, and content for public pages</div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            Publish All
          </button>
          <button className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-md">
            + New Content
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Tour Packages</div>
              <div className="text-2xl font-bold text-gray-900">8</div>
              <div className="text-sm text-blue-600 font-medium">Active</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <MapPin className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Destinations</div>
              <div className="text-2xl font-bold text-gray-900">12</div>
              <div className="text-sm text-green-600 font-medium">Published</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Image className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Media Files</div>
              <div className="text-2xl font-bold text-gray-900">45</div>
              <div className="text-sm text-purple-600 font-medium">+6 New</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex px-6 py-4 space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                      {tab.count}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Content Management</h3>
            <p className="mt-2 text-sm text-gray-500">
              Manage tour packages, destinations, and content for public pages.
            </p>
            <div className="mt-6 space-x-4">
              <button 
                onClick={() => showToast('info', 'Coming Soon', 'Package management feature coming soon')}
                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-md"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                New Package
              </button>
              <button 
                onClick={() => showToast('info', 'Coming Soon', 'Destination management feature coming soon')}
                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 shadow-md"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                New Destination
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CMSSection;
