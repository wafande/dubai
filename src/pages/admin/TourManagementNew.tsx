import { useState, useEffect } from 'react';
import {
  Plus,
  Filter,
  Search,
  X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { tourService, Tour, TourFilters } from '../../services/tourService';
import { useAuth } from '../../contexts/AuthContext';
import TourForm from '../../components/tours/TourForm';
import TourListItem from '../../components/tours/TourListItem';

interface FilterState extends TourFilters {
  searchQuery: string;
}

export function TourManagement() {
  const { user } = useAuth();
  const [tours, setTours] = useState<Tour[]>([]);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    category: undefined,
    priceRange: undefined,
    duration: undefined,
    location: undefined,
    availability: false,
    searchQuery: '',
  });

  useEffect(() => {
    loadTours();
  }, []);

  const loadTours = async () => {
    setIsLoading(true);
    try {
      const fetchedTours = await tourService.getAllTours();
      setTours(fetchedTours);
    } catch (error) {
      toast.error('Failed to load tours');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTour = async (formData: any) => {
    setIsSubmitting(true);
    try {
      if (selectedTour) {
        // Update existing tour
        const updatedTour = await tourService.updateTour({
          id: selectedTour.id,
          ...formData,
        });
        setTours(tours.map(tour =>
          tour.id === updatedTour.id ? updatedTour : tour
        ));
        toast.success('Tour updated successfully');
      } else {
        // Create new tour
        const newTour = await tourService.createTour(formData);
        setTours([...tours, newTour]);
        toast.success('Tour created successfully');
      }
      setIsEditModalOpen(false);
    } catch (error) {
      toast.error(selectedTour ? 'Failed to update tour' : 'Failed to create tour');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTour = async (tourId: string) => {
    try {
      await tourService.deleteTour(tourId);
      setTours(tours.filter(tour => tour.id !== tourId));
      setIsDeleteModalOpen(false);
      toast.success('Tour deleted successfully');
    } catch (error) {
      toast.error('Failed to delete tour');
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    try {
      const tourId = result.draggableId;
      const newOrder = result.destination.index + 1;
      const updatedTours = await tourService.updateTourOrder(tourId, newOrder);
      setTours(updatedTours);
    } catch (error) {
      toast.error('Failed to update tour order');
    }
  };

  const handleSearch = async () => {
    try {
      const filteredTours = await tourService.filterTours(filters);
      setTours(filteredTours);
    } catch (error) {
      toast.error('Failed to filter tours');
    }
  };

  const resetFilters = () => {
    setFilters({
      category: undefined,
      priceRange: undefined,
      duration: undefined,
      location: undefined,
      availability: false,
      searchQuery: '',
    });
    loadTours();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Tour Management</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search tours..."
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </button>

          <button
            onClick={() => {
              setSelectedTour(null);
              setIsEditModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Tour
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Filters</h3>
            <button
              onClick={resetFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Reset filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={filters.category || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  category: e.target.value as Tour['category'] || undefined,
                }))}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
              >
                <option value="">All Categories</option>
                <option value="helicopter">Helicopter</option>
                <option value="yacht">Yacht</option>
                <option value="luxury-car">Luxury Car</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                value={filters.location || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  location: e.target.value || undefined,
                }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                placeholder="Enter location"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Duration</label>
              <input
                type="text"
                value={filters.duration || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  duration: e.target.value || undefined,
                }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                placeholder="e.g., 30 minutes"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.availability}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  availability: e.target.checked,
                }))}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Available only</span>
            </label>

            <button
              onClick={handleSearch}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tours">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {tours.map((tour, index) => (
                <Draggable key={tour.id} draggableId={tour.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <TourListItem
                        tour={tour}
                        onEdit={() => {
                          setSelectedTour(tour);
                          setIsEditModalOpen(true);
                        }}
                        onDelete={() => {
                          setSelectedTour(tour);
                          setIsDeleteModalOpen(true);
                        }}
                        dragHandleProps={provided.dragHandleProps}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {selectedTour ? 'Edit Tour' : 'Add New Tour'}
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <TourForm
              tour={selectedTour}
              onSubmit={handleSaveTour}
              onCancel={() => setIsEditModalOpen(false)}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedTour && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Delete Tour</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{selectedTour.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTour(selectedTour.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 