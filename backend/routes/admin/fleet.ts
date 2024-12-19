import express from 'express';
import { pool } from '../../config/database';
import { authenticateToken, isAdmin } from '../../middleware/auth';

const router = express.Router();

// Get all fleet vehicles
router.get('/api/admin/fleet', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [vehicles] = await pool.query('SELECT * FROM fleet ORDER BY created_at DESC');
    res.json(vehicles);
  } catch (error) {
    console.error('Error fetching fleet:', error);
    res.status(500).json({ error: 'Failed to fetch fleet vehicles' });
  }
});

// Add new vehicle
router.post('/api/admin/fleet', authenticateToken, isAdmin, async (req, res) => {
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
        features,
        specifications,
        is_active ? 1 : 0,
        maintenance_schedule
      ]
    );

    const [newVehicle] = await pool.query('SELECT * FROM fleet WHERE id = ?', [result.insertId]);
    res.status(201).json(newVehicle[0]);
  } catch (error) {
    console.error('Error adding vehicle:', error);
    res.status(500).json({ error: 'Failed to add vehicle' });
  }
});

// Update vehicle
router.put('/api/admin/fleet/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
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

    await pool.query(
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
        features,
        specifications,
        is_active ? 1 : 0,
        maintenance_schedule,
        id
      ]
    );

    const [updatedVehicle] = await pool.query('SELECT * FROM fleet WHERE id = ?', [id]);
    res.json(updatedVehicle[0]);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
});

// Delete vehicle
router.delete('/api/admin/fleet/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM fleet WHERE id = ?', [id]);
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
});

export default router; 