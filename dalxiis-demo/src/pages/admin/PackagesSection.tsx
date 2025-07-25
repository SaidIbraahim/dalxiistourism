import React from 'react';
import PaginationControls from './PaginationControls';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';

interface PackagesSectionProps {
  packagesPagination: any;
  editingPackage: any;
  showAddPackage: boolean;
  setEditingPackage: (pkg: any) => void;
  setShowAddPackage: (show: boolean) => void;
  handleAddNewPackage: () => void;
  handleEditPackage: (pkg: any) => void;
  handleDeletePackage: (id: number) => void;
  handleSavePackage: () => void;
}

const PackagesSection: React.FC<PackagesSectionProps> = ({
  packagesPagination,
  editingPackage,
  showAddPackage,
  setEditingPackage,
  setShowAddPackage,
  handleAddNewPackage,
  handleEditPackage,
  handleDeletePackage,
  handleSavePackage
}) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold text-gray-900">Tour Packages</h2>
      <button 
        onClick={handleAddNewPackage}
        className="bg-[#f29520] text-white px-4 py-2 rounded-lg hover:bg-[#e08420] transition-colors flex items-center"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Package
      </button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {packagesPagination.paginated.map((pkg: any) => (
        <div key={pkg.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${pkg.type === 'VIP' ? 'bg-[#f29520] text-white' : 'bg-[#2f67b5] text-white'}`}>{pkg.type}</span>
            <div className="flex items-center space-x-2">
              <button onClick={() => handleEditPackage(pkg)} className="text-gray-400 hover:text-[#2f67b5] p-1"><Edit className="h-4 w-4" /></button>
              <button onClick={() => handleDeletePackage(pkg.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{pkg.name}</h3>
          <p className="text-gray-600 text-sm mb-4">{pkg.description}</p>
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl font-bold text-[#f29520]">${pkg.price}</span>
            <span className="text-sm text-gray-600">{pkg.bookings} bookings</span>
          </div>
          <div className="flex items-center justify-between">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${pkg.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{pkg.status}</span>
          </div>
        </div>
      ))}
    </div>
    <PaginationControls page={packagesPagination.page} maxPage={packagesPagination.maxPage} goTo={packagesPagination.goTo} />
    {(editingPackage || showAddPackage) && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{editingPackage?.id === 0 ? 'Add New Package' : 'Edit Package'}</h3>
            <button onClick={() => { setEditingPackage(null); setShowAddPackage(false); }} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
              <input type="text" value={editingPackage?.name || ''} onChange={e => setEditingPackage((prev: any) => prev ? { ...prev, name: e.target.value } : null)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f29520] focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={editingPackage?.type || 'Basic'} onChange={e => setEditingPackage((prev: any) => prev ? { ...prev, type: e.target.value } : null)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f29520] focus:border-transparent">
                <option value="Basic">Basic</option>
                <option value="VIP">VIP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input type="number" value={editingPackage?.price || 0} onChange={e => setEditingPackage((prev: any) => prev ? { ...prev, price: parseInt(e.target.value) } : null)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f29520] focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={editingPackage?.description || ''} onChange={e => setEditingPackage((prev: any) => prev ? { ...prev, description: e.target.value } : null)} rows={3} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f29520] focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={editingPackage?.status || 'active'} onChange={e => setEditingPackage((prev: any) => prev ? { ...prev, status: e.target.value } : null)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f29520] focus:border-transparent">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-end space-x-3 mt-6">
            <button onClick={() => { setEditingPackage(null); setShowAddPackage(false); }} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
            <button onClick={handleSavePackage} className="bg-[#f29520] text-white px-4 py-2 rounded-lg hover:bg-[#e08420] transition-colors flex items-center"><Save className="h-4 w-4 mr-2" />Save</button>
          </div>
        </div>
      </div>
    )}
  </div>
);

export default PackagesSection; 