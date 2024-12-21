const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const pool = require('../config/database');

// Helper function to update tour rating statistics
const updateTourRating = async (tourId) => {
  try {
    const [result] = await pool.query(
      `SELECT 
        AVG(rating) as average_rating,
        COUNT(*) as total_reviews
       FROM reviews 
       WHERE tour_id = ?`,
      [tourId]
    );

    await pool.query(
      `UPDATE tours 
       SET average_rating = ?, total_reviews = ?
       WHERE id = ?`,
      [result[0].average_rating || 0, result[0].total_reviews, tourId]
    );
  } catch (error) {
    console.error('Error updating tour rating:', error);
    throw error;
  }
};

// Get all reviews
router.get('/reviews', async (req, res) => {
  try {
    const [reviews] = await pool.query(
      `SELECT r.*, u.username 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       ORDER BY r.created_at DESC`
    );

    // Parse JSON fields
    const formattedReviews = reviews.map(review => ({
      ...review,
      images: review.images ? JSON.parse(review.images) : []
    }));

    res.json(formattedReviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Get reviews for a specific tour
router.get('/tours/:tourId/reviews', async (req, res) => {
  try {
    const [reviews] = await pool.query(
      `SELECT r.*, u.username 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.tour_id = ?
       ORDER BY r.created_at DESC`,
      [req.params.tourId]
    );

    // Parse JSON fields
    const formattedReviews = reviews.map(review => ({
      ...review,
      images: review.images ? JSON.parse(review.images) : []
    }));

    res.json(formattedReviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Create a new review
router.post('/reviews', auth, async (req, res) => {
  try {
    const { tour_id, rating, comment, images } = req.body;
    const userId = req.user.id;

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if user has already reviewed this tour
    const [existingReviews] = await pool.query(
      'SELECT id FROM reviews WHERE tour_id = ? AND user_id = ?',
      [tour_id, userId]
    );

    if (existingReviews.length > 0) {
      return res.status(400).json({ error: 'You have already reviewed this tour' });
    }

    // Create review
    const [result] = await pool.query(
      `INSERT INTO reviews (
        tour_id, user_id, rating, comment, images, created_at
      ) VALUES (?, ?, ?, ?, ?, NOW())`,
      [tour_id, userId, rating, comment, images ? JSON.stringify(images) : null]
    );

    // Update tour rating statistics
    await updateTourRating(tour_id);

    const [newReview] = await pool.query(
      `SELECT r.*, u.username 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      ...newReview[0],
      images: newReview[0].images ? JSON.parse(newReview[0].images) : []
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Update a review
router.put('/reviews/:reviewId', auth, async (req, res) => {
  try {
    const { rating, comment, images } = req.body;
    const userId = req.user.id;

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if review exists and belongs to user
    const [reviews] = await pool.query(
      'SELECT * FROM reviews WHERE id = ? AND user_id = ?',
      [req.params.reviewId, userId]
    );

    if (reviews.length === 0) {
      return res.status(404).json({ error: 'Review not found or unauthorized' });
    }

    // Update review
    await pool.query(
      `UPDATE reviews SET
        rating = ?,
        comment = ?,
        images = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [rating, comment, images ? JSON.stringify(images) : null, req.params.reviewId]
    );

    // Update tour rating statistics
    await updateTourRating(reviews[0].tour_id);

    const [updatedReview] = await pool.query(
      `SELECT r.*, u.username 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.id = ?`,
      [req.params.reviewId]
    );

    res.json({
      ...updatedReview[0],
      images: updatedReview[0].images ? JSON.parse(updatedReview[0].images) : []
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// Delete a review
router.delete('/reviews/:reviewId', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if review exists and belongs to user
    const [reviews] = await pool.query(
      'SELECT * FROM reviews WHERE id = ? AND user_id = ?',
      [req.params.reviewId, userId]
    );

    if (reviews.length === 0) {
      return res.status(404).json({ error: 'Review not found or unauthorized' });
    }

    const tourId = reviews[0].tour_id;

    // Delete review
    await pool.query('DELETE FROM reviews WHERE id = ?', [req.params.reviewId]);

    // Update tour rating statistics
    await updateTourRating(tourId);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

module.exports = router; 