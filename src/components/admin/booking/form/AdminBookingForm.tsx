import React, { useEffect, useState } from 'react';
import useAdminBookingForm from './useAdminBookingForm';
import { usePackages, useServices, useClearServicesCache } from '../../../../stores/appStore';
import { DataService } from '../../../../services/dataService';

interface AdminBookingFormProps {
  initial?: Partial<ReturnType<typeof useAdminBookingForm>['values']>;
  onSubmit: (values: ReturnType<typeof useAdminBookingForm>['values']) => void;
  onCancel: () => void;
}

const AdminBookingForm: React.FC<AdminBookingFormProps> = ({ initial = {}, onSubmit, onCancel }) => {
  const { values, setField, reset } = useAdminBookingForm(initial);
  const packages = usePackages();
  const services = useServices();
  const clearServicesCache = useClearServicesCache();

  // Calculate total amount
  const packagePrice = packages.find(p => p.id === values.package_id)?.price || 0;
  const servicesTotal = (values.selected_services || []).reduce((sum, s) => sum + s.price * (s.quantity || 1), 0);
  const totalAmount = packagePrice + servicesTotal;

  useEffect(() => {
    if (packages.length === 0) DataService.fetchPackages(1, 50);
    clearServicesCache();
    DataService.fetchServices();
  }, [packages.length, clearServicesCache]);

  const [selectedServiceId, setSelectedServiceId] = useState('');
  const addService = () => {
    const svc = services.find(s => s.id === selectedServiceId);
    if (!svc) return;
    const exists = values.selected_services?.some(s => s.id === svc.id);
    if (exists) return;
    const updated = [...(values.selected_services || []), { id: svc.id, name: svc.name, price: svc.price, quantity: 1 }];
    setField('selected_services', updated);
    setSelectedServiceId('');
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // build customer_name consistently
        const fullName = `${values.first_name || ''} ${values.last_name || ''}`.trim();
        if (fullName) setField('customer_name', fullName);
        onSubmit({ ...values, customer_name: fullName || values.customer_name });
      }}
      className="space-y-4 max-w-3xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">First Name</label>
          <input className="w-full bg-white border-2 border-gray-200 rounded-lg text-gray-800 font-medium focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 placeholder-gray-500 px-4 py-2.5"
            value={values.first_name || ''} onChange={(e) => setField('first_name', e.target.value)} placeholder="First name" />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Last Name</label>
          <input className="w-full bg-white border-2 border-gray-200 rounded-lg text-gray-800 font-medium focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 placeholder-gray-500 px-4 py-2.5"
            value={values.last_name || ''} onChange={(e) => setField('last_name', e.target.value)} placeholder="Last name" />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Email</label>
          <input className="w-full bg-white border-2 border-gray-200 rounded-lg text-gray-800 font-medium focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 placeholder-gray-500 px-4 py-2.5"
            value={values.customer_email} onChange={(e) => setField('customer_email', e.target.value)} placeholder="Email address" />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Phone</label>
          <input className="w-full bg-white border-2 border-gray-200 rounded-lg text-gray-800 font-medium focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 placeholder-gray-500 px-4 py-2.5"
            value={values.customer_phone} onChange={(e) => setField('customer_phone', e.target.value)} placeholder="Phone number" />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Gender</label>
          <select className="w-full bg-white border-2 border-gray-200 rounded-lg text-gray-800 focus:ring-4 focus:ring-blue-200 focus:border-blue-500 px-4 py-2.5"
            value={values.gender || ''} onChange={(e) => setField('gender', e.target.value as any)}>
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Nationality</label>
          <input className="w-full bg-white border-2 border-gray-200 rounded-lg text-gray-800 font-medium focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 placeholder-gray-500 px-4 py-2.5"
            value={values.nationality || ''} onChange={(e) => setField('nationality', e.target.value)} placeholder="e.g. Kenyan" />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Start Date</label>
          <input type="date" className="w-full bg-white border-2 border-gray-200 rounded-lg text-gray-800 font-medium focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 placeholder-gray-500 px-4 py-2.5"
            value={values.booking_date} onChange={(e) => setField('booking_date', e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">End Date (optional)</label>
          <input type="date" className="w-full bg-white border-2 border-gray-200 rounded-lg text-gray-800 font-medium focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 placeholder-gray-500 px-4 py-2.5"
            value={values.end_date || ''} onChange={(e) => setField('end_date', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Adults</label>
            <input type="number" min={1} className="w-full bg-white border-2 border-gray-200 rounded-lg text-gray-800 font-medium focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 placeholder-gray-500 px-4 py-2.5"
              value={values.adults} onChange={(e) => setField('adults', Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Children</label>
            <input type="number" min={0} className="w-full bg-white border-2 border-gray-200 rounded-lg text-gray-800 font-medium focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 placeholder-gray-500 px-4 py-2.5"
              value={values.children} onChange={(e) => setField('children', Number(e.target.value))} />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Package</label>
          <select className="w-full bg-white border-2 border-gray-200 rounded-lg text-gray-800 focus:ring-4 focus:ring-blue-200 focus:border-blue-500 px-4 py-2.5"
            value={values.package_id || ''} onChange={(e) => setField('package_id', e.target.value)}>
            <option value="">Select package</option>
            {packages.map(p => (
              <option key={p.id} value={p.id}>{p.name} — ${p.price}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Destination</label>
          <input className="w-full bg-white border-2 border-gray-200 rounded-lg text-gray-800 focus:ring-4 focus:ring-blue-200 focus:border-blue-500 px-4 py-2.5"
            value={values.destination_id || ''} onChange={(e) => setField('destination_id', e.target.value)} placeholder="Destination ID (optional)" />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Add Service</label>
          <div className="flex gap-2">
            <select className="flex-1 bg-white border-2 border-gray-200 rounded-lg text-gray-800 focus:ring-4 focus:ring-blue-200 focus:border-blue-500 px-4 py-2.5"
              value={selectedServiceId} onChange={(e) => setSelectedServiceId(e.target.value)}>
              <option value="">Select a service</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name} — ${s.price}</option>
              ))}
            </select>
            <button type="button" onClick={addService} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Add</button>
          </div>
          {values.selected_services && values.selected_services.length > 0 && (
            <ul className="mt-2 text-sm text-gray-700 list-disc list-inside">
              {values.selected_services.map(s => (
                <li key={s.id}>{s.name} — ${s.price} (x{s.quantity})</li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Dietary Requirements</label>
          <input className="w-full bg-white border-2 border-gray-200 rounded-lg text-gray-800 focus:ring-4 focus:ring-blue-200 focus:border-blue-500 px-4 py-2.5"
            value={values.dietary_requirements || ''} onChange={(e) => setField('dietary_requirements', e.target.value)} placeholder="Optional" />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Payment Status</label>
          <select className="w-full bg-white border-2 border-gray-200 rounded-lg text-gray-800 focus:ring-4 focus:ring-blue-200 focus:border-blue-500 px-4 py-2.5"
            value={values.payment_status || 'pending'} onChange={(e) => setField('payment_status', e.target.value as any)}>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
        
        {/* Total Amount Display */}
        <div className="md:col-span-2">
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-green-800">Total Amount:</span>
              <span className="text-2xl font-bold text-green-600">${totalAmount.toFixed(2)}</span>
            </div>
            <div className="text-xs text-green-700 mt-1">
              Package: ${packagePrice.toFixed(2)} + Services: ${servicesTotal.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
      <div className="md:col-span-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Special Requests</label>
        <textarea className="w-full bg-white border-2 border-gray-200 rounded-lg text-gray-800 font-medium focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 placeholder-gray-500 px-4 py-2.5"
          rows={3} value={values.special_requests} onChange={(e) => setField('special_requests', e.target.value)} placeholder="Notes, preferences, etc." />
      </div>
      <div className="flex justify-end space-x-3">
        <button type="button" onClick={() => { reset(); onCancel(); }} className="px-6 py-2 border-2 border-gray-400 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 hover:border-gray-500 transition-all duration-200 shadow-sm">Cancel</button>
        <button type="submit" className="px-6 py-2 bg-[#f29520] text-white rounded-lg text-sm font-medium hover:bg-[#e08518] transition-all duration-200 shadow-md hover:shadow-lg">Save Booking</button>
      </div>
    </form>
  );
};

export default AdminBookingForm;


