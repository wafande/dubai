import type { VehicleType } from '../types';

interface MediaAsset {
  video: string;
  image: string;
  thumbnail: string;
  alt: string;
}

interface VehicleMedia {
  hero: MediaAsset;
  gallery: MediaAsset[];
}

export const mediaConfig: Record<VehicleType, VehicleMedia> = {
  helicopter: {
    hero: {
      video: '/videos/helicopter-dubai.mp4',
      image: '/images/helicopter-dubai.jpg',
      thumbnail: '/images/helicopter-dubai-thumb.jpg',
      alt: 'Luxury helicopter tour over Dubai skyline'
    },
    gallery: [
      {
        video: '/videos/helicopter-tour-1.mp4',
        image: '/images/helicopter-tour-1.jpg',
        thumbnail: '/images/helicopter-tour-1-thumb.jpg',
        alt: 'Helicopter tour over Burj Khalifa'
      },
      {
        video: '/videos/helicopter-tour-2.mp4',
        image: '/images/helicopter-tour-2.jpg',
        thumbnail: '/images/helicopter-tour-2-thumb.jpg',
        alt: 'Aerial view of Palm Jumeirah'
      }
    ]
  },
  yacht: {
    hero: {
      video: '/videos/yacht-dubai.mp4',
      image: '/images/yacht-dubai.jpg',
      thumbnail: '/images/yacht-dubai-thumb.jpg',
      alt: 'Luxury yacht cruising Dubai Marina'
    },
    gallery: [
      {
        video: '/videos/yacht-tour-1.mp4',
        image: '/images/yacht-tour-1.jpg',
        thumbnail: '/images/yacht-tour-1-thumb.jpg',
        alt: 'Yacht interior luxury suite'
      },
      {
        video: '/videos/yacht-tour-2.mp4',
        image: '/images/yacht-tour-2.jpg',
        thumbnail: '/images/yacht-tour-2-thumb.jpg',
        alt: 'Yacht deck with Dubai skyline view'
      }
    ]
  },
  'luxury-car': {
    hero: {
      video: '/videos/luxury-car-dubai.mp4',
      image: '/images/luxury-car-dubai.jpg',
      thumbnail: '/images/luxury-car-dubai-thumb.jpg',
      alt: 'Luxury car collection in Dubai'
    },
    gallery: [
      {
        video: '/videos/car-tour-1.mp4',
        image: '/images/car-tour-1.jpg',
        thumbnail: '/images/car-tour-1-thumb.jpg',
        alt: 'Luxury car interior details'
      },
      {
        video: '/videos/car-tour-2.mp4',
        image: '/images/car-tour-2.jpg',
        thumbnail: '/images/car-tour-2-thumb.jpg',
        alt: 'Supercar lineup in Dubai'
      }
    ]
  },
  'private-jet': {
    hero: {
      video: '/videos/private-jet-dubai.mp4',
      image: '/images/private-jet-dubai.jpg',
      thumbnail: '/images/private-jet-dubai-thumb.jpg',
      alt: 'Private jet ready for departure'
    },
    gallery: [
      {
        video: '/videos/jet-tour-1.mp4',
        image: '/images/jet-tour-1.jpg',
        thumbnail: '/images/jet-tour-1-thumb.jpg',
        alt: 'Private jet luxury interior'
      },
      {
        video: '/videos/jet-tour-2.mp4',
        image: '/images/jet-tour-2.jpg',
        thumbnail: '/images/jet-tour-2-thumb.jpg',
        alt: 'Private jet dining experience'
      }
    ]
  }
};

export const getMediaAsset = (vehicleType: VehicleType, type: 'hero' | 'gallery' = 'hero'): MediaAsset => {
  return type === 'hero' 
    ? mediaConfig[vehicleType].hero 
    : mediaConfig[vehicleType].gallery[0];
};

export const getGalleryAssets = (vehicleType: VehicleType): MediaAsset[] => {
  return mediaConfig[vehicleType].gallery;
}; 