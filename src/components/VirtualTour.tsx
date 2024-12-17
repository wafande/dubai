import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface VirtualTourProps {
  tourUrl: string;
  title: string;
  onClose: () => void;
}

const VirtualTour = ({ tourUrl, title, onClose }: VirtualTourProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Lock body scroll when tour is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
    >
      <div className="relative w-full h-full max-w-7xl mx-auto p-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="h-full flex flex-col">
          <h2 className="text-2xl font-bold mb-4">{title} - Virtual Tour</h2>
          <div className="flex-1 relative rounded-lg overflow-hidden">
            <iframe
              ref={iframeRef}
              src={tourUrl}
              title={`${title} Virtual Tour`}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>

          {/* Tour Controls */}
          <div className="mt-4 flex justify-center space-x-4">
            <button
              onClick={() => {
                if (iframeRef.current) {
                  iframeRef.current.contentWindow?.postMessage('rotate_left', '*');
                }
              }}
              className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              Rotate Left
            </button>
            <button
              onClick={() => {
                if (iframeRef.current) {
                  iframeRef.current.contentWindow?.postMessage('rotate_right', '*');
                }
              }}
              className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              Rotate Right
            </button>
            <button
              onClick={() => {
                if (iframeRef.current) {
                  iframeRef.current.contentWindow?.postMessage('zoom_in', '*');
                }
              }}
              className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              Zoom In
            </button>
            <button
              onClick={() => {
                if (iframeRef.current) {
                  iframeRef.current.contentWindow?.postMessage('zoom_out', '*');
                }
              }}
              className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              Zoom Out
            </button>
          </div>

          {/* Tour Instructions */}
          <div className="mt-4 text-center text-sm text-gray-400">
            Use your mouse or touch to look around. Click and drag to rotate.
            Use the scroll wheel or pinch to zoom.
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VirtualTour; 