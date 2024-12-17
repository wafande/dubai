import type { VehicleType } from '../types';

export interface RouteConfig {
  path: string;
  label: string;
  icon?: string;
}

export interface BookingRouteParams {
  vehicleType: VehicleType;
  step?: 'details' | 'datetime' | 'extras' | 'payment' | 'confirmation';
}

export const routes = {
  home: '/',
  about: '/about',
  contact: '/contact',
  
  // Vehicle type routes
  helicopter: '/helicopter',
  yacht: '/yacht',
  luxuryCar: '/luxury-car',
  privateJet: '/private-jet',

  // Booking routes
  booking: {
    base: '/booking',
    vehicle: (type: VehicleType) => `/booking/${type}`,
    step: (type: VehicleType, step: BookingRouteParams['step']) => 
      `/booking/${type}/${step}`,
  },

  // Account routes
  account: {
    base: '/account',
    bookings: '/account/bookings',
    profile: '/account/profile',
    settings: '/account/settings',
  },

  // Admin routes
  admin: {
    base: '/admin',
    dashboard: '/admin/dashboard',
    bookings: '/admin/bookings',
    fleet: '/admin/fleet',
    analytics: '/admin/analytics',
    settings: '/admin/settings',
  }
} as const;

export const navigationLinks = [
  {
    path: routes.helicopter,
    label: 'Helicopter Tours',
    icon: 'helicopter'
  },
  {
    path: routes.yacht,
    label: 'Yacht Charters',
    icon: 'yacht'
  },
  {
    path: routes.luxuryCar,
    label: 'Luxury Cars',
    icon: 'car'
  },
  {
    path: routes.privateJet,
    label: 'Private Jets',
    icon: 'plane'
  }
] as const;

export const getBookingPath = (params: BookingRouteParams): string => {
  const { vehicleType, step } = params;
  return step ? routes.booking.step(vehicleType, step) : routes.booking.vehicle(vehicleType);
}; 