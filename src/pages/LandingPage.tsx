import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Play, 
  ChevronDown, 
  Star, 
  Calendar, 
  MessageCircle, 
  ArrowRight,
  Check,
  Users,
  Clock,
  Shield,
  Award,
  Heart
} from 'lucide-react';
import Navbar from '../components/Navbar';
import VideoBackground from '../components/VideoBackground';
import ServiceCarousel3D from '../components/ServiceCarousel3D';
import PriceCalculator from '../components/PriceCalculator';
import ExperienceGallery from '../components/ExperienceGallery';
import MediaAttribution from '../components/MediaAttribution';
import OptimizedImage from '../components/OptimizedImage';
import WeatherDisplay from '../components/WeatherDisplay';
import { VIDEOS, SERVICES, EXPERIENCES, IMAGE_PARAMS } from '../constants';
import { apiService } from '../services/api';

const LandingPage = () => {
  const [selectedService, setSelectedService] = useState<'yacht' | 'aviation' | 'vehicle'>('yacht');
  const [showComparison, setShowComparison] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [fleetImages, setFleetImages] = useState({
    yacht: SERVICES.YACHT.main,
    aviation: SERVICES.AVIATION.main,
    vehicle: SERVICES.VEHICLE.main
  });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.5, 0]);

  // Fetch fleet images
  useEffect(() => {
    const fetchFleetImages = async () => {
      try {
        const response = await apiService.read('/api/admin/fleet');
        const fleetData = response;
        
        // Get first image of each type
        const yachtImage = fleetData.find((item: any) => item.type === 'yacht')?.image_url;
        const aviationImage = fleetData.find((item: any) => item.type === 'helicopter')?.image_url;
        const vehicleImage = fleetData.find((item: any) => item.type === 'luxury-car')?.image_url;

        setFleetImages({
          yacht: yachtImage || SERVICES.YACHT.main,
          aviation: aviationImage || SERVICES.AVIATION.main,
          vehicle: vehicleImage || SERVICES.VEHICLE.main
        });
      } catch (error) {
        console.error('Error fetching fleet images:', error);
      }
    };

    fetchFleetImages();
  }, []);

  const services = [
    {
      id: 'yacht-1',
      title: 'Luxury Yachts',
      description: 'Experience Dubai\'s coastline in unparalleled luxury',
      image: fleetImages.yacht,
      path: '/yacht-charters',
      price: 'From AED 5,000',
      availability: {
        nextAvailable: 'Tomorrow',
        slots: 3,
      },
      features: [
        'Premium Fleet',
        'Expert Crew',
        'Catering Options',
        'Water Activities'
      ],
      highlights: [
        'Access to exclusive marinas',
        'Personalized itineraries',
        'Luxury amenities onboard',
        'Professional photography service'
      ],
      benefits: [
        { icon: Users, text: 'Perfect for groups up to 12' },
        { icon: Clock, text: 'Flexible booking hours' },
        { icon: Shield, text: 'Full insurance coverage' },
        { icon: Award, text: 'Award-winning service' }
      ],
      testimonials: [
        {
          name: 'Sarah M.',
          rating: 5,
          text: 'An unforgettable experience with impeccable service!',
          image: '/testimonials/sarah.jpg'
        },
        {
          name: 'James R.',
          rating: 5,
          text: 'The yacht was absolutely stunning. Worth every dirham!',
          image: '/testimonials/james.jpg'
        }
      ],
      virtualTour: SERVICES.YACHT.virtualTour,
    },
    {
      id: 'aviation-1',
      title: 'Private Aviation',
      description: 'Elevate your journey with exclusive private flights',
      image: fleetImages.aviation,
      path: '/private-aviation',
      price: 'From AED 15,000',
      availability: {
        nextAvailable: 'Today',
        slots: 2,
      },
      features: [
        'Private Jets',
        'Helicopters',
        'Global Access',
        'VIP Service'
      ],
      highlights: [
        'Direct terminal access',
        'Custom flight routes',
        'Luxury ground transport',
        'In-flight catering'
      ],
      benefits: [
        { icon: Users, text: 'Private cabin experience' },
        { icon: Clock, text: 'No waiting times' },
        { icon: Shield, text: 'Enhanced privacy' },
        { icon: Award, text: 'Premium concierge' }
      ],
      testimonials: [
        {
          name: 'Michael B.',
          rating: 5,
          text: 'The epitome of luxury travel. Exceptional service!',
          image: '/testimonials/michael.jpg'
        },
        {
          name: 'Emma L.',
          rating: 5,
          text: 'Made our special day even more memorable.',
          image: '/testimonials/emma.jpg'
        }
      ],
      virtualTour: SERVICES.AVIATION.virtualTour,
    },
    {
      id: 'vehicle-1',
      title: 'Premium Vehicles',
      description: 'Drive the finest automobiles in the city',
      image: fleetImages.vehicle,
      path: '/vehicles',
      price: 'From AED 1,000',
      availability: {
        nextAvailable: 'Today',
        slots: 5,
      },
      features: [
        'Luxury Cars',
        'Chauffeur Service',
        'City Tours',
        'Special Events'
      ],
      highlights: [
        'Latest model vehicles',
        'Professional drivers',
        'Door-to-door service',
        'Special event packages'
      ],
      benefits: [
        { icon: Users, text: 'Luxury for any occasion' },
        { icon: Clock, text: '24/7 availability' },
        { icon: Shield, text: 'Comprehensive insurance' },
        { icon: Award, text: 'VIP treatment' }
      ],
      testimonials: [
        {
          name: 'David K.',
          rating: 5,
          text: 'The fleet selection is outstanding. Great service!',
          image: '/testimonials/david.jpg'
        },
        {
          name: 'Sophie T.',
          rating: 5,
          text: 'Made our Dubai experience truly luxurious.',
          image: '/testimonials/sophie.jpg'
        }
      ],
      virtualTour: SERVICES.VEHICLE.virtualTour,
    },
  ];

  const experiences = [
    {
      title: 'Sunset Yacht Party',
      image: EXPERIENCES.YACHT_PARTY.image,
      price: 'From AED 5,000',
      virtualTour: EXPERIENCES.YACHT_PARTY.virtualTour,
    },
    {
      title: 'Desert Aviation Tour',
      image: EXPERIENCES.DESERT_AVIATION.image,
      price: 'From AED 8,000',
      virtualTour: EXPERIENCES.DESERT_AVIATION.virtualTour,
    },
    {
      title: 'City Luxury Drive',
      image: EXPERIENCES.CITY_DRIVE.image,
      price: 'From AED 2,000',
      virtualTour: EXPERIENCES.CITY_DRIVE.virtualTour,
    },
  ];

  // Preload images for better performance
  useEffect(() => {
    const preloadImages = () => {
      const imageUrls = [
        ...services.map(service => service.image),
        ...experiences.map(exp => exp.image),
      ];

      imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
      });
    };

    preloadImages();
  }, []);

  // Services Section
  const ServiceCard = ({ service, index }) => (
    <motion.div
      key={service.id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group bg-black/40 backdrop-blur-sm rounded-lg overflow-hidden hover:bg-black/60 transition-all duration-300"
    >
      <div className="aspect-[16/9] relative overflow-hidden">
        <img
          src={service.image}
          alt={service.title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-black/60 transition-opacity"
        >
          <button
            onClick={() => window.open(service.virtualTour, '_blank')}
            className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
          >
            Virtual Tour
          </button>
        </motion.div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-bold">{service.title}</h3>
          <span className="text-xl font-bold text-amber-500">{service.price}</span>
        </div>
        
        <p className="text-gray-300 mb-6">{service.description}</p>

        <div className="space-y-6">
          {/* Highlights */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Highlights</h4>
            <div className="grid grid-cols-2 gap-3">
              {service.highlights.map((highlight, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-gray-300">{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Benefits</h4>
            <div className="grid grid-cols-2 gap-4">
              {service.benefits.map((benefit, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <benefit.icon className="w-5 h-5 text-amber-500" />
                  <span className="text-sm text-gray-300">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="relative">
            <h4 className="text-lg font-semibold mb-3">What Clients Say</h4>
            <AnimatePresence mode="wait">
              {service.testimonials.map((testimonial, i) => (
                i === activeTestimonial && (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-black/30 p-4 rounded-lg"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">{testimonial.name}</p>
                        <div className="flex">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-amber-500 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 italic">{testimonial.text}</p>
                  </motion.div>
                )
              ))}
            </AnimatePresence>
            <div className="flex justify-center space-x-2 mt-3">
              {service.testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  aria-label={`View testimonial ${i + 1}`}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === activeTestimonial ? 'bg-amber-500' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex justify-between items-center text-sm text-gray-400">
            <span>{service.availability.slots} slots available</span>
            <span>Next available: {service.availability.nextAvailable}</span>
          </div>
          
          <Link
            to={service.path}
            className="flex items-center justify-between w-full bg-white text-black px-6 py-3 rounded-lg group-hover:bg-opacity-90 transition-colors"
          >
            <span className="font-medium">Explore {service.title}</span>
            <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="bg-black min-h-screen text-white">
      <div ref={containerRef} className="relative min-h-screen">
        <VideoBackground
          videoUrl={VIDEOS.HERO.url}
          posterImage={SERVICES.YACHT.main}
          overlayOpacity={0.5}
        />
        
        <div className="relative min-h-screen">
          <Navbar />
          
          <motion.div
            style={{ y, opacity }}
            className="h-screen flex flex-col items-center justify-center text-center px-4"
          >
            <WeatherDisplay position="absolute" className="top-8 right-8" />
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-lg"
            >
              Dubai Luxury
              <span className="block text-2xl md:text-3xl font-light mt-2">
                Experience Extraordinary
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl mb-8 max-w-2xl drop-shadow"
            >
              Discover unparalleled luxury experiences in Dubai
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex space-x-6"
            >
              <Link
                to="/booking"
                className="bg-white text-black px-8 py-3 rounded-lg text-lg font-medium hover:bg-opacity-90 transition-colors"
              >
                Book Now
              </Link>
              <a
                href="#services"
                className="flex items-center space-x-2 px-6 py-3 border-2 border-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <Play className="w-5 h-5" />
                <span>Explore Services</span>
              </a>
            </motion.div>
          </motion.div>
          
          {/* Media Attribution */}
          <div className="absolute bottom-8 right-8">
            <MediaAttribution />
          </div>
          
          <button
            onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce"
            aria-label="Scroll to services section"
          >
            <ChevronDown className="w-8 h-8" />
          </button>
        </div>
      </div>

      {/* Services Section */}
      <section id="services" className="py-24 px-4 bg-gradient-to-b from-black via-black/95 to-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Our Premium Services</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Experience luxury redefined through our carefully curated selection of premium services
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg transition-colors"
            >
              {showComparison ? 'Hide Comparison' : 'Compare Services'}
            </button>
          </motion.div>

          <AnimatePresence>
            {showComparison && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-8 overflow-hidden"
              >
                <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-left">
                      <h3 className="font-semibold mb-4">Features</h3>
                      <div className="space-y-4">
                        <p>Starting Price</p>
                        <p>Max Capacity</p>
                        <p>Booking Notice</p>
                        <p>Duration Options</p>
                        <p>Cancellation Policy</p>
                      </div>
                    </div>
                    {services.map(service => (
                      <div key={service.id} className="text-left">
                        <h3 className="font-semibold mb-4">{service.title}</h3>
                        <div className="space-y-4">
                          <p>{service.price}</p>
                          <p>{service.id === 'yacht-1' ? '12 persons' : service.id === 'aviation-1' ? '8 persons' : '4 persons'}</p>
                          <p>{service.id === 'yacht-1' ? '24 hours' : service.id === 'aviation-1' ? '48 hours' : '2 hours'}</p>
                          <p>{service.id === 'yacht-1' ? '4-8 hours' : service.id === 'aviation-1' ? 'Custom' : '1-24 hours'}</p>
                          <p>{service.id === 'yacht-1' ? '48h notice' : service.id === 'aviation-1' ? '72h notice' : '24h notice'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Price Calculator */}
      <section className="py-24 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-black/60 backdrop-blur-sm rounded-lg p-8 border border-white/10"
          >
            <h2 className="text-4xl font-bold text-center mb-8 text-white drop-shadow-lg">Calculate Your Experience</h2>
            <p className="text-center text-gray-300 mb-12 text-lg">
              Get an instant estimate for your luxury experience
            </p>
            
            <div className="grid grid-cols-3 gap-4 mb-12">
              {(['yacht', 'aviation', 'vehicle'] as const).map((type) => (
                <motion.button
                  key={type}
                  onClick={() => setSelectedService(type)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-6 rounded-lg text-center transition-all ${
                    selectedService === type
                      ? 'bg-white text-black shadow-lg'
                      : 'bg-black/50 text-white hover:bg-black/70 border border-white/20'
                  }`}
                  aria-label={`Select ${type} service`}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <span className="text-lg font-semibold">
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </span>
                    <span className="text-sm opacity-70">
                      {type === 'yacht' ? 'From AED 5,000'
                        : type === 'aviation' ? 'From AED 15,000'
                        : 'From AED 1,000'}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="bg-white/5 rounded-lg p-6 backdrop-blur-sm border border-white/10">
              <PriceCalculator
                serviceType={selectedService}
                basePrice={selectedService === 'yacht' ? 5000 
                  : selectedService === 'aviation' ? 15000 
                  : 1000}
                currency="AED"
              />
            </div>

            <div className="mt-8 text-center">
              <Link
                to={`/booking?service=${selectedService}`}
                className="inline-flex items-center bg-white text-black px-8 py-3 rounded-lg text-lg font-medium hover:bg-opacity-90 transition-colors"
              >
                Book {selectedService.charAt(0).toUpperCase() + selectedService.slice(1)} Service
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Experience Gallery */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-16 text-white drop-shadow-lg"
          >
            Featured Experiences
          </motion.h2>
          <ExperienceGallery experiences={experiences} />
        </div>
      </section>

      {/* Quick Booking Widget */}
      <div className="fixed bottom-8 right-8 flex space-x-4 z-50">
        <Link
          to="/booking"
          className="bg-white text-black p-4 rounded-full shadow-lg hover:bg-opacity-90 transition-colors"
          aria-label="Quick booking"
        >
          <Calendar className="w-6 h-6" />
        </Link>
        <Link
          to="/contact"
          className="bg-white text-black p-4 rounded-full shadow-lg hover:bg-opacity-90 transition-colors"
          aria-label="Contact us"
        >
          <MessageCircle className="w-6 h-6" />
        </Link>
      </div>

      {/* Scroll to Services Button */}
      <button
        onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce"
        aria-label="Scroll to services section"
      >
        <ChevronDown className="w-8 h-8" />
      </button>
    </div>
  );
};

export default LandingPage; 