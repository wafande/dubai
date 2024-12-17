import React, { useState } from 'react';
import { Star, Flag, MoreVertical, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Review } from '../../services/reviewService';
import { useAuth } from '../../contexts/AuthContext';

interface ReviewItemProps {
  review: Review;
  onRespond?: (reviewId: string, content: string) => Promise<void>;
  onReport?: (reviewId: string, reason: string) => Promise<void>;
  onDelete?: (reviewId: string) => Promise<void>;
  onEdit?: (review: Review) => void;
  isAdmin?: boolean;
}

const ReviewItem: React.FC<ReviewItemProps> = ({
  review,
  onRespond,
  onReport,
  onDelete,
  onEdit,
  isAdmin = false,
}) => {
  const { user } = useAuth();
  const [showActions, setShowActions] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [response, setResponse] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const handleRespond = async () => {
    if (!response.trim()) return;

    try {
      await onRespond?.(review.id, response);
      setResponse('');
      setIsResponding(false);
    } catch (error) {
      console.error('Failed to respond to review:', error);
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) return;

    try {
      await onReport?.(review.id, reportReason);
      setReportReason('');
      setIsReporting(false);
    } catch (error) {
      console.error('Failed to report review:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await onDelete?.(review.id);
      } catch (error) {
        console.error('Failed to delete review:', error);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
              <span className="text-teal-800 font-medium">
                {review.userName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center">
              <h4 className="text-lg font-medium text-gray-900">
                {review.userName}
              </h4>
              <span className="ml-2 text-sm text-gray-500">
                {format(new Date(review.createdAt), 'MMM d, yyyy')}
              </span>
            </div>
            <div className="flex items-center mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= review.rating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="text-gray-400 hover:text-gray-500"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
          {showActions && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
              <div className="py-1" role="menu">
                {(isAdmin || user?.id === review.userId) && (
                  <>
                    <button
                      onClick={() => {
                        setShowActions(false);
                        onEdit?.(review);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Edit Review
                    </button>
                    <button
                      onClick={() => {
                        setShowActions(false);
                        handleDelete();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Delete Review
                    </button>
                  </>
                )}
                {isAdmin && (
                  <button
                    onClick={() => {
                      setShowActions(false);
                      setIsResponding(true);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    Respond to Review
                  </button>
                )}
                {!isAdmin && user?.id !== review.userId && (
                  <button
                    onClick={() => {
                      setShowActions(false);
                      setIsReporting(true);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    Report Review
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <h5 className="text-lg font-medium text-gray-900 mb-2">{review.title}</h5>
        <p className="text-gray-600">{review.content}</p>
      </div>

      {review.images && review.images.length > 0 && (
        <div className="flex space-x-2 mt-4">
          {review.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Review image ${index + 1}`}
              className="h-20 w-20 object-cover rounded-lg"
            />
          ))}
        </div>
      )}

      {review.response && (
        <div className="mt-4 pl-4 border-l-4 border-teal-500">
          <div className="bg-teal-50 p-4 rounded-r-lg">
            <div className="flex items-center mb-2">
              <MessageCircle className="h-5 w-5 text-teal-600 mr-2" />
              <span className="font-medium text-teal-900">Response from Business</span>
            </div>
            <p className="text-teal-800">{review.response.content}</p>
            <span className="text-sm text-teal-600 mt-2 block">
              {format(new Date(review.response.createdAt), 'MMM d, yyyy')}
            </span>
          </div>
        </div>
      )}

      {isResponding && (
        <div className="mt-4">
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Write your response..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            rows={3}
          />
          <div className="mt-2 flex justify-end space-x-2">
            <button
              onClick={() => setIsResponding(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleRespond}
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md"
            >
              Submit Response
            </button>
          </div>
        </div>
      )}

      {isReporting && (
        <div className="mt-4">
          <textarea
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Why are you reporting this review?"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            rows={3}
          />
          <div className="mt-2 flex justify-end space-x-2">
            <button
              onClick={() => setIsReporting(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleReport}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
            >
              Submit Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewItem; 