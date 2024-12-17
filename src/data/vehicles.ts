export const vehicles = [
  {
    id: 'rolls-royce-phantom',
    name: 'Rolls-Royce Phantom',
    brand: 'Rolls-Royce',
    model: 'Phantom',
    year: 2024,
    pricePerDay: 4500,
    image: 'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?auto=format&fit=crop&q=80',
    features: [
      'Chauffeur service',
      'Extended wheelbase',
      'Starlight headliner',
      'Rear theater configuration',
      'Champagne cooler'
    ],
    available: true
  },
  {
    id: 'bentley-flying-spur',
    name: 'Bentley Flying Spur',
    brand: 'Bentley',
    model: 'Flying Spur',
    year: 2024,
    pricePerDay: 3800,
    image: 'https://images.unsplash.com/photo-1632548260498-b7246fa466ea?auto=format&fit=crop&q=80',
    features: [
      'Professional driver',
      'Mulliner specification',
      'Rotating display',
      'Premium audio system',
      'Massage seats'
    ],
    available: true
  },
  {
    id: 'mercedes-maybach',
    name: 'Mercedes-Maybach S680',
    brand: 'Mercedes-Benz',
    model: 'Maybach S680',
    year: 2024,
    pricePerDay: 3200,
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80',
    features: [
      'Executive chauffeur',
      'First-class rear suite',
      'Active ambient lighting',
      'Burmester 4D sound',
      'MBUX entertainment'
    ],
    available: true
  }
] as const;