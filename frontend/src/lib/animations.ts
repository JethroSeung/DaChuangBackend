import { Variants, Transition } from 'framer-motion'

// Animation durations
export const ANIMATION_DURATION = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  page: 0.4,
  modal: 0.3,
  hover: 0.2,
} as const

// Easing functions
export const EASING = {
  easeOut: [0.0, 0.0, 0.2, 1],
  easeIn: [0.4, 0.0, 1, 1],
  easeInOut: [0.4, 0.0, 0.2, 1],
  spring: { type: 'spring', damping: 25, stiffness: 300 },
  springBouncy: { type: 'spring', damping: 15, stiffness: 400 },
} as const

// Common transitions
export const transitions: Record<string, Transition> = {
  default: {
    duration: ANIMATION_DURATION.normal,
    ease: EASING.easeOut,
  },
  fast: {
    duration: ANIMATION_DURATION.fast,
    ease: EASING.easeOut,
  },
  slow: {
    duration: ANIMATION_DURATION.slow,
    ease: EASING.easeOut,
  },
  spring: EASING.spring,
  springBouncy: EASING.springBouncy,
}

// Page transition variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATION.page,
      ease: EASING.easeOut,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: EASING.easeIn,
    },
  },
}

// Card animation variants
export const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transitions.default,
  },
  hover: {
    y: -2,
    scale: 1.02,
    transition: transitions.fast,
  },
  tap: {
    scale: 0.98,
    transition: transitions.fast,
  },
}

// Stagger container variants
export const staggerContainer: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

// Stagger item variants
export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.default,
  },
}

// Modal/Dialog variants
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATION.modal,
      ease: EASING.easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: EASING.easeIn,
    },
  },
}

// Sidebar variants
export const sidebarVariants: Variants = {
  collapsed: {
    width: 64,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: EASING.easeInOut,
    },
  },
  expanded: {
    width: 256,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: EASING.easeInOut,
    },
  },
}

// Button hover variants
export const buttonVariants: Variants = {
  rest: {
    scale: 1,
  },
  hover: {
    scale: 1.05,
    transition: transitions.fast,
  },
  tap: {
    scale: 0.95,
    transition: transitions.fast,
  },
}

// Loading spinner variants
export const spinnerVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
}

// Fade variants
export const fadeVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: transitions.default,
  },
  exit: {
    opacity: 0,
    transition: transitions.fast,
  },
}

// Slide variants
export const slideVariants = {
  up: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: transitions.default },
    exit: { opacity: 0, y: -20, transition: transitions.fast },
  },
  down: {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: transitions.default },
    exit: { opacity: 0, y: 20, transition: transitions.fast },
  },
  left: {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: transitions.default },
    exit: { opacity: 0, x: -20, transition: transitions.fast },
  },
  right: {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: transitions.default },
    exit: { opacity: 0, x: 20, transition: transitions.fast },
  },
}

// Alert/notification variants
export const alertVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 100,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATION.normal,
      ease: EASING.easeOut,
    },
  },
  exit: {
    opacity: 0,
    x: 100,
    scale: 0.95,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: EASING.easeIn,
    },
  },
}

// Map marker variants
export const markerVariants: Variants = {
  hidden: {
    scale: 0,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: transitions.springBouncy,
  },
  hover: {
    scale: 1.2,
    transition: transitions.fast,
  },
  selected: {
    scale: 1.3,
    transition: transitions.spring,
  },
}

// Utility function to check if user prefers reduced motion
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Utility function to get animation variants based on user preference
export const getAnimationVariants = (variants: Variants): Variants => {
  if (prefersReducedMotion()) {
    // Return simplified variants for reduced motion
    return Object.keys(variants).reduce((acc, key) => {
      acc[key] = { opacity: variants[key]?.opacity || 1 }
      return acc
    }, {} as Variants)
  }
  return variants
}

// Utility function to get transition based on user preference
export const getTransition = (transition: Transition): Transition => {
  if (prefersReducedMotion()) {
    return { duration: 0.01 }
  }
  return transition
}
