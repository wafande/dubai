CREATE TABLE IF NOT EXISTS payment_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  payment_gateway VARCHAR(50) NOT NULL DEFAULT 'stripe',
  stripe_public_key VARCHAR(255),
  stripe_secret_key VARCHAR(255),
  stripe_webhook_secret VARCHAR(255),
  currency VARCHAR(3) NOT NULL DEFAULT 'AED',
  tax_rate DECIMAL(5,2) DEFAULT 5.00,
  deposit_percentage INT DEFAULT 20,
  cancellation_fee INT DEFAULT 10,
  payment_terms TEXT,
  refund_policy TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
); 