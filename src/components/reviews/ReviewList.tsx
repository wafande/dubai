import React, { useState } from 'react';
import { ChevronDown, Filter, Search } from 'lucide-react';
import { Review } from '../../services/reviewService';
import ReviewItem from './ReviewItem';

interface ReviewListProps {
  reviews: Review[];
  onRespond?: (reviewId: string, content: string) => Promise<void>;
  onReport?: (reviewId: string, reason: string) => Promise<void>;
  onDelete?: (reviewId: string) => Promise<void>;
  onEdit?: (review: Review) => void;
  isAdmin?: boolean;
}

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest' | 'most-helpful';
type FilterOption = 'all' | '5' | '4' | '3' | '2' | '1' | 'with-photos' | 'with-response';

const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  onRespond,
  onReport,
  onDelete,
  onEdit,
  isAdmin = false,
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filterReviews = (reviews: Review[]) => {
    let filtered = [...reviews];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        review =>
          review.title.toLowerCase().includes(query) ||
          review.content.toLowerCase().includes(query) ||
          review.userName.toLowerCase().includes(query)
      );
    }

    // Apply rating filter
    if (['5', '4', '3', '2', '1'].includes(filterBy)) {
      filtered = filtered.filter(
        review => review.rating === parseInt(filterBy)
      );
    } else if (filterBy === 'with-photos') {
      filtered = filtered.filter(
        review => review.images && review.images.length > 0
      );
    } else if (filterBy === 'with-response') {
      filtered = filtered.filter(review => review.response);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredReviews = filterReviews(reviews);

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="relative">
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50"
            >
              <Filter className="h-5 w-5 text-gray-500" />
              <span>Filter</span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>
            {showFilters && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setFilterBy('all');
                      setShowFilters(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      filterBy === 'all'
                        ? 'bg-teal-50 text-teal-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    All Reviews
                  </button>
                  {['5', '4', '3', '2', '1'].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => {
                        setFilterBy(rating as FilterOption);
                        setShowFilters(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        filterBy === rating
                          ? 'bg-teal-50 text-teal-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {rating} Star Reviews
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setFilterBy('with-photos');
                      setShowFilters(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      filterBy === 'with-photos'
                        ? 'bg-teal-50 text-teal-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    With Photos
                  </button>
                  <button
                    onClick={() => {
                      setFilterBy('with-response');
                      setShowFilters(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      filterBy === 'with-response'
                        ? 'bg-teal-50 text-teal-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    With Response
                  </button>
                </div>
              </div>
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No reviews found matching your criteria.</p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <ReviewItem
              key={review.id}
              review={review}
              onRespond={onRespond}
              onReport={onReport}
              onDelete={onDelete}
              onEdit={onEdit}
              isAdmin={isAdmin}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewList; 