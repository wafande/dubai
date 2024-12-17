import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, MessageCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import VideoBackground from '../components/VideoBackground';
import { VIDEOS, SERVICES } from '../constants/mediaAssets';
import { apiService } from '../services/api';

interface Vehicle {
  id: string;
  name: string;
  category: string;
  price: string;
  image: string;
  features: string[];
  description: string;
  specifications: {
    [key: string]: string;
  };
}

const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const response = await apiService.read('/api/admin/fleet');
        const fleetData = response;
        
        // Filter and format luxury car data
        const formattedVehicles = fleetData
          .filter((item: any) => item.type === 'luxury-car')
          .map((vehicle: any) => {
            // Helper function to safely parse JSON string or return existing object
            const safeJsonParse = (data: any, fallback: any) => {
              if (typeof data === 'string') {
                try {
                  return JSON.parse(data);
                } catch (e) {
                  console.warn('Failed to parse JSON:', data);
                  return fallback;
                }
              }
              return data || fallback;
            };

            // Parse features and specifications
            const features = safeJsonParse(vehicle.features, []);
            const specifications = safeJsonParse(vehicle.specifications, {});

            return {
              id: vehicle.id.toString(),
              name: vehicle.name,
              category: 'Luxury Vehicle',
              price: `From AED ${vehicle.price_per_hour.toLocaleString()}/hour`,
              image: vehicle.image_url || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70',
              features: features,
              description: vehicle.description,
              specifications: specifications
            };
          });

        setVehicles(formattedVehicles);
      } catch (error) {
        console.error('Error loading vehicles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVehicles();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      {/* Hero Section with Video Background */}
      <VideoBackground
        videoUrl={VIDEOS.VEHICLE.url}
        posterImage={SERVICES.VEHICLE.main}
        overlayOpacity={0.4}
      >
        <div className="flex flex-col items-center justify-center h-full text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            Luxury Vehicles
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl mb-8 max-w-3xl"
          >
            Drive the finest automobiles Dubai has to offer
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex space-x-4"
          >
            <a
              href="#explore"
              className="bg-white text-black px-8 py-3 rounded-lg text-lg font-medium hover:bg-opacity-90 transition-colors"
            >
              View Fleet
            </a>
            <a
              href="#book"
              className="border-2 border-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-white hover:text-black transition-colors"
            >
              Reserve Now
            </a>
          </motion.div>
        </div>
      </VideoBackground>

      {/* Vehicle Fleet */}
      <section id="explore" className="py-24 px-4" aria-label="Vehicle fleet">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold mb-16 text-center"
          >
            Our Premium Fleet
          </motion.h2>

          {isLoading ? (
            <div className="flex justify-center items-center h-64" role="status" aria-label="Loading vehicles">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" aria-hidden="true" />
              <span className="sr-only">Loading vehicles...</span>
            </div>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {vehicles.map((vehicle, index) => (
                <li
                  key={vehicle.id}
                  className="group relative overflow-hidden bg-gray-900 rounded-lg"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="aspect-[16/9] relative overflow-hidden">
                      <img
                        src={vehicle.image}
                        alt={`${vehicle.name} exterior view`}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" aria-hidden="true" />
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="mb-4">
                        <span className="text-sm text-gray-400 mb-2 block">{vehicle.category}</span>
                        <h3 className="text-2xl font-bold mb-2">{vehicle.name}</h3>
                        <p className="text-gray-300 text-lg">{vehicle.price}</p>
                      </div>
                      
                      <ul className="grid grid-cols-2 gap-2 mb-6" aria-label={`${vehicle.name} features`}>
                        {vehicle.features.map((feature, i) => (
                          <li key={i} className="text-sm text-gray-400">• {feature}</li>
                        ))}
                      </ul>
                      
                      <Link
                        to={`/booking?vehicle=${vehicle.id}`}
                        className="inline-block bg-white text-black px-6 py-2 rounded-sm text-sm uppercase tracking-wider hover:bg-opacity-90 transition-colors"
                        aria-label={`Book ${vehicle.name}`}
                      >
                        Book Now
                      </Link>
                    </div>
                  </motion.div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gray-900" aria-label="Contact call to action">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Experience Luxury?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Contact our team for personalized service and special requests
          </p>
          <Link
            to="/contact"
            className="inline-block bg-white text-black px-8 py-3 text-lg uppercase tracking-wider hover:bg-opacity-90 transition-colors"
            aria-label="Contact our team"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
};

export default VehiclesPage;