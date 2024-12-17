import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Image as ImageIcon, DollarSign, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Service {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  duration: string;
  category: 'helicopter' | 'yacht' | 'luxury-car';
  features: string[];
  isActive: boolean;
}

export function ServicesManagement() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    price: 0,
    duration: '',
    category: 'helicopter' as Service['category'],
    image: '',
    features: [''],
    isActive: true,
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      const mockServices: Service[] = [
        {
          id: '1',
          title: 'Luxury Helicopter Tour',
          description: 'Experience Dubai from the sky with our premium helicopter tour',
          image: '/images/helicopter-tour.jpg',
          price: 999,
          duration: '30 minutes',
          category: 'helicopter',
          features: ['Panoramic views', 'Professional pilot', 'Safety briefing'],
          isActive: true,
        },
        // Add more mock services here
      ];
      setServices(mockServices);
    } catch (error) {
      toast.error('Failed to load services');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setEditForm({
      title: service.title,
      description: service.description,
      price: service.price,
      duration: service.duration,
      category: service.category,
      image: service.image,
      features: service.features,
      isActive: service.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSaveService = async () => {
    try {
      if (selectedService) {
        // Update existing service
        const updatedServices = services.map(service =>
          service.id === selectedService.id
            ? {
                ...service,
                ...editForm,
              }
            : service
        );
        setServices(updatedServices);
        toast.success('Service updated successfully');
      } else {
        // Create new service
        const newService: Service = {
          id: Math.random().toString(36).substring(2, 9),
          ...editForm,
        };
        setServices([...services, newService]);
        toast.success('Service created successfully');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error(selectedService ? 'Failed to update service' : 'Failed to create service');
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      setServices(services.filter(service => service.id !== serviceId));
      toast.success('Service deleted successfully');
    } catch (error) {
      toast.error('Failed to delete service');
    }
  };

  const handleAddFeature = () => {
    setEditForm({
      ...editForm,
      features: [...editForm.features, ''],
    });
  };

  const handleRemoveFeature = (index: number) => {
    setEditForm({
      ...editForm,
      features: editForm.features.filter((_, i) => i !== index),
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Services Management</h2>
        <button
          onClick={() => {
            setSelectedService(null);
            setEditForm({
              title: '',
              description: '',
              price: 0,
              duration: '',
              category: 'helicopter',
              image: '',
              features: [''],
              isActive: true,
            });
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Service
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {services.map((service) => (
            <motion.li
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 h-16 w-16 rounded-lg overflow-hidden">
                    {service.image ? (
                      <img
                        src={service.image}
                        alt={service.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {service.title}
                      {!service.isActive && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                    </h3>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {service.price}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {service.duration}
                      </span>
                      <span className="capitalize">{service.category}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditService(service)}
                    className="p-2 text-amber-600 hover:text-amber-800"
                    title="Edit service"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteService(service.id)}
                    className="p-2 text-red-600 hover:text-red-800"
                    title="Delete service"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {selectedService ? 'Edit Service' : 'Add New Service'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration</label>
                  <input
                    type="text"
                    value={editForm.duration}
                    onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value as Service['category'] })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                >
                  <option value="helicopter">Helicopter</option>
                  <option value="yacht">Yacht</option>
                  <option value="luxury-car">Luxury Car</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Image URL</label>
                <input
                  type="text"
                  value={editForm.image}
                  onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Features</label>
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="text-sm text-amber-600 hover:text-amber-700"
                  >
                    Add Feature
                  </button>
                </div>
                {editForm.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 mt-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => {
                        const newFeatures = [...editForm.features];
                        newFeatures[index] = e.target.value;
                        setEditForm({ ...editForm, features: newFeatures });
                      }}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveService}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-amber-600 hover:bg-amber-700"
              >
                {selectedService ? 'Update Service' : 'Create Service'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 