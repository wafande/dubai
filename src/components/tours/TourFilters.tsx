import React from 'react';
import { motion } from 'framer-motion';
import type { VehicleType } from '../../types';

export interface FilterOptions {
  vehicleType?: VehicleType;
  priceRange?: [number, number];
  duration?: number;
  capacity?: number;
  sortBy?: 'price-asc' | 'price-desc' | 'duration' | 'rating';
}

interface TourFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  className?: string;
}

export const TourFilters: React.FC<TourFiltersProps> = ({
  filters,
  onFilterChange,
  className = ''
}) => {
  const vehicleTypes: Array<{ value: VehicleType; label: string }> = [
    { value: 'helicopter', label: 'Helicopter Tours' },
    { value: 'yacht', label: 'Yacht Charters' },
    { value: 'luxury-car', label: 'Luxury Cars' },
    { value: 'private-jet', label: 'Private Jets' }
  ];

  const sortOptions = [
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'duration', label: 'Duration' },
    { value: 'rating', label: 'Rating' }
  ];

  const handleVehicleTypeChange = (type: VehicleType | undefined) => {
    onFilterChange({ ...filters, vehicleType: type });
  };

  const handlePriceRangeChange = (range: [number, number]) => {
    onFilterChange({ ...filters, priceRange: range });
  };

  const handleDurationChange = (duration: number) => {
    onFilterChange({ ...filters, duration });
  };

  const handleCapacityChange = (capacity: number) => {
    onFilterChange({ ...filters, capacity });
  };

  const handleSortChange = (sortBy: FilterOptions['sortBy']) => {
    onFilterChange({ ...filters, sortBy });
  };

  return (
    <motion.div
      className={`bg-white rounded-lg shadow-md p-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Vehicle Type Filter */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Vehicle Type</h3>
        <div className="flex flex-wrap gap-2">
          <button
            className={`
              px-4 py-2 rounded-full text-sm font-medium
              ${!filters.vehicleType
                ? 'bg-amber-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
            onClick={() => handleVehicleTypeChange(undefined)}
          >
            All
          </button>
          {vehicleTypes.map(({ value, label }) => (
            <button
              key={value}
              className={`
                px-4 py-2 rounded-full text-sm font-medium
                ${filters.vehicleType === value
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
              onClick={() => handleVehicleTypeChange(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Price Range</h3>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={0}
            max={10000}
            step={100}
            value={filters.priceRange?.[1] ?? 10000}
            onChange={(e) => handlePriceRangeChange([0, parseInt(e.target.value)])}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm text-gray-600 whitespace-nowrap">
            Up to AED {filters.priceRange?.[1]?.toLocaleString() ?? '10,000'}
          </span>
        </div>
      </div>

      {/* Duration Filter */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Duration (Hours)</h3>
        <select
          value={filters.duration}
          onChange={(e) => handleDurationChange(parseInt(e.target.value))}
          className="w-full p-2 border border-gray-300 rounded-lg"
        >
          <option value="">Any Duration</option>
          <option value="1">1 Hour</option>
          <option value="2">2 Hours</option>
          <option value="4">4 Hours</option>
          <option value="8">8 Hours</option>
        </select>
      </div>

      {/* Sort Options */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Sort By</h3>
        <select
          value={filters.sortBy}
          onChange={(e) => handleSortChange(e.target.value as FilterOptions['sortBy'])}
          className="w-full p-2 border border-gray-300 rounded-lg"
        >
          {sortOptions.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters */}
      {(filters.vehicleType || filters.priceRange || filters.duration || filters.sortBy) && (
        <motion.button
          className="mt-6 w-full px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
          onClick={() => onFilterChange({})}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          Clear Filters
        </motion.button>
      )}
    </motion.div>
  );
}; 