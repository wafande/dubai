import { Clock } from 'lucide-react';
import { type TourPackage } from '../types';

interface TourCardProps {
  tour: TourPackage;
}

export function TourCard({ tour }: TourCardProps) {
  return (
    <div className="group relative bg-white/10 backdrop-blur-md rounded-xl overflow-hidden transform transition-all hover:scale-105">
      <div className="relative h-48">
        <img
          src={tour.image}
          alt={tour.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-white mb-2">{tour.name}</h3>
        <div className="flex items-center text-gray-300 mb-4">
          <Clock className="h-4 w-4 mr-2" />
          <span>{tour.duration}</span>
        </div>
        <p className="text-gray-400 mb-4">{tour.description}</p>
        
        <div className="space-y-2">
          {tour.sharingPrice && (
            <div className="flex justify-between text-gray-300">
              <span>Sharing:</span>
              <span>AED {tour.sharingPrice}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-300">
            <span>Private:</span>
            <span>AED {tour.privatePrice}</span>
          </div>
        </div>
        
        <button className="mt-6 w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium py-2 px-4 rounded-lg transform transition">
          Book Now
        </button>
      </div>
    </div>
  );
}