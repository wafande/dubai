-- Users and Authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    status ENUM('active', 'inactive', 'blocked') DEFAULT 'inactive',
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories for better organization
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    parent_id INT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Services (main offerings)
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('helicopter', 'yacht', 'car') NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    sharing_price DECIMAL(10, 2),
    duration VARCHAR(50),
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Service Features
CREATE TABLE IF NOT EXISTS service_features (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_id INT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- Bookings/Orders
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    service_id INT NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    guests INT DEFAULT 1,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    rating INT,
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (service_id) REFERENCES services(id)
);

-- Reviews and Ratings
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT,
    user_id INT,
    service_id INT,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (service_id) REFERENCES services(id)
);

-- Service Availability
CREATE TABLE IF NOT EXISTS service_availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_id INT,
    day_of_week TINYINT CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME,
    end_time TIME,
    max_bookings INT DEFAULT 1,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- Special Dates (holidays, special events)
CREATE TABLE IF NOT EXISTS special_dates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_id INT,
    date DATE,
    is_holiday BOOLEAN DEFAULT false,
    is_special_event BOOLEAN DEFAULT false,
    event_name VARCHAR(255),
    price_modifier DECIMAL(5, 2) DEFAULT 1.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- Promotions and Discounts
CREATE TABLE IF NOT EXISTS promotions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE,
    name VARCHAR(255),
    description TEXT,
    discount_type ENUM('percentage', 'fixed') NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    start_date DATETIME,
    end_date DATETIME,
    min_purchase_amount DECIMAL(10, 2),
    max_discount_amount DECIMAL(10, 2),
    usage_limit INT,
    used_count INT DEFAULT 0,
    status ENUM('active', 'inactive', 'expired') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Activity Log for Admin Actions
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    details JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Settings Table for Admin Configuration
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50),
    category VARCHAR(100),
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Fleet Management Tables
CREATE TABLE IF NOT EXISTS fleet (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('helicopter', 'yacht', 'luxury-car') NOT NULL,
    description TEXT,
    price_per_hour DECIMAL(10, 2) NOT NULL,
    price_per_day DECIMAL(10, 2),
    capacity INT NOT NULL,
    location VARCHAR(255),
    image_url TEXT,
    features JSON,
    specifications JSON,
    is_active BOOLEAN DEFAULT true,
    maintenance_schedule JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fleet_bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fleet_id INT NOT NULL,
    user_id INT NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    duration INT NOT NULL, -- in hours
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (fleet_id) REFERENCES fleet(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS fleet_availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fleet_id INT NOT NULL,
    date DATE NOT NULL,
    is_available BOOLEAN DEFAULT true,
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (fleet_id) REFERENCES fleet(id)
);

CREATE TABLE IF NOT EXISTS fleet_maintenance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fleet_id INT NOT NULL,
    maintenance_date DATE NOT NULL,
    description TEXT,
    cost DECIMAL(10, 2),
    status ENUM('scheduled', 'in_progress', 'completed') DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (fleet_id) REFERENCES fleet(id)
);

-- Indexes for better performance
CREATE INDEX idx_fleet_type ON fleet(type);
CREATE INDEX idx_fleet_bookings_date ON fleet_bookings(booking_date);
CREATE INDEX idx_fleet_availability_date ON fleet_availability(date);
CREATE INDEX idx_fleet_maintenance_date ON fleet_maintenance(maintenance_date);

-- Create payment_settings table
CREATE TABLE IF NOT EXISTS payment_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    currency VARCHAR(3) NOT NULL DEFAULT 'AED',
    currency_symbol VARCHAR(10) NOT NULL DEFAULT 'د.إ',
    deposit_percentage INT NOT NULL DEFAULT 20,
    tax_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    tax_percentage DECIMAL(5,2) NOT NULL DEFAULT 5.00,
    tax_number VARCHAR(50),
    refund_policy_type ENUM('flexible', 'moderate', 'strict') NOT NULL DEFAULT 'flexible',
    refund_deadline_hours INT NOT NULL DEFAULT 24,
    refund_percentage INT NOT NULL DEFAULT 90,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create payment_gateways table
CREATE TABLE IF NOT EXISTS payment_gateways (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    api_key VARCHAR(255),
    secret_key VARCHAR(255),
    webhook_secret VARCHAR(255),
    test_mode BOOLEAN NOT NULL DEFAULT TRUE,
    features JSON NOT NULL,
    supported_currencies JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default payment settings
INSERT INTO payment_settings (id, currency, currency_symbol, deposit_percentage, tax_enabled, tax_percentage)
VALUES (1, 'AED', 'د.إ', 20, TRUE, 5.00)
ON DUPLICATE KEY UPDATE
    currency = VALUES(currency),
    currency_symbol = VALUES(currency_symbol),
    deposit_percentage = VALUES(deposit_percentage),
    tax_enabled = VALUES(tax_enabled),
    tax_percentage = VALUES(tax_percentage);

-- Insert default payment gateways
INSERT INTO payment_gateways (id, name, is_enabled, test_mode, features, supported_currencies)
VALUES 
    ('stripe', 'Stripe', FALSE, TRUE, 
     '{"refunds": true, "partialPayments": true, "recurringBilling": true, "disputes": true}',
     '["AED", "USD", "EUR", "GBP"]'),
    ('paypal', 'PayPal', FALSE, TRUE,
     '{"refunds": true, "partialPayments": true, "recurringBilling": true, "disputes": true}',
     '["AED", "USD", "EUR", "GBP"]'),
    ('square', 'Square', FALSE, TRUE,
     '{"refunds": true, "partialPayments": true, "recurringBilling": false, "disputes": true}',
     '["AED", "USD"]'),
    ('tap', 'Tap Payments', FALSE, TRUE,
     '{"refunds": true, "partialPayments": true, "recurringBilling": false, "disputes": false}',
     '["AED", "SAR", "KWD", "BHD", "QAR", "OMR"]')
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    features = VALUES(features),
    supported_currencies = VALUES(supported_currencies);

-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
    id VARCHAR(100) PRIMARY KEY,
    booking_id INT,
    gateway_id VARCHAR(50),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'failed', 'refunded') NOT NULL,
    payment_method VARCHAR(50),
    payment_details JSON,
    metadata JSON,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (gateway_id) REFERENCES payment_gateways(id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- Create payment_refunds table
CREATE TABLE IF NOT EXISTS payment_refunds (
    id VARCHAR(100) PRIMARY KEY,
    transaction_id VARCHAR(100),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'failed') NOT NULL,
    reason TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES payment_transactions(id)
);

-- Create payment_disputes table
CREATE TABLE IF NOT EXISTS payment_disputes (
    id VARCHAR(100) PRIMARY KEY,
    transaction_id VARCHAR(100),
    status ENUM('open', 'under_review', 'won', 'lost') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    reason TEXT,
    evidence JSON,
    due_by TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES payment_transactions(id)
); 