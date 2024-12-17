import { api } from './api';

export interface Review {
  id: string;
  tourId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  response?: {
    content: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface CreateReviewInput {
  tourId: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
}

export interface UpdateReviewInput extends Partial<CreateReviewInput> {
  id: string;
}

export interface ReviewResponse {
  reviewId: string;
  content: string;
}

class ReviewService {
  private readonly storageKey = 'dubai_charter_reviews';

  private saveReviews(reviews: Review[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(reviews));
  }

  private getReviews(): Review[] {
    const reviews = localStorage.getItem(this.storageKey);
    return reviews ? JSON.parse(reviews) : [];
  }

  async getAllReviews(): Promise<Review[]> {
    try {
      const response = await api.get('/reviews');
      const reviews = response.data;
      this.saveReviews(reviews);
      return reviews;
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      return this.getReviews();
    }
  }

  async getReviewById(id: string): Promise<Review | null> {
    try {
      const response = await api.get(`/reviews/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch review:', error);
      const reviews = this.getReviews();
      return reviews.find(review => review.id === id) || null;
    }
  }

  async getReviewsByTour(tourId: string): Promise<Review[]> {
    try {
      const response = await api.get(`/tours/${tourId}/reviews`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tour reviews:', error);
      const reviews = this.getReviews();
      return reviews.filter(review => review.tourId === tourId);
    }
  }

  async getReviewsByUser(userId: string): Promise<Review[]> {
    try {
      const response = await api.get(`/users/${userId}/reviews`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user reviews:', error);
      const reviews = this.getReviews();
      return reviews.filter(review => review.userId === userId);
    }
  }

  async createReview(input: CreateReviewInput): Promise<Review> {
    try {
      const response = await api.post('/reviews', input);
      const newReview = response.data;
      const reviews = this.getReviews();
      reviews.push(newReview);
      this.saveReviews(reviews);
      return newReview;
    } catch (error) {
      console.error('Failed to create review:', error);
      throw error;
    }
  }

  async updateReview(input: UpdateReviewInput): Promise<Review> {
    try {
      const response = await api.put(`/reviews/${input.id}`, input);
      const updatedReview = response.data;
      const reviews = this.getReviews();
      const index = reviews.findIndex(review => review.id === input.id);
      if (index !== -1) {
        reviews[index] = updatedReview;
        this.saveReviews(reviews);
      }
      return updatedReview;
    } catch (error) {
      console.error('Failed to update review:', error);
      throw error;
    }
  }

  async deleteReview(id: string): Promise<void> {
    try {
      await api.delete(`/reviews/${id}`);
      const reviews = this.getReviews();
      const filteredReviews = reviews.filter(review => review.id !== id);
      this.saveReviews(filteredReviews);
    } catch (error) {
      console.error('Failed to delete review:', error);
      throw error;
    }
  }

  async respondToReview(input: ReviewResponse): Promise<Review> {
    try {
      const response = await api.post(`/reviews/${input.reviewId}/response`, {
        content: input.content,
      });
      const updatedReview = response.data;
      const reviews = this.getReviews();
      const index = reviews.findIndex(review => review.id === input.reviewId);
      if (index !== -1) {
        reviews[index] = updatedReview;
        this.saveReviews(reviews);
      }
      return updatedReview;
    } catch (error) {
      console.error('Failed to respond to review:', error);
      throw error;
    }
  }

  async updateReviewStatus(
    id: string,
    status: Review['status']
  ): Promise<Review> {
    try {
      const response = await api.put(`/reviews/${id}/status`, { status });
      const updatedReview = response.data;
      const reviews = this.getReviews();
      const index = reviews.findIndex(review => review.id === id);
      if (index !== -1) {
        reviews[index] = updatedReview;
        this.saveReviews(reviews);
      }
      return updatedReview;
    } catch (error) {
      console.error('Failed to update review status:', error);
      throw error;
    }
  }

  async getReviewStats(tourId: string): Promise<ReviewStats> {
    try {
      const response = await api.get(`/tours/${tourId}/review-stats`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch review stats:', error);
      const reviews = this.getReviews().filter(review => review.tourId === tourId);
      
      const ratingDistribution = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };

      reviews.forEach(review => {
        ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
      });

      const totalReviews = reviews.length;
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

      return {
        averageRating,
        totalReviews,
        ratingDistribution,
      };
    }
  }

  async reportReview(id: string, reason: string): Promise<void> {
    try {
      await api.post(`/reviews/${id}/report`, { reason });
    } catch (error) {
      console.error('Failed to report review:', error);
      throw error;
    }
  }
}

export const reviewService = new ReviewService(); 