# Dubai Luxury Services

A modern web application for managing luxury tours, yacht charters, and helicopter services in Dubai.

## Features

- User Authentication & Authorization
- Tour Package Management
- Booking System
- Real-time Analytics Dashboard
- Media Library Management
- Payment Integration
- Admin Dashboard
- Responsive Design
- PWA Support

## Tech Stack

- Frontend:
  - React
  - TypeScript
  - Vite
  - TailwindCSS
  - React Router
  - Axios

- Backend:
  - Node.js
  - Express
  - MySQL
  - JWT Authentication

## Prerequisites

- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/dubai-luxury.git
   cd dubai-luxury
   ```

2. Install dependencies:
   ```bash
   # Install frontend dependencies
   npm install

   # Install backend dependencies
   cd backend
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Copy environment files
   cp .env.example .env
   cd backend
   cp .env.example .env
   ```
   Update the environment variables in both `.env` files with your values.

4. Set up the database:
   ```bash
   # Import the database schema
   mysql -u your_username -p your_database_name < backend/database.sql
   ```

5. Start the development servers:
   ```bash
   # Start backend server (from backend directory)
   npm run dev

   # Start frontend development server (from project root)
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## Project Structure

```
dubai-luxury/
├── src/                    # Frontend source files
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript types
│   └── assets/            # Static assets
├── backend/               # Backend source files
│   ├── routes/            # API routes
│   ├── controllers/       # Route controllers
│   ├── models/           # Database models
│   ├── middleware/       # Custom middleware
│   └── config/           # Configuration files
├── public/               # Public assets
└── dist/                 # Production build
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Your Name - your.email@example.com
Project Link: https://github.com/yourusername/dubai-luxury 