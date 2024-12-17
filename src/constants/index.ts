export * from './mediaAssets';
export * from './imageParams';
export * from './mediaAttribution';

// Preload list for optimal performance
import { SERVICES, EXPERIENCES } from './mediaAssets';
import { IMAGE_PARAMS } from './imageParams';

export const PRELOAD_IMAGES = [
  `${SERVICES.YACHT.main}${IMAGE_PARAMS.QUALITY.MEDIUM.params}`,
  `${SERVICES.AVIATION.main}${IMAGE_PARAMS.QUALITY.MEDIUM.params}`,
  `${SERVICES.VEHICLE.main}${IMAGE_PARAMS.QUALITY.MEDIUM.params}`,
  `${EXPERIENCES.YACHT_PARTY.thumbnail}${IMAGE_PARAMS.QUALITY.THUMBNAIL.params}`,
  `${EXPERIENCES.DESERT_AVIATION.thumbnail}${IMAGE_PARAMS.QUALITY.THUMBNAIL.params}`,
  `${EXPERIENCES.CITY_DRIVE.thumbnail}${IMAGE_PARAMS.QUALITY.THUMBNAIL.params}`,
]; 