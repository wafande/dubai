// Image optimization parameters
export const IMAGE_PARAMS = {
  QUALITY: {
    HIGH: {
      width: 1920,
      quality: 90,
      format: 'webp',
      params: '?auto=compress&q=90&w=1920&fm=webp',
    },
    MEDIUM: {
      width: 1200,
      quality: 80,
      format: 'webp',
      params: '?auto=compress&q=80&w=1200&fm=webp',
    },
    LOW: {
      width: 800,
      quality: 70,
      format: 'webp',
      params: '?auto=compress&q=70&w=800&fm=webp',
    },
    THUMBNAIL: {
      width: 400,
      quality: 60,
      format: 'webp',
      params: '?auto=compress&q=60&w=400&fm=webp',
    },
  },
  EFFECTS: {
    BLUR: '&blur=200',
    GRAYSCALE: '&monochrome=true',
    SHARPEN: '&sharpen=100',
    BRIGHTNESS: {
      DARK: '&brightness=-20',
      LIGHT: '&brightness=20',
    },
    CONTRAST: {
      HIGH: '&contrast=20',
      LOW: '&contrast=-20',
    },
    SATURATION: {
      HIGH: '&saturation=20',
      LOW: '&saturation=-20',
    },
    SEPIA: '&sepia=80',
    TINT: {
      WARM: '&tint=255,200,150',
      COOL: '&tint=150,200,255',
      LUXURY: '&tint=255,215,0',
    },
    OVERLAY: {
      DARK: '&duotone=000000,000000&duotone-alpha=40',
      LIGHT: '&duotone=ffffff,ffffff&duotone-alpha=40',
      GOLD: '&duotone=ffd700,ffd700&duotone-alpha=30',
    },
    VIGNETTE: '&vignette=20',
    NOISE: '&noise=50',
    PIXELATE: '&pixelate=8',
    GRADIENT: {
      FADE_BOTTOM: '&mask=bottom',
      FADE_TOP: '&mask=top',
      RADIAL: '&mask=circle',
    },
  },
  RESPONSIVE: {
    sizes: {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536,
    },
    breakpoints: {
      sm: '(min-width: 640px)',
      md: '(min-width: 768px)',
      lg: '(min-width: 1024px)',
      xl: '(min-width: 1280px)',
      '2xl': '(min-width: 1536px)',
    },
  },
  ASPECT_RATIOS: {
    SQUARE: '&ar=1:1',
    PORTRAIT: '&ar=3:4',
    LANDSCAPE: '&ar=16:9',
    ULTRAWIDE: '&ar=21:9',
    BANNER: '&ar=5:2',
  },
  FOCAL_POINTS: {
    CENTER: '&fp-x=0.5&fp-y=0.5',
    TOP: '&fp-x=0.5&fp-y=0',
    BOTTOM: '&fp-x=0.5&fp-y=1',
    LEFT: '&fp-x=0&fp-y=0.5',
    RIGHT: '&fp-x=1&fp-y=0.5',
  },
  TRANSFORMS: {
    ROTATE: (degrees: number) => `&rot=${degrees}`,
    FLIP_H: '&flip=h',
    FLIP_V: '&flip=v',
    ZOOM: (factor: number) => `&zoom=${factor}`,
  },
  OPTIMIZATIONS: {
    LOSSLESS: '&lossless=true',
    PRESERVE_EXIF: '&preserve_exif=true',
    PROGRESSIVE: '&progressive=true',
    METADATA: '&metadata=true',
  },
}; 