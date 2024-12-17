import React from 'react';
import {
  Clock,
  DollarSign,
  Users,
  Star,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Tour } from '../../services/tourService';

interface TourListItemProps {
  tour: Tour;
  onEdit: (tour: Tour) => void;
  onDelete: (tour: Tour) => void;
  dragHandleProps?: any;
}

const TourListItem: React.FC<TourListItemProps> = ({
  tour,
  onEdit,
  onDelete,
  dragHandleProps,
}) => {
  return (
    <div
      className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
      {...dragHandleProps}
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div
              className="h-16 w-16 bg-cover bg-center rounded-lg"
              style={{ backgroundImage: `url(${tour.image})` }}
            />
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {tour.name}
              </h3>
              <p className="text-sm text-gray-500">{tour.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onEdit(tour)}
              className="p-2 text-gray-400 hover:text-teal-600"
              aria-label="Edit tour"
            >
              <Edit2 className="h-5 w-5" />
            </button>
            <button
              onClick={() => onDelete(tour)}
              className="p-2 text-gray-400 hover:text-red-600"
              aria-label="Delete tour"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-2" />
            {tour.duration}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <DollarSign className="h-4 w-4 mr-2" />
            From AED {tour.sharingPrice}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="h-4 w-4 mr-2" />
            Max {tour.maxCapacity} people
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Star className="h-4 w-4 mr-2" />
            {tour.rating} ({tour.totalReviews} reviews)
          </div>
        </div>

        <div className="mt-4 flex items-center space-x-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              tour.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {tour.isActive ? 'Active' : 'Inactive'}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {tour.category}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {tour.location}
          </span>
        </div>

        {tour.features.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2">Features</h4>
            <div className="flex flex-wrap gap-2">
              {tour.features.map((feature, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TourListItem; 