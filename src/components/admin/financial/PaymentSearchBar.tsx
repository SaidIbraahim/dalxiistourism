import React from 'react';
import { Search } from 'lucide-react';
import { components, componentSizes } from '../../../styles/designSystem';

interface PaymentSearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  placeholder?: string;
}

const PaymentSearchBar: React.FC<PaymentSearchBarProps> = ({
  searchTerm,
  onSearchChange,
  placeholder = "Search by customer name, email, or package..."
}) => {
  return (
    <div className={`${components.card.base} ${componentSizes.card.padding}`}>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${componentSizes.icon.sm}`} />
          <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`${components.input.search} ${componentSizes.input.md} pl-10 pr-4 focus:ring-orange-200 focus:border-orange-500`}
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentSearchBar;
