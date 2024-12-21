USE dubai;

-- Drop existing tables if they exist (in correct order to respect foreign keys)
DROP TABLE IF EXISTS fleet_maintenance;
DROP TABLE IF EXISTS fleet_availability;
DROP TABLE IF EXISTS fleet_bookings;
DROP TABLE IF EXISTS fleet_images;
DROP TABLE IF EXISTS fleet;

-- Create fleet table
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

-- Create fleet_images table
CREATE TABLE IF NOT EXISTS fleet_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fleet_id INT NOT NULL,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fleet_id) REFERENCES fleet(id) ON DELETE CASCADE
);

-- Create fleet_bookings table
CREATE TABLE IF NOT EXISTS fleet_bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fleet_id INT NOT NULL,
    user_id INT NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    duration INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (fleet_id) REFERENCES fleet(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create fleet_availability table
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

-- Create fleet_maintenance table
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

-- Create indexes for better performance
CREATE INDEX idx_fleet_type ON fleet(type);
CREATE INDEX idx_fleet_bookings_date ON fleet_bookings(booking_date);
CREATE INDEX idx_fleet_availability_date ON fleet_availability(date);
CREATE INDEX idx_fleet_maintenance_date ON fleet_maintenance(maintenance_date);
CREATE INDEX idx_fleet_images_order ON fleet_images(fleet_id, display_order);

-- Initialize fleet table with sample data
INSERT INTO fleet (name, type, description, price_per_hour, price_per_day, capacity, location, image_url, features, specifications, is_active) 
VALUES 
('Bell 429', 'helicopter', 'Luxurious twin-engine helicopter perfect for city tours and short-distance travel', 2500.00, 20000.00, 7, 'Dubai Heliport', 'https://example.com/images/bell-429.jpg', '["Leather interior", "Air conditioning", "Noise-canceling headsets", "Panoramic windows"]', '{"max_speed": "278 km/h", "range": "722 km", "engine": "Pratt & Whitney Canada PW207D1"}', true),
('Airbus H160', 'helicopter', 'State-of-the-art helicopter with advanced technology and superior comfort', 3000.00, 24000.00, 8, 'Dubai International Airport', 'https://example.com/images/h160.jpg', '["VIP configuration", "Entertainment system", "WiFi", "Refreshment center"]', '{"max_speed": "325 km/h", "range": "850 km", "engine": "Safran Arrano"}', true),
('Majesty 140', 'yacht', 'Luxurious superyacht with stunning interior and exceptional amenities', 5000.00, 40000.00, 12, 'Dubai Marina', 'https://example.com/images/majesty-140.jpg', '["Swimming pool", "Beach club", "Cinema room", "Master suite", "Outdoor bar"]', '{"length": "43m", "beam": "8.3m", "engines": "2x MTU 2,600 HP"}', true),
('Gulf Craft 75', 'yacht', 'Elegant yacht perfect for day cruises and entertainment', 3500.00, 28000.00, 8, 'Palm Jumeirah Marina', 'https://example.com/images/gulf-craft-75.jpg', '["Sun deck", "BBQ area", "Water toys", "Luxury cabins"]', '{"length": "23m", "beam": "5.8m", "engines": "2x CAT C18 1150 HP"}', true),
('Rolls-Royce Phantom', 'luxury-car', 'The epitome of luxury motoring with unmatched comfort and presence', 500.00, 4000.00, 4, 'Downtown Dubai', 'https://example.com/images/phantom.jpg', '["Starlight headliner", "Champagne cooler", "Massage seats", "Entertainment screens"]', '{"engine": "6.75L V12", "power": "563 HP", "transmission": "8-speed automatic"}', true),
('Bentley Flying Spur', 'luxury-car', 'Combines luxury and performance in perfect harmony', 400.00, 3200.00, 4, 'Dubai Mall', 'https://example.com/images/flying-spur.jpg', '["Professional driver", "Mulliner specification", "Rotating display", "Premium audio system", "Massage seats"]', '{"engine": "6.0L W12", "power": "626 HP", "transmission": "8-speed dual-clutch"}', true),
('Mercedes-Maybach S680', 'luxury-car', 'Ultimate luxury sedan with exceptional comfort', 450.00, 3600.00, 4, 'Business Bay', 'https://example.com/images/maybach.jpg', '["Professional chauffeur", "Executive rear seats", "Burmester audio", "Refrigerator compartment"]', '{"engine": "6.0L V12", "power": "621 HP", "transmission": "9-speed automatic"}', true); 