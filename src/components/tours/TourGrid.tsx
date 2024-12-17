import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TourCard } from './TourCard';
import { TourFilters, FilterOptions } from './TourFilters';
import type { TourPackage } from '../../types';

interface TourGridProps {
  tours: TourPackage[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export const TourGrid: React.FC<TourGridProps> = ({
  tours,
  title,
  subtitle,
  className = ''
}) => {
  const [filters, setFilters] = useState<FilterOptions>({});
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);

  const filteredTours = useMemo(() => {
    let result = [...tours];

    // Apply vehicle type filter
    if (filters.vehicleType) {
      result = result.filter(tour => tour.type === filters.vehicleType);
    }

    // Apply price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      result = result.filter(tour => tour.price >= min && tour.price <= max);
    }

    // Apply duration filter
    if (filters.duration) {
      result = result.filter(tour => tour.duration === filters.duration);
    }

    // Apply capacity filter
    if (filters.capacity) {
      result = result.filter(tour => tour.maxCapacity >= filters.capacity);
    }

    // Apply sorting
    if (filters.sortBy) {
      result.sort((a, b) => {
        switch (filters.sortBy) {
          case 'price-asc':
            return a.price - b.price;
          case 'price-desc':
            return b.price - a.price;
          case 'duration':
            return b.duration - a.duration;
          case 'rating':
            return b.rating - a.rating;
          default:
            return 0;
        }
      });
    }

    return result;
  }, [tours, filters]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <section className={`py-16 ${className}`}>
      {/* Section Header */}
      {(title || subtitle) && (
        <div className="text-center mb-12">
          {title && (
            <motion.h2
              className="text-4xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {title}
            </motion.h2>
          )}
          {subtitle && (
            <motion.p
              className="text-xl text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              {subtitle}
            </motion.p>
          )}
        </div>
      )}

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters - Mobile Toggle */}
          <div className="lg:hidden mb-4">
            <button
              className="w-full px-4 py-2 bg-white rounded-lg shadow text-gray-600 flex items-center justify-center"
              onClick={() => setIsFiltersVisible(!isFiltersVisible)}
            >
              <span className="mr-2">{isFiltersVisible ? 'Hide' : 'Show'} Filters</span>
              <svg
                className={`w-5 h-5 transform transition-transform ${isFiltersVisible ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Filters Sidebar */}
          <AnimatePresence>
            {(isFiltersVisible || window.innerWidth >= 1024) && (
              <motion.div
                className="lg:w-80 flex-shrink-0"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <TourFilters
                  filters={filters}
                  onFilterChange={setFilters}
                  className="sticky top-4"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tour Grid */}
          <motion.div
            className="flex-1"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Results Count */}
            <div className="mb-6 text-gray-600">
              Showing {filteredTours.length} of {tours.length} tours
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredTours.map((tour, index) => (
                <TourCard
                  key={tour.id}
                  tour={tour}
                  priority={index < 3}
                />
              ))}
            </div>

            {/* Empty State */}
            {filteredTours.length === 0 && (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-gray-500 text-lg mb-4">
                  No tours match your filters.
                </p>
                <button
                  className="text-amber-500 font-medium hover:text-amber-600"
                  onClick={() => setFilters({})}
                >
                  Clear all filters
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}; 