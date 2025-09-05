import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Phone, MapPin, Calendar, FileText } from 'lucide-react';
import { components } from '../../../styles/designSystem';
import { ClientService, ClientProfile } from '../../../services/clientService';

interface ClientEditModalProps {
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
    nationality: string;
    gender: string;
    dietary_requirements?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedClient: any) => void;
}

const ClientEditModal: React.FC<ClientEditModalProps> = ({
  client,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    nationality: '',
    gender: '',
    dietary_requirements: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (client && isOpen) {
      setFormData({
        customer_name: client.name || '',
        customer_phone: client.phone || '',
        nationality: client.nationality || '',
        gender: client.gender || '',
        dietary_requirements: client.dietary_requirements || ''
      });
      setErrors({});
    }
  }, [client, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'Name is required';
    }

    if (!formData.customer_phone.trim()) {
      newErrors.customer_phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.customer_phone)) {
      newErrors.customer_phone = 'Please enter a valid phone number';
    }

    if (!formData.nationality.trim()) {
      newErrors.nationality = 'Nationality is required';
    }

    if (!formData.gender.trim()) {
      newErrors.gender = 'Gender is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !client) return;

    setLoading(true);
    try {
      const response = await ClientService.updateClientProfile(client.email, formData);
      
      if (response.success) {
        onSave({
          ...client,
          name: formData.customer_name,
          phone: formData.customer_phone,
          nationality: formData.nationality,
          gender: formData.gender,
          dietary_requirements: formData.dietary_requirements
        });
        onClose();
      } else {
        setErrors({ submit: response.error?.message || 'Failed to update client' });
      }
    } catch (error: any) {
      setErrors({ submit: error.message || 'An error occurred while updating' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${components.modal.base} max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className={`${components.modal.header} flex items-center justify-between`}>
          <div className="flex items-center">
            <User className="w-6 h-6 text-blue-500 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">Edit Customer</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className={`${components.modal.body} space-y-6`}>
          {/* Customer Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-500" />
              Customer Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.customer_name}
                  onChange={(e) => handleInputChange('customer_name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.customer_name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter full name"
                />
                {errors.customer_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.customer_name}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.customer_phone}
                  onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.customer_phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="+252 90 123 4567"
                />
                {errors.customer_phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.customer_phone}</p>
                )}
              </div>

              {/* Nationality */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nationality *
                </label>
                <select
                  value={formData.nationality}
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.nationality ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select nationality</option>
                  <option value="Somali">Somali</option>
                  <option value="Kenyan">Kenyan</option>
                  <option value="Ethiopian">Ethiopian</option>
                  <option value="Djiboutian">Djiboutian</option>
                  <option value="Other">Other</option>
                </select>
                {errors.nationality && (
                  <p className="text-red-500 text-sm mt-1">{errors.nationality}</p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.gender ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && (
                  <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-green-500" />
              Additional Information
            </h3>
            
            {/* Dietary Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dietary Requirements
              </label>
              <textarea
                value={formData.dietary_requirements}
                onChange={(e) => handleInputChange('dietary_requirements', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
                placeholder="Any dietary restrictions or preferences..."
              />
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className={`${components.modal.footer} flex justify-end space-x-3`}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientEditModal;
