import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, MessageCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import VideoBackground from '../components/VideoBackground';
import { VIDEOS, SERVICES } from '../constants/mediaAssets';
import { api } from '../services/api';

interface Yacht {
  id: string;
  name: string;
  category: string;
  price: string;
  pricePerDay: string;
  image: string;
  features: string[];
  description: string;
  specifications: {
    [key: string]: string;
  };
}

export const YachtChartersPage = () => {
  const [yachts, setYachts] = useState<Yacht[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadYachts = async () => {
      try {
        const response = await api.get('/api/admin/fleet');
        const fleetData = response.data;
        
        // Filter and format yacht data
        const formattedYachts = fleetData
          .filter((item: any) => item.type === 'yacht')
          .map((yacht: any) => {
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
            const features = safeJsonParse(yacht.features, []);
            const specifications = safeJsonParse(yacht.specifications, {});

            return {
              id: yacht.id.toString(),
              name: yacht.name,
              category: 'Luxury Yacht',
              price: `From AED ${yacht.price_per_hour.toLocaleString()}/hour`,
              pricePerDay: `From AED ${yacht.price_per_day ? yacht.price_per_day.toLocaleString() : (yacht.price_per_hour * 24).toLocaleString()}/day`,
              image: yacht.image_url || 'https://images.unsplash.com/photo-1621277224630-81321e68c03e',
              features: features,
              description: yacht.description,
              specifications: specifications
            };
          });

        setYachts(formattedYachts);
      } catch (error) {
        console.error('Error loading yachts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadYachts();
  }, []);

  return (
    <>
      <VideoBackground
        videoUrl={VIDEOS.YACHT.url}
        posterImage={SERVICES.YACHT.main}
        overlayOpacity={0.3}
      />
      
      <div className="relative min-h-screen">
        <Navbar />
        
        {/* Hero Section */}
        <section className="h-screen flex items-center justify-center">
          <div className="flex flex-col items-center justify-center text-center px-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold mb-6"
            >
              Luxury Yacht Charters
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl mb-8 max-w-3xl"
            >
              Experience Dubai's stunning coastline from the comfort of our world-class yachts
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
                Explore Fleet
              </a>
              <a
                href="#book"
                className="border-2 border-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-white hover:text-black transition-colors"
              >
                Book Now
              </a>
            </motion.div>
          </div>
        </section>

        {/* Fleet Section */}
        <section id="explore" className="py-24 px-4 bg-black/50 backdrop-blur-sm">
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
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {yachts.map((yacht, index) => (
                  <motion.div
                    key={yacht.id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="group bg-black/80 backdrop-blur-sm rounded-lg overflow-hidden"
                  >
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img
                        src={yacht.image}
                        alt={yacht.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    </div>

                    <div className="p-6">
                      <div className="mb-4">
                        <span className="text-sm text-gray-400 block">{yacht.category}</span>
                        <h3 className="text-2xl font-bold">{yacht.name}</h3>
                      </div>

                      <p className="text-gray-300 mb-4">{yacht.description}</p>

                      <div className="space-y-2 mb-4">
                        <p className="text-xl font-bold">{yacht.price}</p>
                        <p className="text-lg text-gray-400">{yacht.pricePerDay}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-6">
                        {yacht.features.map((feature, i) => (
                          <span key={i} className="text-sm text-gray-400">• {feature}</span>
                        ))}
                      </div>

                      <Link
                        to={`/booking?yacht=${yacht.id}`}
                        className="inline-block bg-white text-black px-6 py-2 rounded-sm text-sm uppercase tracking-wider hover:bg-opacity-90 transition-colors"
                      >
                        Book Now
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 bg-black/50 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Set Sail?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Contact our team for personalized yacht charter arrangements
            </p>
            <Link
              to="/contact"
              className="inline-block bg-white text-black px-8 py-3 text-lg uppercase tracking-wider hover:bg-opacity-90 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};