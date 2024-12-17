import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';

interface Service {
  id: string;
  title: string;
  description: string;
  image: string;
  path: string;
  price: string;
  availability: {
    nextAvailable: string;
    slots: number;
  };
}

interface ServiceCarousel3DProps {
  services: Service[];
}

const ServiceCarousel3D = ({ services }: ServiceCarousel3DProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.5,
      rotateY: direction > 0 ? 45 : -45,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.5,
      rotateY: direction < 0 ? 45 : -45,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => (prevIndex + newDirection + services.length) % services.length);
  };

  useEffect(() => {
    if (!isHovered) {
      const timer = setInterval(() => paginate(1), 5000);
      return () => clearInterval(timer);
    }
  }, [isHovered, services.length]);

  const currentService = services[currentIndex];

  return (
    <div className="relative h-[600px] w-full overflow-hidden bg-gray-900 rounded-xl"
         onMouseEnter={() => setIsHovered(true)}
         onMouseLeave={() => setIsHovered(false)}>
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
            rotateY: { duration: 0.4 },
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x);
            if (swipe < -swipeConfidenceThreshold) {
              paginate(1);
            } else if (swipe > swipeConfidenceThreshold) {
              paginate(-1);
            }
          }}
          className="absolute inset-0"
        >
          <div className="relative h-full">
            <img
              src={currentService.image}
              alt={currentService.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <h3 className="text-3xl font-bold mb-4">{currentService.title}</h3>
              <p className="text-lg text-gray-300 mb-6">{currentService.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">Next Available</span>
                  </div>
                  <p className="text-lg font-semibold">{currentService.availability.nextAvailable}</p>
                </div>
                <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Clock className="w-5 h-5 mr-2" />
                    <span className="text-sm font-medium">Available Slots</span>
                  </div>
                  <p className="text-lg font-semibold">{currentService.availability.slots} slots</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{currentService.price}</span>
                <div className="flex space-x-4">
                  <Link
                    to={currentService.path}
                    className="bg-white text-black px-6 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
                  >
                    View Details
                  </Link>
                  <Link
                    to={`/booking?service=${currentService.id}`}
                    className="bg-white/10 backdrop-blur-sm px-6 py-2 rounded-lg font-medium hover:bg-white/20 transition-colors"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
        onClick={() => paginate(-1)}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
        onClick={() => paginate(1)}
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {services.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-white w-4' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ServiceCarousel3D; 