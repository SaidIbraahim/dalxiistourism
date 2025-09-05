import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, User } from 'lucide-react';
import { components } from '../../../styles/designSystem';
import { ClientExportService } from '../../../services/clientExportService';

interface ClientExportModalProps {
  client: {
    id: string;
    name: string;
    email: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onExport: (message: string) => void;
}

const ClientExportModal: React.FC<ClientExportModalProps> = ({
  client,
  isOpen,
  onClose,
  onExport
}) => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!client) return;

    setLoading(true);
    try {
      const response = await ClientExportService.exportClientToExcel(client.email);
      if (response.success) {
        onExport(response.data || 'Client data exported successfully');
      } else {
        onExport(`Export failed: ${response.error?.message || 'Unknown error'}`);
      }
      onClose();
    } catch (error: any) {
      onExport(`Export failed: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${components.modal.base} max-w-md w-full`}>
        {/* Header */}
        <div className={`${components.modal.header} flex items-center justify-between`}>
          <div className="flex items-center">
            <Download className="w-6 h-6 text-blue-500 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">Export Customer Data</h2>
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
        <div className={`${components.modal.body} space-y-4`}>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <User className="w-5 h-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-blue-900">{client.name}</p>
                <p className="text-xs text-blue-700">{client.email}</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Export customer data as an Excel spreadsheet. This will include profile information, 
            booking history, notes, and activity timeline.
          </p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Excel Spreadsheet</h3>
                <p className="text-sm text-gray-600">Export as .xlsx file with formatted tables</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`${components.modal.footer} flex justify-end space-x-3`}>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Exporting...
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export to Excel
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientExportModal;
