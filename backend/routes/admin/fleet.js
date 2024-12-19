const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/fleet')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit per file
  }
});

// Helper function for safe JSON parsing
const safeJSONParse = (str, defaultValue = null) => {
  if (!str) return defaultValue;
  if (typeof str === 'object') return str; // Already an object/array
  try {
    const parsed = JSON.parse(str);
    return parsed || defaultValue;
  } catch (error) {
    console.warn('Failed to parse JSON:', str);
    return defaultValue;
  }
};

// Get all fleet items
router.get('/', async (req, res) => {
  try {
    // Join fleet with fleet_images to get all images for each vehicle
    const [rows] = await pool.query(`
      SELECT 
        f.*,
        GROUP_CONCAT(fi.image_url) as image_urls,
        GROUP_CONCAT(fi.is_primary) as is_primary_flags,
        GROUP_CONCAT(fi.display_order) as display_orders
      FROM fleet f
      LEFT JOIN fleet_images fi ON f.id = fi.fleet_id
      GROUP BY f.id
      ORDER BY f.created_at DESC
    `);

    // Format the response with safe JSON parsing
    const formattedRows = rows.map(row => {
      // Process images
      const imageUrls = row.image_urls ? row.image_urls.split(',') : [];
      const isPrimaryFlags = row.is_primary_flags ? row.is_primary_flags.split(',').map(f => f === '1') : [];
      const displayOrders = row.display_orders ? row.display_orders.split(',').map(Number) : [];
      
      const images = imageUrls.map((url, index) => ({
        url,
        is_primary: isPrimaryFlags[index] || false,
        display_order: displayOrders[index] || 0
      })).sort((a, b) => a.display_order - b.display_order);

      return {
      ...row,
        images: images.map(img => img.url),
      features: safeJSONParse(row.features, []),
      specifications: safeJSONParse(row.specifications, {}),
      maintenance_schedule: safeJSONParse(row.maintenance_schedule, {
        lastMaintenance: "",
        nextMaintenance: "",
        notes: ""
      })
      };
    });

    res.json(formattedRows);
  } catch (error) {
    console.error('Error fetching fleet:', error);
    res.status(500).json({ error: 'Failed to fetch fleet' });
  }
});

// Get single fleet item
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT f.*, GROUP_CONCAT(fi.image_url) as images
      FROM fleet f
      LEFT JOIN fleet_images fi ON f.id = fi.fleet_id
      WHERE f.id = ?
      GROUP BY f.id
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Format the response with safe JSON parsing
    const vehicle = {
      ...rows[0],
      images: rows[0].images ? rows[0].images.split(',') : [],
      features: safeJSONParse(rows[0].features, []),
      specifications: safeJSONParse(rows[0].specifications, {}),
      maintenance_schedule: safeJSONParse(rows[0].maintenance_schedule, {
        lastMaintenance: "",
        nextMaintenance: "",
        notes: ""
      })
    };

    res.json(vehicle);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
});

// Create new fleet item
router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { name, description, capacity, images, type, price_per_hour, price_per_day, location, features, specifications, is_active } = req.body;
    
    // Insert into fleet table with proper JSON handling
    const [result] = await connection.query(
      `INSERT INTO fleet (
        name, description, type, capacity, price_per_hour, price_per_day, 
        location, features, specifications, maintenance_schedule, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, 
        description, 
        type, 
        capacity, 
        price_per_hour, 
        price_per_day, 
        location,
        JSON.stringify(features || []),
        JSON.stringify(specifications || {}),
        JSON.stringify({
          lastMaintenance: "",
          nextMaintenance: "",
          notes: ""
        }),
        is_active
      ]
    );

    // Insert images with proper ordering
    if (images && images.length > 0) {
      const imageValues = images.map((image, index) => [
        result.insertId,
        image,
        index === 0, // is_primary
        index // display_order
      ]);
      
      await connection.query(
        'INSERT INTO fleet_images (fleet_id, image_url, is_primary, display_order) VALUES ?',
        [imageValues]
      );
    }

    await connection.commit();
    
    // Fetch the newly created vehicle with all its data
    const [newVehicle] = await connection.query(`
      SELECT 
        f.*,
        GROUP_CONCAT(fi.image_url) as image_urls,
        GROUP_CONCAT(fi.is_primary) as is_primary_flags,
        GROUP_CONCAT(fi.display_order) as display_orders
      FROM fleet f
      LEFT JOIN fleet_images fi ON f.id = fi.fleet_id
      WHERE f.id = ?
      GROUP BY f.id
    `, [result.insertId]);

    const formattedVehicle = {
      ...newVehicle[0],
      images: newVehicle[0].image_urls ? newVehicle[0].image_urls.split(',') : [],
      features: safeJSONParse(newVehicle[0].features, []),
      specifications: safeJSONParse(newVehicle[0].specifications, {}),
      maintenance_schedule: safeJSONParse(newVehicle[0].maintenance_schedule, {
        lastMaintenance: "",
        nextMaintenance: "",
        notes: ""
      })
    };

    res.status(201).json({ 
      message: 'Vehicle created successfully',
      vehicle: formattedVehicle
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating vehicle:', error);
    res.status(500).json({ error: 'Failed to create vehicle' });
  } finally {
    connection.release();
  }
});

// Update fleet item
router.put('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { name, description, capacity, images, type, price_per_hour, price_per_day, location, features, specifications, is_active } = req.body;
    
    // First check if vehicle exists
    const [existingVehicles] = await connection.query('SELECT id FROM fleet WHERE id = ?', [req.params.id]);
    
    if (!existingVehicles || existingVehicles.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Update fleet table
    await connection.query(
      `UPDATE fleet SET 
        name = ?, 
        description = ?, 
        type = ?,
        capacity = ?, 
        price_per_hour = ?,
        price_per_day = ?,
        location = ?,
        features = ?,
        specifications = ?,
        maintenance_schedule = ?,
        is_active = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        name, 
        description,
        type, 
        capacity,
        price_per_hour,
        price_per_day,
        location,
        JSON.stringify(features || []),
        JSON.stringify(specifications || {}),
        JSON.stringify({
          lastMaintenance: "",
          nextMaintenance: "",
          notes: ""
        }),
        is_active,
        req.params.id
      ]
    );

    // Update images in fleet_images table
    if (images && images.length > 0) {
      // Delete existing images
      await connection.query('DELETE FROM fleet_images WHERE fleet_id = ?', [req.params.id]);
      
      // Insert new images
      const imageValues = images.map((image, index) => [
        req.params.id,
        image,
        index === 0,
        index
      ]);
      
      await connection.query(
        'INSERT INTO fleet_images (fleet_id, image_url, is_primary, display_order) VALUES ?',
        [imageValues]
      );
    }

    await connection.commit();

    // Fetch the updated vehicle
    const [updatedVehicle] = await connection.query(`
      SELECT 
        f.*,
        GROUP_CONCAT(fi.image_url) as images
      FROM fleet f
      LEFT JOIN fleet_images fi ON f.id = fi.fleet_id
      WHERE f.id = ?
      GROUP BY f.id
    `, [req.params.id]);

    const formattedVehicle = {
      ...updatedVehicle[0],
      images: updatedVehicle[0].images ? updatedVehicle[0].images.split(',') : [],
      features: safeJSONParse(updatedVehicle[0].features, []),
      specifications: safeJSONParse(updatedVehicle[0].specifications, {}),
      maintenance_schedule: safeJSONParse(updatedVehicle[0].maintenance_schedule, {
        lastMaintenance: "",
        nextMaintenance: "",
        notes: ""
      })
    };

    res.json({ 
      message: 'Vehicle updated successfully',
      vehicle: formattedVehicle
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating vehicle:', error);
    res.status(500).json({ error: 'Failed to update vehicle' });
  } finally {
    connection.release();
  }
});

// Delete fleet item
router.delete('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Delete images first (due to foreign key constraint)
    await connection.query('DELETE FROM fleet_images WHERE fleet_id = ?', [req.params.id]);
    
    // Delete the fleet item
    const [result] = await connection.query('DELETE FROM fleet WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    await connection.commit();
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ error: 'Failed to delete vehicle' });
  } finally {
    connection.release();
  }
});

// Upload images
router.post('/upload', upload.array('images', 10), async (req, res) => {
  try {
    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      path: `/uploads/fleet/${file.filename}`
    }));
    res.json(uploadedFiles);
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

module.exports = router; 