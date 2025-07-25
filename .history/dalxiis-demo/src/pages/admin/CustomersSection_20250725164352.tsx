import React, { useState } from 'react';
import PaginationControls from './PaginationControls';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';

const demoCustomers = [
  { id: 1, name: 'Ahmed Hassan', email: 'ahmed@example.com', phone: '+252901234567', status: 'active' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+44123456789', status: 'active' },
  { id: 3, name: 'Omar Ali', email: 'omar@example.com', phone: '+971501234567', status: 'inactive' },
  { id: 4, name: 'Fatima Al-Zahra', email: 'fatima@example.com', phone: '+1416123456', status: 'active' },
  { id: 5, name: 'Marcus Williams', email: 'marcus@example.com', phone: '+61412345678', status: 'active' },
  { id: 6, name: 'Amina Mohamed', email: 'amina@example.com', phone: '+252907123456', status: 'inactive' }
];

const CustomersSection = ({ customers, setCustomers }) => {
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const maxPage = Math.ceil(customers.length / itemsPerPage);
  const paginated = customers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleAddNewCustomer = () => {
    setEditingCustomer({ id: 0, name: '', email: '', phone: '', status: 'active' });
    setShowAddCustomer(true);
  };
  const handleEditCustomer = (cust) => setEditingCustomer({ ...cust });
  const handleDeleteCustomer = (id) => setCustomers(customers.filter(cust => cust.id !== id));
  const handleSaveCustomer = () => {
    if (editingCustomer) {
      if (editingCustomer.id === 0) {
        const newCustomer = { ...editingCustomer, id: Math.max(...customers.map(c => c.id)) + 1 };
        setCustomers([...customers, newCustomer]);
      } else {
        setCustomers(customers.map(cust => cust.id === editingCustomer.id ? editingCustomer : cust));
      }
      setEditingCustomer(null);
      setShowAddCustomer(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
        <button onClick={handleAddNewCustomer} className="bg-[#f29520] text-white px-4 py-2 rounded-lg hover:bg-[#e08420] transition-colors flex items-center">
          <Plus className="h-4 w-4 mr-2" />Add Customer
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginated.map((cust) => (
          <div key={cust.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${cust.status === 'active' ? 'bg-[#2f67b5] text-white' : 'bg-gray-300 text-gray-700'}`}>{cust.status}</span>
              <div className="flex items-center space-x-2">
                <button onClick={() => handleEditCustomer(cust)} className="text-gray-400 hover:text-[#2f67b5] p-1"><Edit className="h-4 w-4" /></button>
                <button onClick={() => handleDeleteCustomer(cust.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{cust.name}</h3>
            <p className="text-gray-600 text-sm mb-1">{cust.email}</p>
            <p className="text-gray-600 text-sm mb-4">{cust.phone}</p>
          </div>
        ))}
      </div>
      <PaginationControls page={page} maxPage={maxPage} goTo={setPage} />
      {(editingCustomer || showAddCustomer) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{editingCustomer?.id === 0 ? 'Add New Customer' : 'Edit Customer'}</h3>
              <button onClick={() => { setEditingCustomer(null); setShowAddCustomer(false); }} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" value={editingCustomer?.name || ''} onChange={e => setEditingCustomer((prev) => prev ? { ...prev, name: e.target.value } : null)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f29520] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={editingCustomer?.email || ''} onChange={e => setEditingCustomer((prev) => prev ? { ...prev, email: e.target.value } : null)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f29520] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="text" value={editingCustomer?.phone || ''} onChange={e => setEditingCustomer((prev) => prev ? { ...prev, phone: e.target.value } : null)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f29520] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={editingCustomer?.status || 'active'} onChange={e => setEditingCustomer((prev) => prev ? { ...prev, status: e.target.value } : null)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f29520] focus:border-transparent">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button onClick={() => { setEditingCustomer(null); setShowAddCustomer(false); }} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
              <button onClick={handleSaveCustomer} className="bg-[#f29520] text-white px-4 py-2 rounded-lg hover:bg-[#e08420] transition-colors flex items-center"><Save className="h-4 w-4 mr-2" />Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersSection; 