import { ChevronRight, Plane, Ship } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Hero() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80"
          alt="Dubai Skyline"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-white mb-8">
            Experience Dubai's Luxury
            <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-300">
              From Sky & Sea
            </span>
          </h1>
          <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
            Discover Dubai's magnificent skyline and coastline through our premium helicopter tours and yacht charters.
          </p>
          
          <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/helicopter-tours"
              className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 transform transition hover:scale-105"
            >
              <Plane className="mr-2 h-5 w-5" />
              Helicopter Tours
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/yacht-charters"
              className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-full text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transform transition hover:scale-105"
            >
              <Ship className="mr-2 h-5 w-5" />
              Yacht Charters
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />
    </div>
  );
}