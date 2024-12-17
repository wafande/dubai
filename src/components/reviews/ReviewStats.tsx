import React from 'react';
import { Star } from 'lucide-react';
import { ReviewStats as ReviewStatsType } from '../../services/reviewService';

interface ReviewStatsProps {
  stats: ReviewStatsType;
}

const ReviewStats: React.FC<ReviewStatsProps> = ({ stats }) => {
  const totalRatings = Object.values(stats.ratingDistribution).reduce(
    (sum, count) => sum + count,
    0
  );

  const getPercentage = (count: number) => {
    return totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Overall Rating */}
        <div className="flex flex-col items-center justify-center">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Overall Rating</h3>
          <div className="flex items-center space-x-2">
            <span className="text-4xl font-bold text-gray-900">
              {stats.averageRating.toFixed(1)}
            </span>
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-400 fill-current" />
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Based on {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        {/* Rating Distribution */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Rating Distribution</h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution];
              const percentage = getPercentage(count);

              return (
                <div key={rating} className="flex items-center">
                  <div className="flex items-center w-24">
                    <span className="text-sm text-gray-600 mr-2">{rating}</span>
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex-1 h-4 mx-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-16 text-right">
                    <span className="text-sm text-gray-600">{percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Review Summary */}
      <div className="mt-8 border-t pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.ratingDistribution[5]}
            </div>
            <div className="text-sm text-gray-500">5 Star Reviews</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {((stats.ratingDistribution[4] + stats.ratingDistribution[5]) / stats.totalReviews * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500">Positive Reviews</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.ratingDistribution[3]}
            </div>
            <div className="text-sm text-gray-500">Neutral Reviews</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {((stats.ratingDistribution[1] + stats.ratingDistribution[2]) / stats.totalReviews * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500">Critical Reviews</div>
          </div>
        </div>
      </div>

      {/* Review Tips */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Review Guidelines</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Share your personal experience</li>
          <li>• Be specific and detailed</li>
          <li>• Keep it honest and constructive</li>
          <li>• Include photos if possible</li>
        </ul>
      </div>
    </div>
  );
};

export default ReviewStats; 