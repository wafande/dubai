import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  DollarSign,
  Users,
  Clock,
  Plane,
  Ship,
  Car,
  Calendar,
  MapPin,
  Info,
  Upload,
  X,
  CropIcon,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { vehicles as frontendVehicles } from '../../data/vehicles';
import { BookingForm } from '../../components/BookingForm';
import { api, apiService } from '../../services/api';

type VehicleType = 'helicopter' | 'yacht' | 'luxury-car' | 'private-jet';

interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  description: string;
  images: string[];
  pricePerHour: number;
  pricePerDay?: number;
  capacity: number;
  features: string[];
  specifications: {
    [key: string]: string;
  };
  location: string;
  availability: {
    dates: string[];
    isAvailable: boolean;
  };
  isActive: boolean;
  maintenanceSchedule?: {
    lastMaintenance: string;
    nextMaintenance: string;
    notes: string;
  };
}

const defaultVehicle: Omit<Vehicle, 'id'> = {
  name: '',
  type: 'helicopter',
  description: '',
  images: [],
  pricePerHour: 0,
  pricePerDay: 0,
  capacity: 0,
  features: [],
  specifications: {},
  location: '',
  availability: {
    dates: [],
    isAvailable: true,
  },
  isActive: true,
  maintenanceSchedule: {
    lastMaintenance: '',
    nextMaintenance: '',
    notes: '',
  },
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGES = 10;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const TARGET_IMAGE_SIZE = 800; // pixels for max width/height

const formatPrice = (price: number | undefined | null): string => {
  if (typeof price !== 'number') return '0';
  return price.toLocaleString();
};

export function FleetManagement() {
  const [activeTab, setActiveTab] = useState<VehicleType>('helicopter');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editForm, setEditForm] = useState<Omit<Vehicle, 'id'>>(defaultVehicle);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [cropMode, setCropMode] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedVehicleForBooking, setSelectedVehicleForBooking] = useState<Vehicle | null>(null);

  useEffect(() => {
    loadVehicles();
    // Set up polling for real-time updates
    const interval = setInterval(loadVehicles, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadVehicles = async () => {
    setIsLoading(true);
    try {
      // Fetch vehicles from the backend API
      const response = await api.get('/api/admin/fleet');
      const backendVehicles = response.data;

      // Convert backend vehicles to our Vehicle type
      const formattedVehicles: Vehicle[] = backendVehicles.map((v: any) => {
        // Helper function to safely parse JSON
        const safeJsonParse = (str: string | null, fallback: any = []) => {
          if (!str) return fallback;
          try {
            return JSON.parse(str);
          } catch (e) {
            console.warn('Failed to parse JSON:', str);
            return fallback;
          }
        };

        return {
          id: v.id.toString(),
          name: v.name,
          type: v.type as VehicleType,
          description: v.description,
          images: v.image_url ? [v.image_url] : [],
          pricePerHour: v.price,
          pricePerDay: v.sharing_price,
          capacity: v.max_capacity || 4,
          features: Array.isArray(v.features) ? v.features : safeJsonParse(v.features, []),
          specifications: typeof v.specifications === 'object' ? v.specifications : safeJsonParse(v.specifications, {}),
          location: v.location || 'Dubai',
          availability: {
            dates: [],
            isAvailable: v.is_active || true,
          },
          isActive: v.is_active || true,
          maintenanceSchedule: typeof v.maintenance_schedule === 'object' ? v.maintenance_schedule : safeJsonParse(v.maintenance_schedule, {
            lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            notes: 'Regular maintenance schedule',
          }),
        };
      });

      // If no vehicles in database yet, use frontend mock data
      if (formattedVehicles.length === 0) {
        // Convert frontend vehicles to our Vehicle type
        const luxuryCarVehicles: Vehicle[] = frontendVehicles.map(v => ({
          id: v.id,
          name: v.name,
          type: 'luxury-car',
          description: `${v.brand} ${v.model} ${v.year}`,
          images: [v.image],
          pricePerHour: Math.round(v.pricePerDay / 24),
          pricePerDay: v.pricePerDay,
          capacity: 4,
          features: v.features,
          specifications: {
            'Brand': v.brand,
            'Model': v.model,
            'Year': v.year.toString(),
          },
          location: 'Dubai Luxury Cars Hub',
          availability: {
            dates: [],
            isAvailable: v.available,
          },
          isActive: v.available,
          maintenanceSchedule: {
            lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            notes: 'Regular maintenance schedule',
          },
        }));

        // Add helicopter and yacht mock data
        const mockHelicopters: Vehicle[] = [
          {
            id: 'bell-429',
            name: 'Bell 429',
            type: 'helicopter',
            description: 'Luxury twin-engine helicopter with advanced avionics',
            images: ['/images/bell-429.jpg'],
            pricePerHour: 2500,
            capacity: 7,
            features: ['VIP interior', 'Air conditioning', 'Noise reduction'],
            specifications: {
              'Max Speed': '155 knots',
              'Range': '411 nautical miles',
              'Engine': 'Twin Pratt & Whitney',
            },
            location: 'Dubai Helipad',
            availability: {
              dates: [],
              isAvailable: true,
            },
            isActive: true,
            maintenanceSchedule: {
              lastMaintenance: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
              nextMaintenance: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
              notes: 'Regular maintenance',
            },
          },
        ];

        const mockYachts: Vehicle[] = [
          {
            id: 'majesty-140',
            name: 'Majesty 140',
            type: 'yacht',
            description: 'Luxury superyacht with exceptional amenities',
            images: ['/images/majesty-140.jpg'],
            pricePerHour: 5000,
            pricePerDay: 100000,
            capacity: 12,
            features: ['Sun deck', 'Beach club', 'Master suite', 'Water toys'],
            specifications: {
              'Length': '140 ft',
              'Beam': '27 ft',
              'Engines': 'Twin MTU 2600 HP',
            },
            location: 'Dubai Marina',
            availability: {
              dates: [],
              isAvailable: true,
            },
            isActive: true,
            maintenanceSchedule: {
              lastMaintenance: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              nextMaintenance: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(),
              notes: 'Regular maintenance',
            },
          },
        ];

        setVehicles([...luxuryCarVehicles, ...mockHelicopters, ...mockYachts]);

        // Save mock data to database
        try {
          await Promise.all([...luxuryCarVehicles, ...mockHelicopters, ...mockYachts].map(vehicle => 
            api.post('/api/admin/fleet', {
              name: vehicle.name,
              description: vehicle.description,
              type: vehicle.type,
              price: vehicle.pricePerHour,
              sharing_price: vehicle.pricePerDay,
              max_capacity: vehicle.capacity,
              features: JSON.stringify(vehicle.features),
              specifications: JSON.stringify(vehicle.specifications),
              location: vehicle.location,
              is_active: vehicle.isActive,
              maintenance_schedule: JSON.stringify(vehicle.maintenanceSchedule),
              image_url: vehicle.images[0]
            })
          ));
        } catch (error) {
          console.error('Error saving mock data to database:', error);
        }
      } else {
        setVehicles(formattedVehicles);
      }
    } catch (error) {
      toast.error('Failed to load vehicles');
      console.error('Error loading vehicles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVehicle = () => {
    setSelectedVehicle(null);
    setEditForm({ ...defaultVehicle, type: activeTab });
    setIsModalOpen(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setEditForm({
      name: vehicle.name,
      type: vehicle.type,
      description: vehicle.description,
      images: vehicle.images,
      pricePerHour: vehicle.pricePerHour,
      pricePerDay: vehicle.pricePerDay,
      capacity: vehicle.capacity,
      features: vehicle.features,
      specifications: vehicle.specifications,
      location: vehicle.location,
      availability: vehicle.availability,
      isActive: vehicle.isActive,
      maintenanceSchedule: vehicle.maintenanceSchedule,
    });
    setIsModalOpen(true);
  };

  const handleSaveVehicle = async () => {
    try {
      const vehicleData = {
        name: editForm.name || '',
        description: editForm.description || '',
        type: editForm.type,
        price_per_hour: Number(editForm.pricePerHour) || 0,
        price_per_day: Number(editForm.pricePerDay) || 0,
        capacity: Number(editForm.capacity) || 0,
        location: editForm.location || '',
        image_url: editForm.images[0] || null,
        features: JSON.stringify(editForm.features || []),
        specifications: JSON.stringify(editForm.specifications || {}),
        is_active: editForm.isActive ?? true,
        maintenance_schedule: JSON.stringify(editForm.maintenanceSchedule || {
          lastMaintenance: '',
          nextMaintenance: '',
          notes: ''
        })
      };

      if (selectedVehicle) {
        // Update existing vehicle
        await api.put(`/api/admin/fleet/${selectedVehicle.id}`, vehicleData);
        toast.success('Vehicle updated successfully');
      } else {
        // Create new vehicle
        await api.post('/api/admin/fleet', vehicleData);
        toast.success('Vehicle added successfully');
      }

      loadVehicles(); // Refresh the list
      setIsModalOpen(false);
    } catch (error) {
      toast.error(selectedVehicle ? 'Failed to update vehicle' : 'Failed to add vehicle');
      console.error('Error saving vehicle:', error);
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    try {
      await api.delete(`/admin/fleet/${vehicleId}`);
      toast.success('Vehicle deleted successfully');
      loadVehicles(); // Refresh the list
    } catch (error) {
      toast.error('Failed to delete vehicle');
      console.error('Error deleting vehicle:', error);
    }
  };

  const getTabIcon = (type: VehicleType) => {
    switch (type) {
      case 'helicopter':
        return Plane;
      case 'yacht':
        return Ship;
      case 'luxury-car':
        return Car;
      case 'private-jet':
        return Plane;
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => vehicle.type === activeTab);

  const getAddButtonText = () => {
    switch (activeTab) {
      case 'helicopter':
        return 'Add New Helicopter';
      case 'yacht':
        return 'Add New Yacht';
      case 'luxury-car':
        return 'Add New Vehicle';
      case 'private-jet':
        return 'Add New Jet';
      default:
        return 'Add New Vehicle';
    }
  };

  const validateImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        reject('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        reject(`File size too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
        return;
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        
        // Create a canvas to resize the image if needed
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > TARGET_IMAGE_SIZE || height > TARGET_IMAGE_SIZE) {
          if (width > height) {
            height = Math.round((height * TARGET_IMAGE_SIZE) / width);
            width = TARGET_IMAGE_SIZE;
          } else {
            width = Math.round((width * TARGET_IMAGE_SIZE) / height);
            height = TARGET_IMAGE_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject('Failed to process image');
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL(file.type, 0.8)); // 0.8 quality to reduce file size
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject('Failed to load image');
      };

      img.src = objectUrl;
    });
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const processFiles = async (files: FileList) => {
    if (editForm.images.length + files.length > MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    setIsUploading(true);
    const newImages: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        try {
          const dataUrl = await validateImage(files[i]);
          newImages.push(dataUrl);
        } catch (error) {
          toast.error(error as string);
        }
      }

      if (newImages.length > 0) {
        setEditForm({ ...editForm, images: [...editForm.images, ...newImages] });
        toast.success('Images uploaded successfully');
      }
    } catch (error) {
      console.error('Error processing images:', error);
      toast.error('Failed to process images');
    } finally {
      setIsUploading(false);
      setIsDragging(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const { files } = e.dataTransfer;
    if (files && files.length > 0) {
      if (editForm.images.length + files.length > MAX_IMAGES) {
        toast.error(`Maximum ${MAX_IMAGES} images allowed`);
        return;
      }
      processFiles(files);
    }
  }, [editForm.images]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    if (editForm.images.length + files.length > MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    setIsUploading(true);
    const newImages: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        try {
          const dataUrl = await validateImage(files[i]);
          newImages.push(dataUrl);
        } catch (error) {
          toast.error(error as string);
        }
      }

      if (newImages.length > 0) {
        setEditForm({ ...editForm, images: [...editForm.images, ...newImages] });
        toast.success('Images uploaded successfully');
      }
    } catch (error) {
      console.error('Error processing images:', error);
      toast.error('Failed to process images');
    } finally {
      setIsUploading(false);
      setIsDragging(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = editForm.images.filter((_, i) => i !== index);
    setEditForm({ ...editForm, images: newImages });
  };

  const handleReorderImages = (dragIndex: number, dropIndex: number) => {
    const newImages = [...editForm.images];
    const [draggedImage] = newImages.splice(dragIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);
    setEditForm({ ...editForm, images: newImages });
  };

  const handleBookVehicle = (vehicle: Vehicle) => {
    setSelectedVehicleForBooking(vehicle);
    setIsBookingModalOpen(true);
  };

  const handleBookingSuccess = () => {
    setIsBookingModalOpen(false);
    setSelectedVehicleForBooking(null);
    loadVehicles(); // Refresh the vehicles list
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
        <h2 className="text-2xl font-bold text-gray-900">Fleet Management</h2>
        <button
          onClick={handleAddVehicle}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          {getAddButtonText()}
        </button>
      </div>

      {/* Vehicle Type Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['helicopter', 'yacht', 'luxury-car'] as const).map((type) => {
            const Icon = getTabIcon(type);
            return (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === type
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className={`
                  h-5 w-5 mr-2
                  ${activeTab === type ? 'text-amber-500' : 'text-gray-400 group-hover:text-gray-500'}
                `} />
                {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Add Vehicle Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-dashed border-gray-300 hover:border-amber-500 cursor-pointer transition-colors"
          onClick={handleAddVehicle}
        >
          <div className="h-48 flex items-center justify-center bg-gray-50">
            <Plus className="h-12 w-12 text-gray-400" />
          </div>
          <div className="p-4 text-center">
            <h3 className="text-lg font-semibold text-gray-900">{getAddButtonText()}</h3>
            <p className="mt-1 text-sm text-gray-500">Add a new vehicle to your fleet</p>
          </div>
        </motion.div>

        {/* Vehicle Cards */}
        {filteredVehicles.map((vehicle) => (
          <motion.div
            key={vehicle.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="h-48 overflow-hidden relative">
              {vehicle.images[0] ? (
                <img
                  src={vehicle.images[0]}
                  alt={vehicle.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                </div>
              )}
              {!vehicle.isActive && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                  Inactive
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900">{vehicle.name}</h3>
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">{vehicle.description}</p>

              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <DollarSign className="h-4 w-4 mr-1" />
                  ${formatPrice(vehicle.pricePerHour)}/hour
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  {vehicle.capacity} passengers
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  {vehicle.location}
                </div>
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => handleEditVehicle(vehicle)}
                  className="p-2 text-amber-600 hover:text-amber-800"
                  title="Edit vehicle"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDeleteVehicle(vehicle.id)}
                  className="p-2 text-red-600 hover:text-red-800"
                  title="Delete vehicle"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select
                      value={editForm.type}
                      onChange={(e) => setEditForm({ ...editForm, type: e.target.value as VehicleType })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                    >
                      <option value="helicopter">Helicopter</option>
                      <option value="yacht">Yacht</option>
                      <option value="luxury-car">Luxury Car</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                  />
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price per Hour ($)</label>
                    <input
                      type="number"
                      value={editForm.pricePerHour}
                      onChange={(e) => setEditForm({ ...editForm, pricePerHour: Number(e.target.value) })}
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price per Day ($)</label>
                    <input
                      type="number"
                      value={editForm.pricePerDay}
                      onChange={(e) => setEditForm({ ...editForm, pricePerDay: Number(e.target.value) })}
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                    />
                  </div>
                </div>

                {/* Features */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Features</label>
                  <div className="mt-2 space-y-2">
                    {editForm.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
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
                          onClick={() => {
                            const newFeatures = editForm.features.filter((_, i) => i !== index);
                            setEditForm({ ...editForm, features: newFeatures });
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setEditForm({ ...editForm, features: [...editForm.features, ''] })}
                      className="text-sm text-amber-600 hover:text-amber-700"
                    >
                      Add Feature
                    </button>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Active
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveVehicle}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                  >
                    {selectedVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Modal */}
      {isBookingModalOpen && selectedVehicleForBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Book {selectedVehicleForBooking.name}</h2>
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <BookingForm
                vehicle={{
                  id: selectedVehicleForBooking.id,
                  name: selectedVehicleForBooking.name,
                  type: selectedVehicleForBooking.type,
                  pricePerHour: selectedVehicleForBooking.pricePerHour,
                  capacity: selectedVehicleForBooking.capacity,
                }}
                onSuccess={handleBookingSuccess}
                onCancel={() => setIsBookingModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 