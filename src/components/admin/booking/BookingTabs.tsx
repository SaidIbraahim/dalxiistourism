import React from 'react';

export interface BookingTabItem {
  id: 'incoming' | 'active' | 'history' | 'customers';
  label: string;
  count: number;
}

interface BookingTabsProps {
  items: BookingTabItem[];
  activeId: BookingTabItem['id'];
  onChange: (id: BookingTabItem['id']) => void;
}

const BookingTabs: React.FC<BookingTabsProps> = ({ items, activeId, onChange }) => {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex px-6 py-4 space-x-1">
        {items.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeId === tab.id
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </nav>
    </div>
  );
};

export default BookingTabs;


