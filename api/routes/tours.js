const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const pool = require('../config/database');

// Get all tours with optional filters
router.get('/', async (req, res) => {
  try {
    const { type, isActive } = req.query;
    let query = 'SELECT * FROM fleet WHERE 1=1';
    const params = [];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    if (isActive !== undefined) {
      query += ' AND is_active = ?';
      params.push(isActive === 'true');
    }

    const [tours] = await pool.query(query, params);
    
    // Parse JSON fields
    const formattedTours = tours.map(tour => ({
      ...tour,
      features: JSON.parse(tour.features || '[]'),
      specifications: JSON.parse(tour.specifications || '{}'),
      maintenance_schedule: tour.maintenance_schedule ? JSON.parse(tour.maintenance_schedule) : null
    }));

    res.json(formattedTours);
  } catch (error) {
    console.error('Error fetching tours:', error);
    res.status(500).json({ error: 'Failed to fetch tours' });
  }
});

// Get single tour by ID
router.get('/:id', async (req, res) => {
  try {
    const [tours] = await pool.query('SELECT * FROM fleet WHERE id = ?', [req.params.id]);
    
    if (tours.length === 0) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    const tour = {
      ...tours[0],
      features: JSON.parse(tours[0].features || '[]'),
      specifications: JSON.parse(tours[0].specifications || '{}'),
      maintenance_schedule: tours[0].maintenance_schedule ? JSON.parse(tours[0].maintenance_schedule) : null
    };

    res.json(tour);
  } catch (error) {
    console.error('Error fetching tour:', error);
    res.status(500).json({ error: 'Failed to fetch tour' });
  }
});

// Create new tour (admin only)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const {
      name,
      type,
      description,
      price_per_hour,
      price_per_day,
      capacity,
      location,
      image_url,
      features,
      specifications,
      is_active,
      maintenance_schedule
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO fleet (
        name, type, description, price_per_hour, price_per_day,
        capacity, location, image_url, features, specifications,
        is_active, maintenance_schedule, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        name,
        type,
        description,
        price_per_hour,
        price_per_day,
        capacity,
        location,
        image_url,
        JSON.stringify(features),
        JSON.stringify(specifications),
        is_active,
        maintenance_schedule ? JSON.stringify(maintenance_schedule) : null
      ]
    );

    res.status(201).json({
      id: result.insertId,
      ...req.body
    });
  } catch (error) {
    console.error('Error creating tour:', error);
    res.status(500).json({ error: 'Failed to create tour' });
  }
});

// Update tour (admin only)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const {
      name,
      type,
      description,
      price_per_hour,
      price_per_day,
      capacity,
      location,
      image_url,
      features,
      specifications,
      is_active,
      maintenance_schedule
    } = req.body;

    const [result] = await pool.query(
      `UPDATE fleet SET
        name = ?, type = ?, description = ?, price_per_hour = ?,
        price_per_day = ?, capacity = ?, location = ?, image_url = ?,
        features = ?, specifications = ?, is_active = ?,
        maintenance_schedule = ?, updated_at = NOW()
      WHERE id = ?`,
      [
        name,
        type,
        description,
        price_per_hour,
        price_per_day,
        capacity,
        location,
        image_url,
        JSON.stringify(features),
        JSON.stringify(specifications),
        is_active,
        maintenance_schedule ? JSON.stringify(maintenance_schedule) : null,
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    res.json({
      id: req.params.id,
      ...req.body
    });
  } catch (error) {
    console.error('Error updating tour:', error);
    res.status(500).json({ error: 'Failed to update tour' });
  }
});

// Delete tour (admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM fleet WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    res.json({ message: 'Tour deleted successfully' });
  } catch (error) {
    console.error('Error deleting tour:', error);
    res.status(500).json({ error: 'Failed to delete tour' });
  }
});

module.exports = router; 