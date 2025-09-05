import React, { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import { ServiceCard, Service } from './ServiceCard';

interface ServiceSelectionGridProps {
  services: Service[];
  selectedServices: Record<string, { quantity: number; participants: number }>;
  onServiceSelect: (serviceId: string) => void;
  onQuantityChange: (serviceId: string, quantity: number) => void;
  onShowServiceDetails: (service: Service) => void;
  participants: number;
  className?: string;
}

type SortOption = 'name' | 'price_low' | 'price_high' | 'rating' | 'category';

const categories = [
  { value: 'all', label: 'All Services' },
  { value: 'accommodation', label: 'Accommodation' },
  { value: 'transport', label: 'Transport' },
  { value: 'activity', label: 'Activities' },
  { value: 'guide', label: 'Guides' },
  { value: 'meal', label: 'Meals' }
];

const sortOptions = [
  { value: 'name', label: 'Name A-Z' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'category', label: 'Category' }
];

export const ServiceSelectionGrid: React.FC<ServiceSelectionGridProps> = ({
  services,
  selectedServices,
  onServiceSelect,
  onQuantityChange,
  onShowServiceDetails,
  participants,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');

  // Filter and sort services
  const filteredAndSortedServices = useMemo(() => {
    let filtered = services.filter(service => {
      // Search filter
      const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           service.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Category filter
      const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Sort services
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price_low':
          return a.basePrice - b.basePrice;
        case 'price_high':
          return b.basePrice - a.basePrice;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    return filtered;
  }, [services, searchTerm, selectedCategory, sortBy]);

  const selectedCount = Object.keys(selectedServices).length;

  return (
    <div className={`space-y-5 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Services</h2>
        <p className="text-lg text-gray-600 mb-4">
          Select multiple services to create your perfect Somalia experience
        </p>
        {selectedCount > 0 && (
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
            <span className="font-medium">{selectedCount} service{selectedCount !== 1 ? 's' : ''} selected</span>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>

          {/* Sort Filter */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* View locked to Grid (toggle removed for cleaner UI) */}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-left text-sm text-gray-600">
        Showing {filteredAndSortedServices.length} of {services.length} services
      </div>

      {/* Services Grid */}
      {filteredAndSortedServices.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Filter size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
          <p className="text-gray-600">
            Try adjusting your search criteria or filters to find more services.
          </p>
        </div>
      ) : (
        <div className={'grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4'}>
          {filteredAndSortedServices.map(service => (
            <ServiceCard
              key={service.id}
              service={service}
              isSelected={service.id in selectedServices}
              quantity={selectedServices[service.id]?.quantity || 0}
              participants={participants}
              onSelect={onServiceSelect}
              onQuantityChange={onQuantityChange}
              onShowDetails={onShowServiceDetails}
              className={''}
              compact={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};