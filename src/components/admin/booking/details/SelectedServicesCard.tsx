import React from 'react';

interface ServiceItem {
  id: string;
  name: string;
  price: number;
  category: string;
  quantity: number;
}

interface SelectedServicesCardProps {
  services: ServiceItem[];
  total_amount: number;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const SelectedServicesCard: React.FC<SelectedServicesCardProps> = ({ services, total_amount }) => {
  if (!services || services.length === 0) return null;
  return (
    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-lg p-5">
      <h3 className="text-lg font-bold text-teal-900 mb-4">Selected Services</h3>
      <div className="space-y-3">
        {services.map((service, index) => (
          <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 border border-teal-100">
            <div>
              <p className="font-semibold text-teal-900">{service.name}</p>
              <p className="text-sm text-teal-700">Category: {service.category}</p>
              {service.quantity > 1 && <p className="text-sm text-teal-600">Quantity: {service.quantity}</p>}
            </div>
            <div className="text-right">
              <p className="font-bold text-teal-800">{formatCurrency(service.price)}</p>
              {service.quantity > 1 && (
                <p className="text-sm text-teal-600">{formatCurrency(service.price / service.quantity)} each</p>
              )}
            </div>
          </div>
        ))}
        <div className="border-t border-teal-300 pt-3 mt-4">
          <div className="flex justify-between items-center bg-teal-600 text-white rounded-lg p-3">
            <span className="font-bold text-lg">Total Amount</span>
            <span className="font-bold text-xl">{formatCurrency(total_amount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectedServicesCard;


