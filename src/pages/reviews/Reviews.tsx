import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { reviewService, Review } from '../../services/reviewService';
import { useAuth } from '../../contexts/AuthContext';
import ReviewStats from '../../components/reviews/ReviewStats';
import ReviewList from '../../components/reviews/ReviewList';
import ReviewForm from '../../components/reviews/ReviewForm';

const Reviews: React.FC = () => {
  const { tourId } = useParams<{ tourId: string }>();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [tourId]);

  const loadReviews = async () => {
    if (!tourId) return;

    setIsLoading(true);
    try {
      const [fetchedReviews, reviewStats] = await Promise.all([
        reviewService.getReviewsByTour(tourId),
        reviewService.getReviewStats(tourId),
      ]);
      setReviews(fetchedReviews);
      setStats(reviewStats);
    } catch (error) {
      console.error('Failed to load reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async (formData: any) => {
    if (!tourId || !user) return;

    setIsSubmitting(true);
    try {
      if (selectedReview) {
        // Update existing review
        const updatedReview = await reviewService.updateReview({
          id: selectedReview.id,
          ...formData,
        });
        setReviews(reviews.map(review =>
          review.id === updatedReview.id ? updatedReview : review
        ));
        toast.success('Review updated successfully');
      } else {
        // Create new review
        const newReview = await reviewService.createReview({
          ...formData,
          tourId,
        });
        setReviews([newReview, ...reviews]);
        toast.success('Review submitted successfully');
      }
      setShowReviewForm(false);
      setSelectedReview(null);
      loadReviews(); // Reload to update stats
    } catch (error) {
      console.error('Failed to submit review:', error);
      toast.error(selectedReview ? 'Failed to update review' : 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRespondToReview = async (reviewId: string, content: string) => {
    try {
      const updatedReview = await reviewService.respondToReview({
        reviewId,
        content,
      });
      setReviews(reviews.map(review =>
        review.id === updatedReview.id ? updatedReview : review
      ));
      toast.success('Response added successfully');
    } catch (error) {
      console.error('Failed to respond to review:', error);
      toast.error('Failed to add response');
    }
  };

  const handleReportReview = async (reviewId: string, reason: string) => {
    try {
      await reviewService.reportReview(reviewId, reason);
      toast.success('Review reported successfully');
    } catch (error) {
      console.error('Failed to report review:', error);
      toast.error('Failed to report review');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await reviewService.deleteReview(reviewId);
      setReviews(reviews.filter(review => review.id !== reviewId));
      toast.success('Review deleted successfully');
      loadReviews(); // Reload to update stats
    } catch (error) {
      console.error('Failed to delete review:', error);
      toast.error('Failed to delete review');
    }
  };

  const handleEditReview = (review: Review) => {
    setSelectedReview(review);
    setShowReviewForm(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Reviews & Ratings</h1>
          {user && !showReviewForm && (
            <button
              onClick={() => {
                setSelectedReview(null);
                setShowReviewForm(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700"
            >
              Write a Review
            </button>
          )}
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedReview ? 'Edit Review' : 'Write a Review'}
              </h2>
              <button
                onClick={() => {
                  setShowReviewForm(false);
                  setSelectedReview(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <ReviewForm
              tourId={tourId}
              review={selectedReview}
              onSubmit={handleSubmitReview}
              onCancel={() => {
                setShowReviewForm(false);
                setSelectedReview(null);
              }}
              isSubmitting={isSubmitting}
            />
          </div>
        )}

        {/* Review Stats */}
        <ReviewStats stats={stats} />

        {/* Review List */}
        <ReviewList
          reviews={reviews}
          onRespond={handleRespondToReview}
          onReport={handleReportReview}
          onDelete={handleDeleteReview}
          onEdit={handleEditReview}
          isAdmin={user?.role === 'admin'}
        />
      </div>
    </div>
  );
};

export default Reviews; 