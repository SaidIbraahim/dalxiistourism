import React from 'react';
import PaginationControls from './PaginationControls';
import { Mail, Phone, Calendar, MessageSquare } from 'lucide-react';

interface ClientRequestsSectionProps {
  requestsPagination: any;
  updateRequestStatus: (id: number, status: string) => void;
}

const ClientRequestsSection: React.FC<ClientRequestsSectionProps> = ({ requestsPagination, updateRequestStatus }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold text-gray-900">Client Requests</h2>
      <div className="flex items-center space-x-3">
        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">{requestsPagination.paginated.filter((r: any) => r.status === 'new').length} New</span>
      </div>
    </div>
    <div className="grid grid-cols-1 gap-6">
      {requestsPagination.paginated.map((request: any) => (
        <div key={request.id} className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{request.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800`}>{request.status}</span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex items-center"><Mail className="h-4 w-4 mr-2" />{request.email}</div>
                <div className="flex items-center"><Phone className="h-4 w-4 mr-2" />{request.phone}</div>
                <div className="flex items-center"><Calendar className="h-4 w-4 mr-2" />{request.date}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-2">Service: {request.serviceType}</div>
              <div className="flex items-center space-x-2">
                <select
                  value={request.status}
                  onChange={e => updateRequestStatus(request.id, e.target.value)}
                  className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-[#f29520] focus:border-transparent"
                >
                  <option value="new">New</option>
                  <option value="responded">Responded</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          </div>
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Subject: {request.subject}</h4>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{request.message}</p>
          </div>
          <div className="flex items-center justify-end space-x-3">
            <button className="text-[#2f67b5] hover:text-[#1c2c54] font-medium text-sm flex items-center"><Mail className="h-4 w-4 mr-1" />Reply via Email</button>
            <button className="bg-[#25D366] text-white px-4 py-2 rounded-lg hover:bg-[#20b858] transition-colors text-sm flex items-center"><MessageSquare className="h-4 w-4 mr-2" />WhatsApp</button>
          </div>
        </div>
      ))}
    </div>
    <PaginationControls page={requestsPagination.page} maxPage={requestsPagination.maxPage} goTo={requestsPagination.goTo} />
  </div>
);

export default ClientRequestsSection; 