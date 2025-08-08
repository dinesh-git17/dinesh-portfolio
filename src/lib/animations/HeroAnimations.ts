// src/lib/animations/HeroAnimations.ts
// Centralized animation variants and configuration for Hero section components

import { Transition, Variants } from "framer-motion";

export const heroContainerVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.08,
    },
  },
};

export const heroItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 15,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export const staggerChildrenConfig: Transition = {
  staggerChildren: 0.08,
  delayChildren: 0.1,
};

export const getMotionConfig = (reducedMotion?: boolean) =>
  reducedMotion
    ? {}
    : {
        variants: heroContainerVariants,
        initial: "hidden",
        animate: "visible",
      };
