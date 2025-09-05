import React, { useState } from 'react';
import { FileText, Printer, Download, Mail, Eye, Plus, Trash2 } from 'lucide-react';
import DocumentPreviewModal from './DocumentPreviewModal';

interface ReceiptData {
  id: string;
  type: 'receipt' | 'payment' | 'ticket';
  booking_id: string;
  customer_name: string;
  amount: number;
  generated_at: string;
  document_url?: string;
  print_count: number;
  last_printed?: string;
}

interface ReceiptsSectionProps {
  bookingId: string;
  customerName: string;
  totalAmount: number;
  onGenerateDocument: (type: 'receipt' | 'payment' | 'ticket') => void;
  onPrintDocument: (documentId: string) => void;
  onDownloadDocument: (documentId: string) => void;
  onEmailDocument: (documentId: string) => void;
  onDeleteDocument: (documentId: string) => void;
}

const ReceiptsSection: React.FC<ReceiptsSectionProps> = ({
  bookingId,
  customerName,
  totalAmount,
  onGenerateDocument,
  onPrintDocument,
  onDownloadDocument,
  onEmailDocument,
  onDeleteDocument
}) => {
  const [activeTab, setActiveTab] = useState<'receipts' | 'payments' | 'tickets'>('receipts');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewDocumentType, setPreviewDocumentType] = useState<'receipt' | 'payment' | 'ticket'>('receipt');
  const [documents, setDocuments] = useState<ReceiptData[]>([
    // Mock data - will be replaced with actual data
    {
      id: '1',
      type: 'receipt',
      booking_id: bookingId,
      customer_name: customerName,
      amount: totalAmount,
      generated_at: new Date().toISOString(),
      print_count: 0
    }
  ]);

  const handleGenerateDocument = (type: 'receipt' | 'payment' | 'ticket') => {
    // Create a new document
    const newDocument: ReceiptData = {
      id: `${type}-${Date.now()}`,
      type,
      booking_id: bookingId,
      customer_name: customerName,
      amount: totalAmount,
      generated_at: new Date().toISOString(),
      print_count: 0
    };

    setDocuments(prev => [...prev, newDocument]);
    
    // Open preview modal
    setPreviewDocumentType(type);
    setIsPreviewModalOpen(true);
    
    // Call parent callback
    onGenerateDocument(type);
  };

  const handlePreviewDocument = (documentId: string) => {
    const document = documents.find(d => d.id === documentId);
    if (document) {
      setPreviewDocumentType(document.type);
      setIsPreviewModalOpen(true);
    }
  };

  const handlePrintDocument = (documentId: string) => {
    // Update print count and last printed
    setDocuments(prev => prev.map(d => 
      d.id === documentId 
        ? { ...d, print_count: d.print_count + 1, last_printed: new Date().toISOString() }
        : d
    ));
    
    onPrintDocument(documentId);
  };

  const handleDownloadDocument = (documentId: string) => {
    onDownloadDocument(documentId);
  };

  const handleEmailDocument = (documentId: string) => {
    onEmailDocument(documentId);
  };

  const handleDeleteDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== documentId));
    onDeleteDocument(documentId);
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'receipt': return '🧾';
      case 'payment': return '💳';
      case 'ticket': return '🎫';
      default: return '📄';
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'receipt': return 'Receipt';
      case 'payment': return 'Payment Confirmation';
      case 'ticket': return 'Travel Ticket';
      default: return 'Document';
    }
  };

  const getDocumentColor = (type: string) => {
    switch (type) {
      case 'receipt': return 'from-green-500 to-emerald-600';
      case 'payment': return 'from-blue-500 to-cyan-600';
      case 'ticket': return 'from-purple-500 to-indigo-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Mock booking data for preview modal
  const mockBookingData = {
    id: bookingId,
    customer_name: customerName,
    customer_email: 'customer@example.com', // This would come from actual booking data
    total_amount: totalAmount,
    selected_services: [
      { name: 'Tour Package', price: totalAmount, quantity: 1 }
    ],
    booking_date: new Date().toISOString(),
    adults: 2,
    children: 0,
    destination_name: 'Somalia'
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-r ${getDocumentColor(activeTab)} text-white p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8" />
              <div>
                <h3 className="text-2xl font-bold">Document Management</h3>
                <p className="text-white/80 text-sm">Generate, print, and manage branded documents for {customerName}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleGenerateDocument('receipt')}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Generate Receipt</span>
              </button>
              <button
                onClick={() => handleGenerateDocument('ticket')}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Generate Ticket</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex px-6 py-4 space-x-1">
            {[
              { id: 'receipts', label: 'Receipts', count: documents.filter(d => d.type === 'receipt').length },
              { id: 'payments', label: 'Payments', count: documents.filter(d => d.type === 'payment').length },
              { id: 'tickets', label: 'Tickets', count: documents.filter(d => d.type === 'ticket').length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {documents.filter(d => d.type === activeTab.slice(0, -1)).length > 0 ? (
            <div className="space-y-4">
              {documents
                .filter(d => d.type === activeTab.slice(0, -1))
                .map((document) => (
                  <div
                    key={document.id}
                    className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-2xl">
                          {getDocumentIcon(document.type)}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-lg font-bold text-gray-900">
                              {getDocumentTypeLabel(document.type)} #{document.id}
                            </h4>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              {formatCurrency(document.amount)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><span className="font-medium">Customer:</span> {document.customer_name}</p>
                            <p><span className="font-medium">Generated:</span> {formatDate(document.generated_at)}</p>
                            {document.last_printed && (
                              <p><span className="font-medium">Last Printed:</span> {formatDate(document.last_printed)}</p>
                            )}
                            <p><span className="font-medium">Print Count:</span> {document.print_count} time(s)</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handlePrintDocument(document.id)}
                            className="p-3 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200 hover:shadow-md hover:scale-105 border-2 border-transparent hover:border-blue-300"
                            title="Print Document"
                          >
                            <Printer className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDownloadDocument(document.id)}
                            className="p-3 text-green-600 hover:bg-green-100 rounded-lg transition-all duration-200 hover:shadow-md hover:scale-105 border-2 border-transparent hover:border-green-300"
                            title="Download PDF"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEmailDocument(document.id)}
                            className="p-3 text-purple-600 hover:bg-purple-100 rounded-lg transition-all duration-200 hover:shadow-md hover:scale-105 border-2 border-transparent hover:border-purple-300"
                            title="Email to Customer"
                          >
                            <Mail className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteDocument(document.id)}
                            className="p-3 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 hover:shadow-md hover:scale-105 border-2 border-transparent hover:border-red-300"
                            title="Delete Document"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        
                        {/* Preview Button */}
                        <button
                          onClick={() => handlePreviewDocument(document.id)}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-all duration-200 flex items-center space-x-2"
                          title="Preview Document"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Preview</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-dashed border-gray-300">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <FileText className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">No {activeTab} generated yet</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                Generate your first {activeTab.slice(0, -1)} to get started. All documents will be computer-generated with your brand and include print functionality.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => handleGenerateDocument(activeTab.slice(0, -1) as any)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-cyan-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 shadow-md"
                >
                  Generate {activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(0, -1).slice(1)}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-2">
                <Printer className="w-4 h-4" />
                <span>Print-ready documents</span>
              </span>
              <span className="flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>PDF download available</span>
              </span>
              <span className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Email to customers</span>
              </span>
            </div>
            <div className="text-xs">
              All documents are computer-generated with your brand
            </div>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        documentType={previewDocumentType}
        bookingData={mockBookingData}
      />
    </>
  );
};

export default ReceiptsSection;
