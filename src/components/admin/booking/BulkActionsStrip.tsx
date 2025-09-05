import React from 'react';

interface BulkActionsStripProps {
  selectedCount: number;
  totalCount: number;
  onBulkAction: (action: string) => void;
  onSelectAll: (selected: boolean) => void;
  allSelected: boolean;
}

const BulkActionsStrip: React.FC<BulkActionsStripProps> = ({
  selectedCount,
  totalCount,
  onBulkAction,
  onSelectAll,
  allSelected
}) => {
  if (selectedCount === 0) return null;

  return (
    <>
      {/* Enhanced Bulk Actions */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">{selectedCount}</span>
            </div>
            <span className="text-sm font-medium text-blue-800">
              {selectedCount} booking(s) selected
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onBulkAction('approve')}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              ✓ Approve All
            </button>
            <button
              onClick={() => onBulkAction('reject')}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              ✗ Reject All
            </button>
            <button
              onClick={() => onSelectAll(false)}
              className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Clear Selection
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Select All Checkbox */}
      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={(e) => onSelectAll(e.target.checked)}
          className="rounded border-gray-300 text-[#f29520] focus:ring-[#f29520] w-5 h-5"
        />
        <span className="text-sm font-medium text-gray-700">
          Select all {totalCount} bookings
        </span>
        <span className="text-xs text-gray-500">
          ({totalCount} of {totalCount} total)
        </span>
      </div>
    </>
  );
};

export default BulkActionsStrip;
