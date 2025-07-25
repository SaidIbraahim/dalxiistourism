import React, { useState } from 'react';
import PaginationControls from './PaginationControls';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';

const demoDestinations = [
  { id: 1, name: 'Garowe', region: 'Nugaal', highlights: 'Cultural sites, city tours', status: 'active' },
  { id: 2, name: 'Bosaso', region: 'Bari', highlights: 'Beaches, port, markets', status: 'active' },
  { id: 3, name: 'Eyl', region: 'Nugaal', highlights: 'Historic ruins, beaches', status: 'active' },
  { id: 4, name: 'Caluula', region: 'Bari', highlights: 'Coastal scenery', status: 'inactive' },
  { id: 5, name: 'Garacad', region: 'Mudug', highlights: 'Fishing, harbors', status: 'active' },
  { id: 6, name: 'Mareera', region: 'Bari', highlights: 'Beach, water sports', status: 'active' }
];

const DestinationsSection = ({ destinations, setDestinations }) => {
  const [editingDestination, setEditingDestination] = useState(null);
  const [showAddDestination, setShowAddDestination] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const maxPage = Math.ceil(destinations.length / itemsPerPage);
  const paginated = destinations.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleAddNewDestination = () => {
    setEditingDestination({ id: 0, name: '', region: '', highlights: '', status: 'active' });
    setShowAddDestination(true);
  };
  const handleEditDestination = (dest) => setEditingDestination({ ...dest });
  const handleDeleteDestination = (id) => setDestinations(destinations.filter(dest => dest.id !== id));
  const handleSaveDestination = () => {
    if (editingDestination) {
      if (editingDestination.id === 0) {
        const newDestination = { ...editingDestination, id: Math.max(...destinations.map(d => d.id)) + 1 };
        setDestinations([...destinations, newDestination]);
      } else {
        setDestinations(destinations.map(dest => dest.id === editingDestination.id ? editingDestination : dest));
      }
      setEditingDestination(null);
      setShowAddDestination(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Destinations</h2>
        <button onClick={handleAddNewDestination} className="bg-[#f29520] text-white px-4 py-2 rounded-lg hover:bg-[#e08420] transition-colors flex items-center">
          <Plus className="h-4 w-4 mr-2" />Add Destination
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginated.map((dest) => (
          <div key={dest.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${dest.status === 'active' ? 'bg-[#2f67b5] text-white' : 'bg-gray-300 text-gray-700'}`}>{dest.status}</span>
              <div className="flex items-center space-x-2">
                <button onClick={() => handleEditDestination(dest)} className="text-gray-400 hover:text-[#2f67b5] p-1"><Edit className="h-4 w-4" /></button>
                <button onClick={() => handleDeleteDestination(dest.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{dest.name}</h3>
            <p className="text-gray-600 text-sm mb-1">Region: {dest.region}</p>
            <p className="text-gray-600 text-sm mb-4">Highlights: {dest.highlights}</p>
          </div>
        ))}
      </div>
      <PaginationControls page={page} maxPage={maxPage} goTo={setPage} />
      {(editingDestination || showAddDestination) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{editingDestination?.id === 0 ? 'Add New Destination' : 'Edit Destination'}</h3>
              <button onClick={() => { setEditingDestination(null); setShowAddDestination(false); }} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination Name</label>
                <input type="text" value={editingDestination?.name || ''} onChange={e => setEditingDestination((prev) => prev ? { ...prev, name: e.target.value } : null)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f29520] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                <input type="text" value={editingDestination?.region || ''} onChange={e => setEditingDestination((prev) => prev ? { ...prev, region: e.target.value } : null)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f29520] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Highlights</label>
                <input type="text" value={editingDestination?.highlights || ''} onChange={e => setEditingDestination((prev) => prev ? { ...prev, highlights: e.target.value } : null)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f29520] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={editingDestination?.status || 'active'} onChange={e => setEditingDestination((prev) => prev ? { ...prev, status: e.target.value } : null)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f29520] focus:border-transparent">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button onClick={() => { setEditingDestination(null); setShowAddDestination(false); }} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
              <button onClick={handleSaveDestination} className="bg-[#f29520] text-white px-4 py-2 rounded-lg hover:bg-[#e08420] transition-colors flex items-center"><Save className="h-4 w-4 mr-2" />Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DestinationsSection; 