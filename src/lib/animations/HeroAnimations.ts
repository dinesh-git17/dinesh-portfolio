// src/lib/animations/HeroAnimations.ts
// Phase 4: Complete animation system with advanced motion effects and performance optimization

import { Transition, Variants } from "framer-motion";

// Enhanced easing curves for natural motion
export const EASING = {
  easeOutCubic: [0.16, 1, 0.3, 1] as [number, number, number, number],
  easeOutQuart: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
  easeOutQuint: [0.22, 1, 0.36, 1] as [number, number, number, number],
  easeOutExpo: [0.19, 1, 0.22, 1] as [number, number, number, number],
  easeInOutCubic: [0.65, 0, 0.35, 1] as [number, number, number, number],
  elastic: [0.175, 0.885, 0.32, 1.275] as [number, number, number, number],
} as const;

// Animation durations for consistency
export const DURATION = {
  fast: 0.3,
  medium: 0.5,
  slow: 0.8,
  hero: 1.2,
} as const;

// Stagger timing for sequential animations
export const STAGGER = {
  tight: 0.05,
  normal: 0.08,
  loose: 0.12,
  dramatic: 0.2,
} as const;

// Main hero container animation
export const heroContainerVariants: Variants = {
  initial: {
    opacity: 0,
    y: 40,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.hero,
      ease: EASING.easeOutCubic,
      staggerChildren: STAGGER.normal,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: DURATION.medium,
      ease: EASING.easeInOutCubic,
    },
  },
};

// Individual hero item animations
export const heroItemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: DURATION.slow,
      ease: EASING.easeOutQuart,
    },
  },
  exit: {
    opacity: 0,
    y: -15,
    scale: 0.98,
    transition: {
      duration: DURATION.fast,
      ease: EASING.easeInOutCubic,
    },
  },
};

// Enhanced fade in up animation with elastic effect
export const fadeInUp: Variants = {
  initial: {
    opacity: 0,
    y: 50,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: DURATION.medium,
      ease: EASING.easeOutQuint,
    },
  },
  exit: {
    opacity: 0,
    y: -25,
    scale: 0.95,
    transition: {
      duration: DURATION.fast,
      ease: EASING.easeInOutCubic,
    },
  },
};

// Slide in from left with bounce
export const slideInLeft: Variants = {
  initial: {
    opacity: 0,
    x: -100,
    scale: 0.8,
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: DURATION.slow,
      ease: EASING.elastic,
    },
  },
  exit: {
    opacity: 0,
    x: -50,
    scale: 0.9,
    transition: {
      duration: DURATION.medium,
      ease: EASING.easeInOutCubic,
    },
  },
};

// Slide in from right with bounce
export const slideInRight: Variants = {
  initial: {
    opacity: 0,
    x: 100,
    scale: 0.8,
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: DURATION.slow,
      ease: EASING.elastic,
    },
  },
  exit: {
    opacity: 0,
    x: 50,
    scale: 0.9,
    transition: {
      duration: DURATION.medium,
      ease: EASING.easeInOutCubic,
    },
  },
};

// CTA button group container
export const ctaGroupVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.medium,
      ease: EASING.easeOutCubic,
      staggerChildren: STAGGER.tight,
      delayChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: DURATION.fast,
      ease: EASING.easeInOutCubic,
      staggerChildren: STAGGER.tight,
      staggerDirection: -1,
    },
  },
};

// Individual CTA button animations
export const ctaItemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 30,
    scale: 0.8,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: DURATION.medium,
      ease: EASING.easeOutQuart,
    },
  },
  exit: {
    opacity: 0,
    y: -15,
    scale: 0.9,
    transition: {
      duration: DURATION.fast,
      ease: EASING.easeInOutCubic,
    },
  },
  hover: {
    scale: 1.05,
    y: -3,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
      mass: 0.8,
    },
  },
  tap: {
    scale: 0.98,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 600,
      damping: 30,
    },
  },
};

// Text stagger animation for word-by-word reveals
export const textStaggerVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: STAGGER.normal,
      delayChildren: 0.3,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: STAGGER.tight,
      staggerDirection: -1,
    },
  },
};

// Individual word animation variants
export const wordVariants: Variants = {
  initial: {
    opacity: 0,
    y: 40,
    rotateX: 90,
  },
  animate: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: DURATION.slow,
      ease: EASING.easeOutQuart,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    rotateX: -45,
    transition: {
      duration: DURATION.fast,
      ease: EASING.easeInOutCubic,
    },
  },
};

// Letter-by-letter animation for dramatic effect
export const letterVariants: Variants = {
  initial: {
    opacity: 0,
    y: 50,
    scale: 0.3,
    rotateZ: 180,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateZ: 0,
    transition: {
      duration: DURATION.medium,
      ease: EASING.elastic,
    },
  },
  exit: {
    opacity: 0,
    y: -25,
    scale: 0.8,
    rotateZ: -90,
    transition: {
      duration: DURATION.fast,
      ease: EASING.easeInOutCubic,
    },
  },
};

// Floating animation for background elements
export const floatingVariants: Variants = {
  initial: {
    y: 0,
    rotate: 0,
  },
  animate: {
    y: [-10, 10, -10],
    rotate: [-2, 2, -2],
    transition: {
      duration: 6,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "reverse",
    },
  },
};

// Pulsing glow effect for accent elements
export const glowVariants: Variants = {
  initial: {
    scale: 1,
    opacity: 0.8,
  },
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "reverse",
    },
  },
};

// Magnetic hover effect for interactive elements
export const magneticVariants: Variants = {
  initial: {
    x: 0,
    y: 0,
    scale: 1,
  },
  hover: {
    scale: 1.1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
};

// Stagger configuration presets
export const staggerChildrenConfig: Transition = {
  staggerChildren: STAGGER.normal,
  delayChildren: 0.1,
};

export const staggerChildrenConfigSlow: Transition = {
  staggerChildren: STAGGER.loose,
  delayChildren: 0.2,
};

export const staggerChildrenConfigFast: Transition = {
  staggerChildren: STAGGER.tight,
  delayChildren: 0.05,
};

// Utility function to get motion configuration based on reduced motion preference
export const getMotionConfig = (reducedMotion?: boolean) => {
  if (reducedMotion) {
    return {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      exit: { opacity: 1 },
      transition: { duration: 0 },
    };
  }

  return {
    variants: heroContainerVariants,
    initial: "initial",
    animate: "animate",
    exit: "exit",
  };
};

// Responsive animation configuration
export const getResponsiveMotionConfig = (
  isMobile: boolean,
  reducedMotion?: boolean
) => {
  if (reducedMotion) {
    return getMotionConfig(true);
  }

  const mobileConfig = {
    variants: {
      initial: { opacity: 0, y: 20 },
      animate: {
        opacity: 1,
        y: 0,
        transition: {
          duration: DURATION.medium,
          ease: EASING.easeOutCubic,
        },
      },
    },
    initial: "initial",
    animate: "animate",
  };

  return isMobile ? mobileConfig : getMotionConfig(false);
};

// Performance-optimized animation variants for low-end devices
export const lowPerformanceVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: DURATION.fast,
      ease: "linear",
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: DURATION.fast,
      ease: "linear",
    },
  },
};
