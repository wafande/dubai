import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';
import { MEDIA_ATTRIBUTION } from '../constants/mediaAttribution';

interface MediaAttributionProps {
  className?: string;
}

const MediaAttribution = ({ className = '' }: MediaAttributionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-black/20 hover:bg-black/40 backdrop-blur-sm p-2 rounded-full transition-colors"
        aria-label="Show media credits"
      >
        <Info className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full right-0 mb-2 w-72 bg-black/90 backdrop-blur-sm rounded-lg p-4 text-sm"
          >
            <h3 className="font-bold mb-3">Media Credits</h3>
            
            {/* Video Credits */}
            <div className="mb-4">
              <h4 className="text-gray-400 mb-2">Videos</h4>
              <div className="space-y-2">
                {Object.entries(MEDIA_ATTRIBUTION.VIDEOS).map(([key, credit]) => (
                  <div key={key}>
                    <p className="font-medium">{key}</p>
                    <p className="text-gray-400 text-xs">
                      By{' '}
                      <a
                        href={credit.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        {credit.author}
                      </a>
                      {' '}on {credit.source}
                    </p>
                    <p className="text-gray-500 text-xs">{credit.license}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Image Credits */}
            <div>
              <h4 className="text-gray-400 mb-2">Images</h4>
              <div className="space-y-2">
                {Object.entries(MEDIA_ATTRIBUTION.IMAGES).map(([key, credit]) => (
                  <div key={key}>
                    <p className="font-medium">{key}</p>
                    <p className="text-gray-400 text-xs">
                      By{' '}
                      <a
                        href={credit.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        {credit.author}
                      </a>
                      {' '}on {credit.source}
                    </p>
                    <p className="text-gray-500 text-xs">{credit.license}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MediaAttribution; 