-- Create fleet_images table
CREATE TABLE IF NOT EXISTS fleet_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  fleet_id INT NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (fleet_id) REFERENCES fleet(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes
CREATE INDEX idx_fleet_images_fleet_id ON fleet_images(fleet_id);
CREATE INDEX idx_fleet_images_display_order ON fleet_images(display_order); 