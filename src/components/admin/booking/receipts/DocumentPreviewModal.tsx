import React, { useState, useEffect } from 'react';
import { X, Printer, Download, Eye, FileText } from 'lucide-react';
import { colors, typography, componentSizes, borderRadius, shadows, components } from '../../../../styles/designSystem';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    type: 'receipt' | 'ticket';
    blob: Blob;
    filename: string;
    data: any;
  };
  onDownload: () => void;
}

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  document,
  onDownload
}) => {
  const [pdfUrl, setPdfUrl] = useState<string>('');

  useEffect(() => {
    if (document?.blob) {
      const url = URL.createObjectURL(document.blob);
      setPdfUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [document]);

  if (!isOpen || !document) return null;

  const getDocumentIcon = () => {
    switch (document.type) {
      case 'receipt':
        return '🧾';
      case 'ticket':
        return '🎫';
      default:
        return '📄';
    }
  };

  const getDocumentTitle = () => {
    switch (document.type) {
      case 'receipt':
        return 'Payment Receipt';
      case 'ticket':
        return 'Travel Ticket';
      default:
        return 'Document';
    }
  };

  const getDocumentColor = () => {
    switch (document.type) {
      case 'receipt':
        return 'from-green-500 to-emerald-600';
      case 'ticket':
        return 'from-blue-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className={`${components.modal.base} ${componentSizes.modal.lg} transform transition-all`}>
          {/* Header */}
          <div className={`${componentSizes.modal.header} border-b border-gray-200`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 bg-gradient-to-r ${getDocumentColor()} rounded-full flex items-center justify-center text-white text-xl`}>
                  {getDocumentIcon()}
                </div>
                <div>
                  <h3 className={`${typography.h3} text-gray-900`}>
                    {getDocumentTitle()} Preview
                  </h3>
                  <p className={`${typography.body} text-gray-600`}>
                    {document.filename}
                  </p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className={`${components.button.icon} ${componentSizes.button.icon.lg} text-gray-400 hover:text-gray-600`}
              >
                <X className={componentSizes.icon.lg} />
              </button>
            </div>
          </div>

          {/* Document Info */}
          <div className={`${componentSizes.modal.body} border-b border-gray-200`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Document Type:</span> {getDocumentTitle()}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Customer:</span> {document.data?.payment?.customer_name || document.data?.booking?.customer_name}
                </p>
                {document.type === 'receipt' && document.data?.payment && (
                  <>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Amount:</span> ${document.data.payment.amount}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Payment Method:</span> {document.data.payment.payment_method.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                  </>
                )}
                {document.type === 'ticket' && document.data?.booking && (
                  <>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Package:</span> {document.data.booking.package_name || 'Custom Package'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Destination:</span> {document.data.booking.destination_name || 'Multiple Destinations'}
                    </p>
                  </>
                )}
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Generated:</span> {new Date().toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">File Size:</span> {(document.blob.size / 1024).toFixed(1)} KB
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Format:</span> PDF
                </p>
              </div>
            </div>
          </div>

          {/* PDF Preview */}
          <div className={`${componentSizes.modal.body} bg-gray-50`}>
            <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
              {pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  className="w-full h-96"
                  title="PDF Preview"
                />
              ) : (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Loading PDF preview...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className={`${componentSizes.modal.footer} bg-gray-50`}>
            <div className="flex items-center justify-between">
                             <div className="flex items-center space-x-2 text-sm text-gray-600">
                 <Eye className="w-4 h-4" />
                 <span>Preview mode - Use PDF viewer toolbar to print, download button below</span>
               </div>
              
                             <div className="flex space-x-3">
                 <button
                   onClick={onDownload}
                   className={`${components.button.primary} ${componentSizes.button.md} flex items-center space-x-2`}
                 >
                   <Download className={componentSizes.icon.sm} />
                   <span>Download PDF</span>
                 </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;
