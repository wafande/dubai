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
  Ship,
  Plane,
  Car,
  Calendar,
  MapPin,
  Upload,
  X,
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
  pricePerHour: 1000,
  pricePerDay: 24000,
  capacity: 4,
  features: [],
  specifications: {},
  location: 'Dubai',
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
      const backendVehicles = await apiService.getFleet();

      // Convert backend vehicles to our Vehicle type
      const formattedVehicles: Vehicle[] = backendVehicles.map((v) => {
        // Helper function to safely parse JSON
        const safeJsonParse = (str: string | null, fallback: unknown = []) => {
          if (!str) return fallback;
          try {
            return JSON.parse(str);
          } catch {
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
          pricePerHour: v.price_per_hour,
          pricePerDay: v.price_per_day,
          capacity: v.capacity || 4,
          features: Array.isArray(v.features) ? v.features : safeJsonParse(v.features, []) as string[],
          specifications: typeof v.specifications === 'object' ? v.specifications : safeJsonParse(v.specifications, {}) as Record<string, string>,
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
            apiService.addFleetItem({
              name: vehicle.name,
              type: vehicle.type,
              description: vehicle.description,
              price_per_hour: vehicle.pricePerHour,
              price_per_day: vehicle.pricePerDay || 0,
              capacity: vehicle.capacity,
              location: vehicle.location,
              image_url: vehicle.images[0],
              features: vehicle.features,
              specifications: vehicle.specifications,
              is_active: vehicle.isActive,
              maintenance_schedule: vehicle.maintenanceSchedule
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
      images: vehicle.images || [],
      pricePerHour: vehicle.pricePerHour,
      pricePerDay: vehicle.pricePerDay || vehicle.pricePerHour * 24,
      capacity: vehicle.capacity,
      features: vehicle.features || [],
      specifications: vehicle.specifications || {},
      location: vehicle.location || 'Dubai',
      availability: vehicle.availability || {
        dates: [],
        isAvailable: true,
      },
      isActive: vehicle.isActive,
      maintenanceSchedule: vehicle.maintenanceSchedule || {
        lastMaintenance: '',
        nextMaintenance: '',
        notes: '',
      },
    });
    setIsModalOpen(true);
  };

  const handleSaveVehicle = async () => {
    try {
      // Validate required fields
      if (!editForm.name || !editForm.type || !editForm.description) {
        toast.error('Name, type, and description are required');
        return;
      }

      // Validate numeric fields
      if (editForm.pricePerHour <= 0 || editForm.capacity <= 0) {
        toast.error('Price per hour and capacity must be greater than 0');
        return;
      }

      // Validate image URL
      if (!editForm.images[0]) {
        toast.error('At least one image is required');
        return;
      }

      const vehicleData = {
        name: editForm.name.trim(),
        type: editForm.type,
        description: editForm.description.trim(),
        price_per_hour: Number(editForm.pricePerHour),
        price_per_day: Number(editForm.pricePerDay) || Number(editForm.pricePerHour) * 24,
        capacity: Number(editForm.capacity),
        location: editForm.location.trim() || 'Dubai',
        image_url: editForm.images[0],
        features: editForm.features || [],
        specifications: editForm.specifications || {},
        is_active: editForm.isActive ?? true,
        maintenance_schedule: editForm.maintenanceSchedule || {
          lastMaintenance: '',
          nextMaintenance: '',
          notes: ''
        }
      };

      if (selectedVehicle) {
        // Update existing vehicle
        await apiService.updateFleetItem(selectedVehicle.id, vehicleData);
        toast.success('Vehicle updated successfully');
        loadVehicles(); // Refresh the list
        setIsModalOpen(false);
      } else {
        // Create new vehicle
        await apiService.addFleetItem(vehicleData);
        toast.success('Vehicle added successfully');
        loadVehicles(); // Refresh the list
        setIsModalOpen(false);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save vehicle';
      toast.error(errorMessage);
      console.error('Error saving vehicle:', error);
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    try {
      await apiService.deleteFleetItem(vehicleId);
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
    setIsUploading(true);
    const newImages: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        if (!ACCEPTED_IMAGE_TYPES.includes(files[i].type)) {
          toast.error(`File "${files[i].name}" is not a supported image type`);
          continue;
        }

        if (files[i].size > MAX_FILE_SIZE) {
          toast.error(`File "${files[i].name}" exceeds the 5MB size limit`);
          continue;
        }

        try {
          const dataUrl = await validateImage(files[i]);
          newImages.push(dataUrl);
        } catch (error) {
          toast.error(`Failed to process "${files[i].name}": ${error}`);
        }
      }

      if (newImages.length > 0) {
        setEditForm(prev => ({
          ...prev,
          images: [...prev.images, ...newImages]
        }));
        toast.success(`${newImages.length} image${newImages.length > 1 ? 's' : ''} uploaded successfully`);
      }
    } catch (error) {
      console.error('Error processing images:', error);
      toast.error('Failed to process images');
    } finally {
      setIsUploading(false);
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
  }, [editForm.images.length]);

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
        setEditForm(prev => ({
          ...prev,
          images: [...prev.images, ...newImages]
        }));
        toast.success(`${newImages.length} image${newImages.length > 1 ? 's' : ''} uploaded successfully`);
      }
    } catch (error) {
      console.error('Error processing images:', error);
      toast.error('Failed to process images');
    } finally {
      setIsUploading(false);
      setIsDragging(false);
      // Reset the input value to allow uploading the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    toast.success('Image removed');
  };

  const handleReorderImages = (dragIndex: number, dropIndex: number) => {
    setEditForm(prev => {
      const newImages = [...prev.images];
    const [draggedImage] = newImages.splice(dragIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);
      return {
        ...prev,
        images: newImages
      };
    });
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
                  AED {formatPrice(vehicle.pricePerHour)}/hour
                </div>
                {vehicle.pricePerDay && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    AED {formatPrice(vehicle.pricePerDay)}/day
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  {vehicle.capacity} passengers
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  {vehicle.location}
                </div>
              </div>

              {vehicle.features.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {vehicle.features.slice(0, 3).map((feature, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-800"
                      >
                        {feature}
                      </span>
                    ))}
                    {vehicle.features.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{vehicle.features.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm text-gray-900 bg-white"
                      placeholder="Enter vehicle name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select
                      value={editForm.type}
                      onChange={(e) => setEditForm({ ...editForm, type: e.target.value as VehicleType })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm text-gray-900 bg-white"
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm text-gray-900 bg-white"
                    placeholder="Enter vehicle description"
                  />
                </div>

                {/* Image Upload Section */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Images ({editForm.images.length}/{MAX_IMAGES})
                  </label>
                  
                  {/* Image Upload Zone */}
                  <div
                    ref={dropZoneRef}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`
                      relative border-2 border-dashed rounded-lg p-4 text-center
                      ${isDragging ? 'border-amber-500 bg-amber-50' : 'border-gray-300 hover:border-amber-500'}
                    `}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="hidden"
                    />

                    <div className="space-y-2">
                      <div className="flex justify-center">
                        <Upload className={`h-10 w-10 ${isDragging ? 'text-amber-500' : 'text-gray-400'}`} />
                      </div>
                      <div className="text-sm text-gray-600">
                        {isUploading ? (
                          <span>Uploading...</span>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="text-amber-600 hover:text-amber-700 font-medium"
                            >
                              Click to upload
                            </button>
                            {' or drag and drop'}
                          </>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        PNG, JPG, WEBP up to 5MB (max {MAX_IMAGES} images)
                      </div>
                    </div>
                  </div>

                  {/* Image Preview Grid */}
                  {editForm.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                      {editForm.images.map((image, index) => (
                        <div
                          key={index}
                          className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200"
                        >
                          <img
                            src={image}
                            alt={`Vehicle image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          
                          {/* Image Actions Overlay */}
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                            {/* Move Left */}
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => handleReorderImages(index, index - 1)}
                                className="p-1 bg-white rounded-full text-gray-700 hover:text-amber-600"
                                title="Move left"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </button>
                            )}
                            
                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="p-1 bg-white rounded-full text-red-600 hover:text-red-700"
                              title="Remove image"
                            >
                              <X className="h-5 w-5" />
                            </button>
                            
                            {/* Move Right */}
                            {index < editForm.images.length - 1 && (
                              <button
                                type="button"
                                onClick={() => handleReorderImages(index, index + 1)}
                                className="p-1 bg-white rounded-full text-gray-700 hover:text-amber-600"
                                title="Move right"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                              </button>
                            )}
                          </div>

                          {/* Primary Image Badge */}
                          {index === 0 && (
                            <div className="absolute top-2 left-2 px-2 py-1 bg-amber-500 text-white text-xs rounded-full">
                              Primary
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price per Hour (AED)</label>
                    <input
                      type="number"
                      value={editForm.pricePerHour}
                      onChange={(e) => setEditForm({ ...editForm, pricePerHour: Number(e.target.value) })}
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm text-gray-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price per Day (AED)</label>
                    <input
                      type="number"
                      value={editForm.pricePerDay}
                      onChange={(e) => setEditForm({ ...editForm, pricePerDay: Number(e.target.value) })}
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm text-gray-900 bg-white"
                    />
                  </div>
                </div>

                {/* Capacity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Capacity (Number of Passengers)</label>
                  <input
                    type="number"
                    value={editForm.capacity}
                    onChange={(e) => setEditForm({ ...editForm, capacity: Number(e.target.value) })}
                    min="1"
                    step="1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm text-gray-900 bg-white"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {editForm.type === 'helicopter' ? 'Maximum helicopter passenger capacity' :
                     editForm.type === 'yacht' ? 'Maximum yacht passenger capacity' :
                     'Maximum vehicle passenger capacity'}
                  </p>
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
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm text-gray-900 bg-white"
                          placeholder="Enter feature"
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

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm text-gray-900 bg-white"
                    placeholder="e.g., Dubai Marina, Dubai Helipad"
                  />
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