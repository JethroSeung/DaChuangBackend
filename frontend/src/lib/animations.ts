import { Variants } from 'framer-motion'

// Page transition variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  },
}

// Sidebar animation variants
export const sidebarVariants: Variants = {
  expanded: {
    width: 256,
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
  collapsed: {
    width: 64,
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
}

// Stagger animation variants
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export const staggerItem: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
}

// Card animation variants
export const cardVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
    },
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
    },
  },
}

// Alert animation variants
export const alertVariants: Variants = {
  initial: {
    opacity: 0,
    x: 100,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    x: 100,
    transition: {
      duration: 0.2,
    },
  },
}

// Default transitions
export const transitions = {
  default: {
    duration: 0.3,
    ease: 'easeInOut',
  },
  fast: {
    duration: 0.15,
    ease: 'easeInOut',
  },
  slow: {
    duration: 0.5,
    ease: 'easeInOut',
  },
}

// Utility function to get animation variants based on user preference
export const getAnimationVariants = (variants: Variants): Variants => {
  if (prefersReducedMotion()) {
    // Return simplified variants for reduced motion
    return Object.keys(variants).reduce((acc, key) => {
      const variant = variants[key]
      if (typeof variant === 'object' && variant !== null) {
        acc[key] = { opacity: (variant as any).opacity || 1 }
      } else {
        acc[key] = { opacity: 1 }
      }
      return acc
    }, {} as Variants)
  }
  return variants
}

// Legacy function for backward compatibility
export function getAnimationVariantsByType(type: 'page' | 'sidebar' | 'card' | 'alert' | 'stagger'): Variants {
  switch (type) {
    case 'page':
      return pageVariants
    case 'sidebar':
      return sidebarVariants
    case 'card':
      return cardVariants
    case 'alert':
      return alertVariants
    case 'stagger':
      return staggerContainer
    default:
      return pageVariants
  }
}

// Check if user prefers reduced motion
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
