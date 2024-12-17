import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import MediaLoader from './MediaLoader';
import VirtualTour from './VirtualTour';

interface Experience {
  title: string;
  image: string;
  price: string;
  virtualTour: string;
}

interface ExperienceGalleryProps {
  experiences: Experience[];
}

const ExperienceGallery = ({ experiences }: ExperienceGalleryProps) => {
  const [selectedTour, setSelectedTour] = useState<Experience | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const handleImageLoad = (image: string) => {
    setLoadedImages(prev => new Set(prev).add(image));
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {experiences.map((experience, index) => (
          <motion.div
            key={experience.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="group relative rounded-lg overflow-hidden"
          >
            <MediaLoader
              src={experience.image}
              alt={experience.title}
              className="w-full h-64"
              onLoad={() => handleImageLoad(experience.image)}
            />
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: loadedImages.has(experience.image) ? 1 : 0 }}
              className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: loadedImages.has(experience.image) ? 1 : 0, y: 0 }}
              className="absolute bottom-0 left-0 right-0 p-6"
            >
              <h3 className="text-xl font-bold mb-2">{experience.title}</h3>
              <p className="text-sm text-gray-300 mb-4">{experience.price}</p>
              
              <div className="flex space-x-4">
                <Link
                  to={`/booking?experience=${encodeURIComponent(experience.title)}`}
                  className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors"
                >
                  Book Now
                </Link>
                <button
                  onClick={() => setSelectedTour(experience)}
                  className="bg-white/10 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
                >
                  Virtual Tour
                </button>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Virtual Tour Modal */}
      <AnimatePresence>
        {selectedTour && (
          <VirtualTour
            tourUrl={selectedTour.virtualTour}
            title={selectedTour.title}
            onClose={() => setSelectedTour(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ExperienceGallery; 