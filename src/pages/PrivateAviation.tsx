import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Calendar, MessageCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import VideoBackground from '../components/VideoBackground';
import { VIDEOS, SERVICES } from '../constants/mediaAssets';
import { api } from '../services/api';

interface AviationService {
  id: string;
  name: string;
  category: string;
  price: string;
  image: string;
  features: string[];
  description: string;
  range?: string;
  speed?: string;
}

interface Experience {
  title: string;
  duration: string;
  description: string;
  includes: string[];
  price: string;
  type: 'helicopter' | 'jet';
}

interface Destinations {
  jet: string[];
  helicopter: string[];
}

const aviationFleet: { jets: AviationService[] } = {
  jets: [
    {
      id: 'global-7500',
      name: 'Global 7500',
      category: 'Ultra Long Range',
      price: 'From AED 85,000/hour',
      image: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b',
      features: ['14 Passengers', 'Global Range', 'Private Suite', 'Meeting Room', 'Entertainment System', 'Satellite Wi-Fi'],
      description: 'Ultimate luxury in private aviation with intercontinental range.',
      range: '7,700 nm',
      speed: '0.925 Mach',
    },
    {
      id: 'challenger-650',
      name: 'Challenger 650',
      category: 'Large Cabin',
      price: 'From AED 55,000/hour',
      image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0',
      features: ['12 Passengers', 'Transcontinental', 'Full Galley', 'Wi-Fi', 'Entertainment'],
      description: 'Perfect balance of comfort and capability for business or leisure.',
      range: '4,000 nm',
      speed: '0.85 Mach',
    },
  ],
};

const experiences: Experience[] = [
  {
    title: 'Dubai Scenic Tour',
    duration: '30 Minutes',
    description: 'Experience Dubai\'s iconic landmarks from above',
    includes: ['Palm Jumeirah', 'Burj Khalifa', 'World Islands', 'Photo Opportunities'],
    price: 'AED 5,000',
    type: 'helicopter',
  },
  {
    title: 'Desert Safari by Air',
    duration: '1 Hour',
    description: 'Explore the majestic desert landscape',
    includes: ['Desert Dunes', 'Wildlife Spotting', 'Sunrise/Sunset Options', 'Landing Experience'],
    price: 'AED 12,000',
    type: 'helicopter',
  },
  {
    title: 'Private Jet Escape',
    duration: 'Full Day',
    description: 'Luxury day trip to nearby destinations',
    includes: ['Return Flights', 'Ground Transport', 'VIP Handling', 'Catering'],
    price: 'From AED 150,000',
    type: 'jet',
  },
];

const destinations: Destinations = {
  helicopter: ['Palm Jumeirah', 'Burj Al Arab', 'Desert Safari', 'Abu Dhabi Tour', 'Ras Al Khaimah'],
  jet: ['Maldives', 'Seychelles', 'London', 'Paris', 'Geneva', 'Monaco', 'Saint Petersburg', 'Nice', 'Mykonos', 'Ibiza'],
};

const PrivateAviationPage = () => {
  const [helicopters, setHelicopters] = useState<AviationService[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHelicopters = async () => {
      try {
        const response = await api.get('/api/admin/fleet');
        const fleetData = response.data;
        
        // Filter and format helicopter data
        const formattedHelicopters = fleetData
          .filter((item: any) => item.type === 'helicopter')
          .map((helicopter: any) => {
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
            const features = safeJsonParse(helicopter.features, []);
            const specifications = safeJsonParse(helicopter.specifications, {});

            return {
              id: helicopter.id.toString(),
              name: helicopter.name,
              category: 'VIP Transport',
              price: `From AED ${helicopter.price_per_hour.toLocaleString()}/hour`,
              image: helicopter.image_url || 'https://images.unsplash.com/photo-1534321238895-da3ab632df3e',
              features: features,
              description: helicopter.description,
              range: specifications.range || '380 nm',
              speed: specifications.speed || '150 knots',
            };
          });

        setHelicopters(formattedHelicopters);
      } catch (error) {
        console.error('Error loading helicopters:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHelicopters();
  }, []);

  return (
    <>
      <VideoBackground
        videoUrl={VIDEOS.AVIATION.url}
        posterImage={SERVICES.AVIATION.main}
        overlayOpacity={0.3}
      />
      
      <div className="relative min-h-screen text-white">
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
              Private Aviation
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl mb-8 max-w-3xl"
            >
              Experience the ultimate in luxury air travel with our fleet of private jets and helicopters
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex space-x-4"
            >
              <a
                href="#jets"
                className="bg-white text-black px-8 py-3 rounded-lg text-lg font-medium hover:bg-opacity-90 transition-colors"
              >
                Private Jets
              </a>
              <a
                href="#helicopters"
                className="border-2 border-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-white hover:text-black transition-colors"
              >
                Helicopters
              </a>
            </motion.div>
          </div>
        </section>

        {/* Private Jets Section */}
        <section id="jets" className="py-24 px-4 bg-black/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-bold mb-16 text-center"
            >
              Private Jet Fleet
            </motion.h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {aviationFleet.jets.map((aircraft, index) => (
                <motion.div
                  key={aircraft.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group bg-black/80 backdrop-blur-sm rounded-lg overflow-hidden"
                >
                  <div className="aspect-[16/9] relative overflow-hidden">
                    <img
                      src={aircraft.image}
                      alt={aircraft.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-sm text-gray-400 block">{aircraft.category}</span>
                        <h3 className="text-2xl font-bold">{aircraft.name}</h3>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-400 block">Range: {aircraft.range}</span>
                        <span className="text-sm text-gray-400">Speed: {aircraft.speed}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 mb-4">{aircraft.description}</p>
                    <p className="text-xl font-bold mb-4">{aircraft.price}</p>
                    
                    <div className="grid grid-cols-2 gap-2 mb-6">
                      {aircraft.features.map((feature, i) => (
                        <span key={i} className="text-sm text-gray-400">• {feature}</span>
                      ))}
                    </div>
                    
                    <Link
                      to={`/booking?aircraft=${aircraft.id}`}
                      className="inline-block bg-white text-black px-6 py-2 rounded-sm text-sm uppercase tracking-wider hover:bg-opacity-90 transition-colors"
                    >
                      Book Now
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Helicopter Section */}
        <section id="helicopters" className="py-24 px-4 bg-black/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-bold mb-16 text-center"
            >
              Helicopter Fleet
            </motion.h2>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {helicopters.map((helicopter, index) => (
                  <motion.div
                    key={helicopter.id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="group bg-black/80 backdrop-blur-sm rounded-lg overflow-hidden"
                  >
                    <div className="aspect-[16/9] relative overflow-hidden">
                      <img
                        src={helicopter.image}
                        alt={helicopter.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    </div>

                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="text-sm text-gray-400 block">{helicopter.category}</span>
                          <h3 className="text-2xl font-bold">{helicopter.name}</h3>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-gray-400 block">Range: {helicopter.range}</span>
                          <span className="text-sm text-gray-400">Speed: {helicopter.speed}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 mb-4">{helicopter.description}</p>
                      <p className="text-xl font-bold mb-4">{helicopter.price}</p>
                      
                      <div className="grid grid-cols-2 gap-2 mb-6">
                        {helicopter.features.map((feature, i) => (
                          <span key={i} className="text-sm text-gray-400">• {feature}</span>
                        ))}
                      </div>
                      
                      <Link
                        to={`/booking?aircraft=${helicopter.id}`}
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

        {/* Experiences Section */}
        <section className="py-24 px-4 bg-black/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-bold mb-16 text-center"
            >
              Aviation Experiences
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {experiences.map((exp, index) => (
                <motion.div
                  key={exp.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-black/80 backdrop-blur-sm p-8 rounded-lg"
                >
                  <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-sm mb-4">
                    {exp.type === 'helicopter' ? 'Helicopter' : 'Private Jet'}
                  </span>
                  <h3 className="text-2xl font-bold mb-2">{exp.title}</h3>
                  <p className="text-gray-400 mb-4">{exp.duration}</p>
                  <p className="text-gray-300 mb-6">{exp.description}</p>
                  <ul className="space-y-2 mb-8">
                    {exp.includes.map((item, i) => (
                      <li key={i} className="text-gray-400 text-sm">• {item}</li>
                    ))}
                  </ul>
                  <p className="text-xl font-bold mb-6">{exp.price}</p>
                  <Link
                    to={`/booking?experience=${exp.title.toLowerCase().replace(' ', '-')}`}
                    className="inline-block bg-white text-black px-6 py-2 rounded-sm text-sm uppercase tracking-wider hover:bg-opacity-90 transition-colors"
                  >
                    Book Experience
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Destinations Section */}
        <section className="py-24 px-4 bg-black/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-bold mb-16"
            >
              Popular Destinations
            </motion.h2>

            <div className="space-y-12">
              {/* Jet Destinations */}
              <div>
                <h3 className="text-2xl font-bold mb-6">Private Jet Destinations</h3>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="flex flex-wrap justify-center gap-4"
                >
                  {destinations.jet.map((destination, index) => (
                    <motion.span
                      key={destination}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="px-6 py-3 bg-black/80 backdrop-blur-sm rounded-full text-sm uppercase tracking-wider"
                    >
                      {destination}
                    </motion.span>
                  ))}
                </motion.div>
              </div>

              {/* Helicopter Destinations */}
              <div>
                <h3 className="text-2xl font-bold mb-6">Helicopter Tour Destinations</h3>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="flex flex-wrap justify-center gap-4"
                >
                  {destinations.helicopter.map((destination, index) => (
                    <motion.span
                      key={destination}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="px-6 py-3 bg-black/80 backdrop-blur-sm rounded-full text-sm uppercase tracking-wider"
                    >
                      {destination}
                    </motion.span>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 bg-black/50 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Take Flight?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Contact our aviation experts for personalized flight arrangements
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

export default PrivateAviationPage; 