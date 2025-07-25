import React, { useState } from 'react';
import PaginationControls from './PaginationControls';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';

const demoServices = [
  { id: 1, name: 'Airport Pickup & Drop-off', description: '24/7 airport transfer services in Puntland', price: 25, status: 'active' },
  { id: 2, name: 'Accommodation Booking', description: 'Book premium hotels with Dalxiis', price: 80, status: 'active' },
  { id: 3, name: 'Vehicle Rental', description: 'Modern fleet for your transportation needs', price: 40, status: 'active' },
  { id: 4, name: 'Tour Planning', description: 'Custom itineraries and local guides', price: 100, status: 'active' },
  { id: 5, name: 'Visa Services', description: 'Visa and immigration support', price: 50, status: 'inactive' },
  { id: 6, name: 'Event Planning', description: 'Corporate and family event planning', price: 200, status: 'active' }
];

const ServicesSection = ({ services, setServices }) => {
  const [editingService, setEditingService] = useState(null);
  const [showAddService, setShowAddService] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const maxPage = Math.ceil(services.length / itemsPerPage);
  const paginated = services.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleAddNewService = () => {
    setEditingService({ id: 0, name: '', description: '', price: 0, status: 'active' });
    setShowAddService(true);
  };
  const handleEditService = (svc) => setEditingService({ ...svc });
  const handleDeleteService = (id) => setServices(services.filter(svc => svc.id !== id));
  const handleSaveService = () => {
    if (editingService) {
      if (editingService.id === 0) {
        const newService = { ...editingService, id: Math.max(...services.map(s => s.id)) + 1 };
        setServices([...services, newService]);
      } else {
        setServices(services.map(svc => svc.id === editingService.id ? editingService : svc));
      }
      setEditingService(null);
      setShowAddService(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Services</h2>
        <button onClick={handleAddNewService} className="bg-[#f29520] text-white px-4 py-2 rounded-lg hover:bg-[#e08420] transition-colors flex items-center">
          <Plus className="h-4 w-4 mr-2" />Add Service
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginated.map((svc) => (
          <div key={svc.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${svc.status === 'active' ? 'bg-[#2f67b5] text-white' : 'bg-gray-300 text-gray-700'}`}>{svc.status}</span>
              <div className="flex items-center space-x-2">
                <button onClick={() => handleEditService(svc)} className="text-gray-400 hover:text-[#2f67b5] p-1"><Edit className="h-4 w-4" /></button>
                <button onClick={() => handleDeleteService(svc.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{svc.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{svc.description}</p>
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-[#f29520]">${svc.price}</span>
            </div>
          </div>
        ))}
      </div>
      <PaginationControls page={page} maxPage={maxPage} goTo={setPage} />
      {(editingService || showAddService) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{editingService?.id === 0 ? 'Add New Service' : 'Edit Service'}</h3>
              <button onClick={() => { setEditingService(null); setShowAddService(false); }} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                <input type="text" value={editingService?.name || ''} onChange={e => setEditingService((prev) => prev ? { ...prev, name: e.target.value } : null)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f29520] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={editingService?.description || ''} onChange={e => setEditingService((prev) => prev ? { ...prev, description: e.target.value } : null)} rows={3} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f29520] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                <input type="number" value={editingService?.price || 0} onChange={e => setEditingService((prev) => prev ? { ...prev, price: parseInt(e.target.value) } : null)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f29520] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={editingService?.status || 'active'} onChange={e => setEditingService((prev) => prev ? { ...prev, status: e.target.value } : null)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f29520] focus:border-transparent">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button onClick={() => { setEditingService(null); setShowAddService(false); }} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
              <button onClick={handleSaveService} className="bg-[#f29520] text-white px-4 py-2 rounded-lg hover:bg-[#e08420] transition-colors flex items-center"><Save className="h-4 w-4 mr-2" />Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesSection; 