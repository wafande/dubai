import { Calendar, Check } from 'lucide-react';
import type { Vehicle } from '../types';
import { Link } from 'react-router-dom';

interface VehicleCardProps {
  vehicle: Vehicle;
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <div className="group relative bg-white/10 backdrop-blur-md rounded-xl overflow-hidden transform transition-all hover:scale-105">
      <div className="relative h-48">
        <img
          src={vehicle.image}
          alt={vehicle.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-white mb-2">{vehicle.name}</h3>
        <p className="text-amber-400 text-sm mb-4">
          {vehicle.brand} {vehicle.model} {vehicle.year}
        </p>
        
        <div className="space-y-2 mb-4">
          {vehicle.features.slice(0, 3).map((feature, index) => (
            <div key={index} className="flex items-center text-gray-300">
              <Check className="h-4 w-4 mr-2 text-amber-500" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-gray-300 mb-6">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <span>AED {vehicle.pricePerDay}</span>
          </div>
          <span className="text-sm">per day</span>
        </div>
        
        <Link
          to={`/vehicles/${vehicle.id}`}
          className="block w-full text-center bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium py-2 px-4 rounded-lg transform transition"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
}