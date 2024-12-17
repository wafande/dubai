const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
require('dotenv').config();
const toursRouter = require('./routes/tours');
const reviewsRouter = require('./routes/reviews');
const paymentsRouter = require('./routes/payments');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Mount API routes
app.use('/api/tours', toursRouter);
app.use('/api', reviewsRouter);
app.use('/api', paymentsRouter);

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

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Email sending function
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html
    });
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

// Validation middleware
const validateUser = (req, res, next) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  next();
};

const validateSignup = (req, res, next) => {
  const { username, email, password, phone } = req.body;
  
  // Basic validation
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  // Username validation
  if (username.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters long' });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Password validation
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  // Phone validation (optional)
  if (phone && !/^\+?[\d\s-]{8,}$/.test(phone)) {
    return res.status(400).json({ error: 'Invalid phone number format' });
  }

  next();
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Admin middleware
const isAdmin = async (req, res, next) => {
  try {
    const [users] = await pool.query('SELECT role FROM users WHERE id = ?', [req.user.id]);
    if (users[0]?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Admin privileges required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify admin status' });
  }
};

// Basic Routes
app.get('/api', (req, res) => {
  res.json({ 
    status: 'API is running',
    message: 'Welcome to Dubai Luxury Services API',
    version: '1.0.0',
    endpoints: {
      auth: {
        login: '/api/auth/login',
        signup: '/api/auth/signup',
        forgotPassword: '/api/auth/forgot-password',
        resetPassword: '/api/auth/reset-password'
      },
      admin: {
        users: '/api/admin/users',
        bookings: '/api/admin/bookings',
        services: '/api/admin/services',
        analytics: '/api/admin/analytics'
      }
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email,
        role: user.role,
        username: user.username
      } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Signup Route
app.post('/api/auth/signup', validateSignup, async (req, res) => {
  const { username, email, password, phone, address } = req.body;
  
  try {
    // Check if email already exists
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with pending status
    const [result] = await pool.query(
      `INSERT INTO users (
        username, email, password, phone, address, 
        role, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [username, email, hashedPassword, phone || null, address || null, 'user', 'inactive']
    );

    // Send welcome email
    await sendEmail(
      email,
      'Welcome to Dubai Luxury Services',
      `
        <h1>Welcome to Dubai Luxury Services</h1>
        <p>Dear ${username},</p>
        <p>Thank you for signing up! Your account is currently under review.</p>
        <p>We will notify you once your account has been approved.</p>
        <p>Best regards,<br>Dubai Luxury Services Team</p>
      `
    );

    // Notify admin about new signup
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    if (adminEmails.length > 0) {
      await sendEmail(
        adminEmails,
        'New User Registration',
        `
          <h1>New User Registration</h1>
          <p>A new user has signed up and requires approval:</p>
          <ul>
            <li>Username: ${username}</li>
            <li>Email: ${email}</li>
            <li>Phone: ${phone || 'Not provided'}</li>
          </ul>
          <p>Please review and approve the account in the admin dashboard.</p>
        `
      );
    }

    // Log the signup attempt
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [result.insertId, 'user_signup', 'user', result.insertId, JSON.stringify({ email, username })]
    );

    res.status(201).json({
      message: 'Signup successful. Please wait for admin approval.',
      user: {
        id: result.insertId,
        username,
        email,
        status: 'inactive'
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Admin approval endpoint with email notification
app.put('/api/admin/users/:id/approve', authenticateToken, isAdmin, async (req, res) => {
  const userId = req.params.id;
  const { status } = req.body;

  try {
    // Get user details
    const [users] = await pool.query('SELECT email, username FROM users WHERE id = ?', [userId]);
    const user = users[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user status
    await pool.query(
      'UPDATE users SET status = ? WHERE id = ?',
      [status, userId]
    );

    // Send email notification based on status
    if (status === 'active') {
      await sendEmail(
        user.email,
        'Account Approved - Dubai Luxury Services',
        `
          <h1>Account Approved</h1>
          <p>Dear ${user.username},</p>
          <p>Your account has been approved! You can now log in to access our services.</p>
          <p>Visit our website to get started.</p>
          <p>Best regards,<br>Dubai Luxury Services Team</p>
        `
      );
    } else if (status === 'blocked') {
      await sendEmail(
        user.email,
        'Account Status Update - Dubai Luxury Services',
        `
          <h1>Account Status Update</h1>
          <p>Dear ${user.username},</p>
          <p>Your account has been blocked. Please contact our support team for more information.</p>
          <p>Best regards,<br>Dubai Luxury Services Team</p>
        `
      );
    }

    // Log the approval action
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'user_approval', 'user', userId, JSON.stringify({ status })]
    );

    res.json({ message: 'User status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Protected Admin Routes
// Users
app.get('/api/admin/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, username, email, role, status, created_at FROM users');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/admin/users', authenticateToken, isAdmin, validateUser, async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role || 'user']
    );
    res.status(201).json({ id: result.insertId, username, email, role });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create user' });
    }
  }
});

// Products
app.get('/api/admin/products', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/admin/products', authenticateToken, isAdmin, async (req, res) => {
  const { name, description, price, stock } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)',
      [name, description, price, stock]
    );
    res.status(201).json({ id: result.insertId, name, description, price, stock });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Orders
app.get('/api/admin/orders', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT o.*, u.username, u.email 
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.put('/api/admin/orders/:id', authenticateToken, isAdmin, async (req, res) => {
  const { status } = req.body;
  try {
    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Order updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Analytics
app.get('/api/admin/analytics', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [totalUsers] = await pool.query('SELECT COUNT(*) as count FROM users');
    const [totalOrders] = await pool.query('SELECT COUNT(*) as count FROM orders');
    const [totalRevenue] = await pool.query('SELECT SUM(total_amount) as total FROM orders WHERE status = "completed"');
    
    res.json({
      users: totalUsers[0].count,
      orders: totalOrders[0].count,
      revenue: totalRevenue[0].total || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Categories
app.get('/api/admin/categories', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.post('/api/admin/categories', authenticateToken, isAdmin, async (req, res) => {
  const { name, slug, description, parent_id } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO categories (name, slug, description, parent_id) VALUES (?, ?, ?, ?)',
      [name, slug, description, parent_id]
    );
    res.status(201).json({ id: result.insertId, name, slug, description, parent_id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Services
app.get('/api/admin/services', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [services] = await pool.query('SELECT * FROM services ORDER BY created_at DESC');
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

app.post('/api/admin/services', authenticateToken, isAdmin, async (req, res) => {
  const { 
    category_id, name, slug, description, short_description,
    price, duration, max_capacity, image_url 
  } = req.body;
  
  try {
    const [result] = await pool.query(
      `INSERT INTO services (
        category_id, name, slug, description, short_description,
        price, duration, max_capacity, image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [category_id, name, slug, description, short_description,
       price, duration, max_capacity, image_url]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// Bookings
app.get('/api/admin/bookings', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [bookings] = await pool.query(`
      SELECT 
        fb.*,
        f.name as vehicle_name,
        f.type as vehicle_type,
        u.username as customer_name,
        u.email as customer_email
      FROM fleet_bookings fb
      JOIN fleet f ON fb.fleet_id = f.id
      JOIN users u ON fb.user_id = u.id
      ORDER BY fb.created_at DESC
    `);

    // Calculate statistics
    const [stats] = await pool.query(`
      SELECT
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
        SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END) as total_revenue
      FROM fleet_bookings
    `);

    res.json({
      bookings,
      stats: stats[0]
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

app.put('/api/admin/bookings/:id/status', authenticateToken, isAdmin, async (req, res) => {
  const { status } = req.body;
  const bookingId = req.params.id;

  try {
    // Update booking status
    await pool.query(
      'UPDATE fleet_bookings SET status = ? WHERE id = ?',
      [status, bookingId]
    );

    // If status is cancelled, make the vehicle available again
    if (status === 'cancelled') {
      const [booking] = await pool.query(
        'SELECT fleet_id, booking_date FROM fleet_bookings WHERE id = ?',
        [bookingId]
      );

      if (booking.length > 0) {
        await pool.query(
          `UPDATE fleet_availability 
           SET is_available = true 
           WHERE fleet_id = ? AND date = ?`,
          [booking[0].fleet_id, booking[0].booking_date]
        );
      }
    }

    // Log the action
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'update_booking_status', 'booking', bookingId, JSON.stringify({ status })]
    );

    res.json({ message: 'Booking status updated successfully' });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// Enhanced analytics dashboard endpoint
app.get('/api/admin/analytics/dashboard', authenticateToken, isAdmin, async (req, res) => {
  try {
    const range = req.query.range || '30d';
    let dateFilter;
    
    // Calculate date range
    switch(range) {
      case '7d':
        dateFilter = 'INTERVAL 7 DAY';
        break;
      case '90d':
        dateFilter = 'INTERVAL 90 DAY';
        break;
      case '1y':
        dateFilter = 'INTERVAL 1 YEAR';
        break;
      default: // 30d
        dateFilter = 'INTERVAL 30 DAY';
    }

    // Get summary statistics with proper null handling
    const [summary] = await pool.query(`
      SELECT
        COALESCE(COUNT(*), 0) as totalBookings,
        COALESCE(COUNT(CASE WHEN status = 'completed' THEN 1 END), 0) as completedBookings,
        COALESCE(COUNT(CASE WHEN status = 'pending' THEN 1 END), 0) as pendingBookings,
        COALESCE(COUNT(CASE WHEN status = 'cancelled' THEN 1 END), 0) as cancelledBookings,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END), 0) as totalRevenue
      FROM fleet_bookings
      WHERE created_at >= DATE_SUB(CURDATE(), ${dateFilter})
    `);

    // Get total users with proper null handling
    const [userStats] = await pool.query(`
      SELECT COALESCE(COUNT(DISTINCT user_id), 0) as totalUsers
      FROM fleet_bookings
      WHERE created_at >= DATE_SUB(CURDATE(), ${dateFilter})
    `);

    // Get top services/vehicle types with proper null handling
    const [topServices] = await pool.query(`
      SELECT 
        COALESCE(f.type, 'unknown') as name,
        COUNT(*) as bookingCount,
        COALESCE(SUM(fb.total_amount), 0) as revenue
      FROM fleet_bookings fb
      JOIN fleet f ON fb.fleet_id = f.id
      WHERE fb.created_at >= DATE_SUB(CURDATE(), ${dateFilter})
      GROUP BY f.type
      ORDER BY revenue DESC
    `);

    // Get monthly revenue with proper null handling
    const [monthlyRevenue] = await pool.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END), 0) as revenue,
        COUNT(*) as bookings
      FROM fleet_bookings
      WHERE created_at >= DATE_SUB(CURDATE(), ${dateFilter})
      GROUP BY month
      ORDER BY month ASC
    `);

    // Get top customers with proper null handling
    const [topCustomers] = await pool.query(`
      SELECT 
        COALESCE(u.username, 'Unknown') as name,
        COALESCE(u.email, 'unknown@email.com') as email,
        COUNT(*) as bookings,
        COALESCE(SUM(fb.total_amount), 0) as totalSpent
      FROM fleet_bookings fb
      JOIN users u ON fb.user_id = u.id
      WHERE fb.created_at >= DATE_SUB(CURDATE(), ${dateFilter})
      GROUP BY fb.user_id, u.username, u.email
      ORDER BY totalSpent DESC
      LIMIT 5
    `);

    res.json({
      summary: {
        ...summary[0],
        totalUsers: userStats[0].totalUsers
      },
      topServices: topServices || [],
      monthlyRevenue: monthlyRevenue || [],
      topCustomers: topCustomers || []
    });

  } catch (error) {
    console.error('Error fetching analytics dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Export analytics data endpoint
app.get('/api/admin/analytics/export', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { start_date, end_date, type } = req.query;
    let query = '';
    const dateFilter = 'created_at BETWEEN ? AND ?';
    const dateParams = [start_date, end_date];

    switch (type) {
      case 'bookings':
        query = `
          SELECT 
            fb.id as booking_id,
            fb.created_at,
            fb.status,
            fb.total_amount,
            f.type as vehicle_type,
            f.name as vehicle_name,
            u.username as customer_name,
            u.email as customer_email
          FROM fleet_bookings fb
          JOIN fleet f ON fb.fleet_id = f.id
          JOIN users u ON fb.user_id = u.id
          WHERE ${dateFilter}
          ORDER BY fb.created_at DESC
        `;
        break;

      case 'revenue':
        query = `
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as total_bookings,
            SUM(total_amount) as revenue,
            COUNT(DISTINCT user_id) as unique_customers
          FROM fleet_bookings
          WHERE ${dateFilter}
          GROUP BY DATE(created_at)
          ORDER BY date
        `;
        break;

      case 'vehicles':
        query = `
          SELECT 
            f.type,
            f.name,
            COUNT(*) as total_bookings,
            SUM(fb.total_amount) as revenue,
            AVG(fb.total_amount) as avg_booking_value
          FROM fleet_bookings fb
          JOIN fleet f ON fb.fleet_id = f.id
          WHERE ${dateFilter}
          GROUP BY f.type, f.name
          ORDER BY revenue DESC
        `;
        break;

      default:
        return res.status(400).json({ error: 'Invalid export type' });
    }

    const [data] = await pool.query(query, dateParams);
    res.json(data);

  } catch (error) {
    console.error('Error exporting analytics data:', error);
    res.status(500).json({ error: 'Failed to export analytics data' });
  }
});

// Reviews
app.get('/api/admin/reviews', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.*, 
        u.username as user_name,
        s.name as service_name
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN services s ON r.service_id = s.id
      ORDER BY r.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

app.put('/api/admin/reviews/:id', authenticateToken, isAdmin, async (req, res) => {
  const { status } = req.body;
  try {
    await pool.query('UPDATE reviews SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Review updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// Promotions
app.get('/api/admin/promotions', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM promotions ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch promotions' });
  }
});

app.post('/api/admin/promotions', authenticateToken, isAdmin, async (req, res) => {
  const {
    code, name, description, discount_type, discount_value,
    start_date, end_date, min_purchase_amount, max_discount_amount, usage_limit
  } = req.body;
  
  try {
    const [result] = await pool.query(
      `INSERT INTO promotions (
        code, name, description, discount_type, discount_value,
        start_date, end_date, min_purchase_amount, max_discount_amount, usage_limit
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [code, name, description, discount_type, discount_value,
       start_date, end_date, min_purchase_amount, max_discount_amount, usage_limit]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create promotion' });
  }
});

// Settings
app.get('/api/admin/settings', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM settings ORDER BY category, setting_key');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.put('/api/admin/settings/:key', authenticateToken, isAdmin, async (req, res) => {
  const { value } = req.body;
  try {
    await pool.query(
      'UPDATE settings SET setting_value = ? WHERE setting_key = ?',
      [value, req.params.key]
    );
    res.json({ message: 'Setting updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

// Activity Logs
app.get('/api/admin/activity-logs', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT al.*, u.username
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 100
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

// Password reset request
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const [users] = await pool.query('SELECT id, username FROM users WHERE email = ?', [email]);
    const user = users[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user.id, type: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Store reset token in database
    await pool.query(
      'UPDATE users SET reset_token = ?, reset_token_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id = ?',
      [resetToken, user.id]
    );

    // Send reset email
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail(
      email,
      'Password Reset Request - Dubai Luxury Services',
      `
        <h1>Password Reset Request</h1>
        <p>Dear ${user.username},</p>
        <p>You have requested to reset your password. Click the link below to proceed:</p>
        <p><a href="${resetLink}">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>Dubai Luxury Services Team</p>
      `
    );

    res.json({ message: 'Password reset instructions sent to your email' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

// Reset password with token
app.post('/api/auth/reset-password', async (req, res) => {
  const { token, password } = req.body;

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'password_reset') {
      return res.status(400).json({ error: 'Invalid reset token' });
    }

    // Check if token is still valid in database
    const [users] = await pool.query(
      'SELECT id FROM users WHERE id = ? AND reset_token = ? AND reset_token_expires > NOW()',
      [decoded.id, token]
    );

    if (users.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token
    await pool.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [hashedPassword, decoded.id]
    );

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Fleet Management Routes
app.get('/api/admin/fleet', authenticateToken, async (req, res) => {
  try {
    const [fleet] = await pool.query(`
      SELECT 
        id,
        name,
        type,
        description,
        price_per_hour,
        price_per_day,
        image_url,
        features,
        specifications,
        is_active as status,
        created_at,
        updated_at
      FROM fleet
      WHERE is_active = true
      ORDER BY created_at DESC
    `);

    // Parse JSON fields
    const formattedFleet = fleet.map(item => ({
      ...item,
      features: typeof item.features === 'string' && item.features ? 
        JSON.parse(item.features) : 
        (item.features || {}),
      specifications: typeof item.specifications === 'string' && item.specifications ? 
        JSON.parse(item.specifications) : 
        (item.specifications || {})
    }));

    res.json(formattedFleet);
  } catch (error) {
    console.error('Error fetching fleet:', error);
    res.status(500).json({ error: 'Failed to fetch fleet' });
  }
});

app.post('/api/admin/fleet', authenticateToken, isAdmin, async (req, res) => {
  const {
    name,
    type,
    description,
    price_per_hour = type === 'helicopter' ? 15000 : type === 'yacht' ? 25000 : 5000,
    price_per_day = type === 'helicopter' ? 150000 : type === 'yacht' ? 250000 : 50000,
    capacity = type === 'helicopter' ? 6 : type === 'yacht' ? 12 : 4,
    location,
    images = [],
    features = [],
    specifications = {},
    is_active = true,
    maintenance_schedule = {}
  } = req.body;

  // Default image URL based on vehicle type
  const defaultImageUrl = type === 'helicopter' 
    ? 'https://images.unsplash.com/photo-1534321238895-da3ab632df3e'
    : type === 'yacht'
    ? 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a'
    : 'https://images.unsplash.com/photo-1503376780353-7e6692767b70';

  // Default locations based on vehicle type
  const defaultLocation = type === 'helicopter' 
    ? 'Dubai Helipad'
    : type === 'yacht'
    ? 'Dubai Marina'
    : 'Dubai Luxury Cars Hub';

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Insert fleet item
    const [result] = await connection.query(
      `INSERT INTO fleet (
        name, type, description, price_per_hour, price_per_day,
        capacity, location, image_url, features, specifications,
        is_active, maintenance_schedule
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        type,
        description,
        price_per_hour,
        price_per_day,
        capacity,
        location || defaultLocation,
        images[0] || defaultImageUrl,
        JSON.stringify(features),
        JSON.stringify(specifications),
        is_active,
        JSON.stringify(maintenance_schedule)
      ]
    );

    const fleetId = result.insertId;

    // Insert images if provided
    if (Array.isArray(images) && images.length > 0) {
      const imageValues = images.map((url, index) => [fleetId, url, index === 0, index]);
      await connection.query(
        `INSERT INTO fleet_images (fleet_id, image_url, is_primary, display_order) VALUES ?`,
        [imageValues]
      );
    } else {
      // Insert default image if no images provided
      await connection.query(
        `INSERT INTO fleet_images (fleet_id, image_url, is_primary, display_order) VALUES (?, ?, true, 0)`,
        [fleetId, defaultImageUrl]
      );
    }

    // Log the action
    await connection.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'create_fleet_item', 'fleet', fleetId, JSON.stringify(req.body)]
    );

    await connection.commit();

    res.status(201).json({
      id: fleetId,
      name,
      type,
      description,
      price_per_hour,
      price_per_day,
      capacity,
      location: location || defaultLocation,
      images: images.length > 0 ? images : [defaultImageUrl],
      features,
      specifications,
      is_active,
      maintenance_schedule
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating fleet item:', error);
    res.status(500).json({ error: 'Failed to create fleet item' });
  } finally {
    connection.release();
  }
});

app.put('/api/admin/fleet/:id', authenticateToken, isAdmin, async (req, res) => {
  const fleetId = req.params.id;
  const {
    name,
    type,
    description,
    price_per_hour,
    price_per_day,
    capacity,
    location,
    images,
    features,
    specifications,
    is_active,
    maintenance_schedule
  } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Update fleet item
    await connection.query(
      `UPDATE fleet SET
        name = ?, type = ?, description = ?, price_per_hour = ?,
        price_per_day = ?, capacity = ?, location = ?, image_url = ?,
        features = ?, specifications = ?, is_active = ?, maintenance_schedule = ?
      WHERE id = ?`,
      [
        name, type, description, price_per_hour,
        price_per_day, capacity, location, images[0],
        JSON.stringify(features),
        JSON.stringify(specifications),
        is_active,
        JSON.stringify(maintenance_schedule),
        fleetId
      ]
    );

    // Update images
    if (Array.isArray(images)) {
      // Delete existing images
      await connection.query('DELETE FROM fleet_images WHERE fleet_id = ?', [fleetId]);
      
      // Insert new images
      if (images.length > 0) {
        const imageValues = images.map((url, index) => [fleetId, url, index === 0, index]);
        await connection.query(
          `INSERT INTO fleet_images (fleet_id, image_url, is_primary, display_order) VALUES ?`,
          [imageValues]
        );
      }
    }

    await connection.commit();
    res.json({ message: 'Fleet item updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating fleet item:', error);
    res.status(500).json({ error: 'Failed to update fleet item' });
  } finally {
    connection.release();
  }
});

app.delete('/api/admin/fleet/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    // Check if the vehicle has any bookings
    const [bookings] = await pool.query(
      'SELECT id FROM fleet_bookings WHERE fleet_id = ? AND status IN ("pending", "confirmed")',
      [req.params.id]
    );
    
    if (bookings.length > 0) {
      return res.status(400).json({ error: 'Cannot delete: This vehicle has active bookings' });
    }

    await pool.query('DELETE FROM fleet WHERE id = ?', [req.params.id]);

    // Log the action
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'delete_fleet_item', 'fleet', req.params.id, JSON.stringify({ id: req.params.id })]
    );

    res.json({ message: 'Fleet item deleted successfully' });
  } catch (error) {
    console.error('Error deleting fleet item:', error);
    res.status(500).json({ error: 'Failed to delete fleet item' });
  }
});

// Fleet Bookings
app.post('/api/admin/fleet/:id/book', authenticateToken, async (req, res) => {
  const { booking_date, start_time, duration, total_amount } = req.body;
  const fleet_id = req.params.id;
  const user_id = req.user.id;

  try {
    // Check if the vehicle is available
    const [availability] = await pool.query(
      'SELECT is_available FROM fleet_availability WHERE fleet_id = ? AND date = ?',
      [fleet_id, booking_date]
    );

    if (availability.length > 0 && !availability[0].is_available) {
      return res.status(400).json({ error: 'Vehicle is not available on this date' });
    }

    // Create booking
    const [result] = await pool.query(
      `INSERT INTO fleet_bookings (
        fleet_id, user_id, booking_date, start_time,
        duration, total_amount, status
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [fleet_id, user_id, booking_date, start_time, duration, total_amount]
    );

    // Update availability
    await pool.query(
      `INSERT INTO fleet_availability (fleet_id, date, is_available)
       VALUES (?, ?, false)
       ON DUPLICATE KEY UPDATE is_available = false`,
      [fleet_id, booking_date]
    );

    res.status(201).json({
      id: result.insertId,
      status: 'pending',
      message: 'Booking created successfully'
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Routes
app.use('/api/tours', toursRouter);
app.use('/api', reviewsRouter); // Reviews are nested under tours
app.use('/api', paymentsRouter); // Payments are nested under bookings

// Payment Settings
app.get('/api/admin/payment-settings', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [settings] = await pool.query(`
      SELECT 
        payment_gateway,
        stripe_public_key,
        stripe_secret_key,
        stripe_webhook_secret,
        currency,
        tax_rate,
        deposit_percentage,
        cancellation_fee,
        payment_terms,
        refund_policy,
        created_at,
        updated_at
      FROM payment_settings
      LIMIT 1
    `);

    // If no settings exist, return default values
    if (!settings || settings.length === 0) {
      return res.json({
        payment_gateway: 'stripe',
        currency: 'AED',
        tax_rate: 5,
        deposit_percentage: 20,
        cancellation_fee: 10,
        payment_terms: 'Payment is required at the time of booking',
        refund_policy: 'Refunds are processed within 7-14 business days'
      });
    }

    res.json(settings[0]);
  } catch (error) {
    console.error('Error fetching payment settings:', error);
    res.status(500).json({ error: 'Failed to fetch payment settings' });
  }
});

app.post('/api/admin/payment-settings', authenticateToken, isAdmin, async (req, res) => {
  try {
    const {
      payment_gateway,
      stripe_public_key,
      stripe_secret_key,
      stripe_webhook_secret,
      currency,
      tax_rate,
      deposit_percentage,
      cancellation_fee,
      payment_terms,
      refund_policy
    } = req.body;

    // Validate required fields
    if (!payment_gateway || !currency) {
      return res.status(400).json({ error: 'Payment gateway and currency are required' });
    }

    // Check if settings already exist
    const [existingSettings] = await pool.query('SELECT id FROM payment_settings LIMIT 1');

    if (existingSettings && existingSettings.length > 0) {
      // Update existing settings
      await pool.query(`
        UPDATE payment_settings SET
          payment_gateway = ?,
          stripe_public_key = ?,
          stripe_secret_key = ?,
          stripe_webhook_secret = ?,
          currency = ?,
          tax_rate = ?,
          deposit_percentage = ?,
          cancellation_fee = ?,
          payment_terms = ?,
          refund_policy = ?,
          updated_at = NOW()
        WHERE id = ?
      `, [
        payment_gateway,
        stripe_public_key,
        stripe_secret_key,
        stripe_webhook_secret,
        currency,
        tax_rate,
        deposit_percentage,
        cancellation_fee,
        payment_terms,
        refund_policy,
        existingSettings[0].id
      ]);
    } else {
      // Insert new settings
      await pool.query(`
        INSERT INTO payment_settings (
          payment_gateway,
          stripe_public_key,
          stripe_secret_key,
          stripe_webhook_secret,
          currency,
          tax_rate,
          deposit_percentage,
          cancellation_fee,
          payment_terms,
          refund_policy,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        payment_gateway,
        stripe_public_key,
        stripe_secret_key,
        stripe_webhook_secret,
        currency,
        tax_rate,
        deposit_percentage,
        cancellation_fee,
        payment_terms,
        refund_policy
      ]);
    }

    // Log the action
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, details) VALUES (?, ?, ?, ?)',
      [req.user.id, 'update_payment_settings', 'payment_settings', JSON.stringify({ payment_gateway, currency })]
    );

    res.json({ message: 'Payment settings updated successfully' });
  } catch (error) {
    console.error('Error updating payment settings:', error);
    res.status(500).json({ error: 'Failed to update payment settings' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 