import React from 'react';

interface PaginationControlsProps {
  page: number;
  maxPage: number;
  goTo: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({ page, maxPage, goTo }) => (
  <div className="flex justify-center items-center gap-2 mt-4">
    <button onClick={() => goTo(page - 1)} disabled={page === 1} className="px-3 py-1 rounded bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-50">Prev</button>
    <span className="text-sm font-medium">Page {page} of {maxPage}</span>
    <button onClick={() => goTo(page + 1)} disabled={page === maxPage} className="px-3 py-1 rounded bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-50">Next</button>
  </div>
);

export default PaginationControls; 