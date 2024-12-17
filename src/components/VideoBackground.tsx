import { useRef, useEffect, useState } from 'react';

interface VideoBackgroundProps {
  videoUrl: string;
  posterImage: string;
  overlayOpacity?: number;
  children?: React.ReactNode;
  className?: string;
}

const VideoBackground: React.FC<VideoBackgroundProps> = ({
  videoUrl,
  posterImage,
  overlayOpacity = 0.5,
  children,
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadStart = () => {
      setIsLoading(true);
      setHasError(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      playVideo();
    };

    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
      console.error('Video loading error');
    };

    const playVideo = async () => {
      try {
        // Set playback rate to 1 to ensure normal speed
        video.playbackRate = 1.0;
        // Ensure video properties are set
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        await video.play();
        console.log('Video playing');
      } catch (error) {
        console.error('Video play error:', error);
        setHasError(true);
      }
    };

    // Add event listeners
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    // Cleanup
    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <div className={`fixed inset-0 -z-1 ${className}`}>
      {/* Poster image as fallback */}
      <div className="absolute inset-0">
        <img
          src={posterImage}
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className={`absolute inset-0 w-full h-full object-cover ${
          isLoading || hasError ? 'opacity-0' : 'opacity-100'
        } transition-opacity duration-1000`}
      >
        <source src={videoUrl} type="video/mp4" />
      </video>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black pointer-events-none"
        style={{ opacity: overlayOpacity }}
      />

      {children}
    </div>
  );
};

export default VideoBackground; 