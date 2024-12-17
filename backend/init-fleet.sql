-- Initialize fleet table with sample data
INSERT INTO fleet (
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
    is_active
) VALUES
-- Helicopters
(
    'Bell 429',
    'helicopter',
    'Luxurious twin-engine helicopter perfect for city tours and short-distance travel',
    2500.00,
    20000.00,
    7,
    'Dubai Heliport',
    'https://example.com/images/bell-429.jpg',
    '["Leather interior", "Air conditioning", "Noise-canceling headsets", "Panoramic windows"]',
    '{"max_speed": "278 km/h", "range": "722 km", "engine": "Pratt & Whitney Canada PW207D1"}',
    true
),
(
    'Airbus H160',
    'helicopter',
    'State-of-the-art helicopter with advanced technology and superior comfort',
    3000.00,
    24000.00,
    8,
    'Dubai International Airport',
    'https://example.com/images/h160.jpg',
    '["VIP configuration", "Entertainment system", "WiFi", "Refreshment center"]',
    '{"max_speed": "325 km/h", "range": "850 km", "engine": "Safran Arrano"}',
    true
),

-- Yachts
(
    'Majesty 140',
    'yacht',
    'Luxurious superyacht with stunning interior and exceptional amenities',
    5000.00,
    40000.00,
    12,
    'Dubai Marina',
    'https://example.com/images/majesty-140.jpg',
    '["Swimming pool", "Beach club", "Cinema room", "Master suite", "Outdoor bar"]',
    '{"length": "43m", "beam": "8.3m", "engines": "2x MTU 2,600 HP"}',
    true
),
(
    'Gulf Craft 75',
    'yacht',
    'Elegant yacht perfect for day cruises and entertainment',
    3500.00,
    28000.00,
    8,
    'Palm Jumeirah Marina',
    'https://example.com/images/gulf-craft-75.jpg',
    '["Sun deck", "BBQ area", "Water toys", "Luxury cabins"]',
    '{"length": "23m", "beam": "5.8m", "engines": "2x CAT C18 1150 HP"}',
    true
),

-- Luxury Cars
(
    'Rolls-Royce Phantom',
    'luxury-car',
    'The epitome of luxury motoring with unmatched comfort and presence',
    500.00,
    4000.00,
    4,
    'Downtown Dubai',
    'https://example.com/images/phantom.jpg',
    '["Starlight headliner", "Champagne cooler", "Massage seats", "Entertainment screens"]',
    '{"engine": "6.75L V12", "power": "563 HP", "transmission": "8-speed automatic"}',
    true
),
(
    'Bentley Flying Spur',
    'luxury-car',
    'Combines luxury and performance in perfect harmony',
    400.00,
    3200.00,
    4,
    'Dubai Mall',
    'https://example.com/images/flying-spur.jpg',
    '["Mulliner interior", "Panoramic roof", "WiFi hotspot", "Premium audio"]',
    '{"engine": "6.0L W12", "power": "626 HP", "transmission": "8-speed dual-clutch"}',
    true
); 