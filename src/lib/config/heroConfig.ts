// src/lib/config/heroConfig.ts
// Centralized configuration for Hero section content and settings

export interface HeroContentConfig {
  headline: string;
  subheadline: string;
  primaryCTA: {
    label: string;
    href: string;
    variant: "primary" | "secondary";
    ariaLabel?: string;
  };
  secondaryCTA: {
    label: string;
    href: string;
    variant: "primary" | "secondary";
    ariaLabel?: string;
  };
}

export const heroContentConfig: HeroContentConfig = {
  headline: "Build the Future with AI-Powered Solutions",
  subheadline:
    "Transform your business with cutting-edge artificial intelligence and machine learning technologies that drive innovation and accelerate growth.",
  primaryCTA: {
    label: "Get Started",
    href: "/get-started",
    variant: "primary",
    ariaLabel: "Get started with AI solutions",
  },
  secondaryCTA: {
    label: "View Demo",
    href: "/demo",
    variant: "secondary",
    ariaLabel: "View product demonstration",
  },
};

export const HERO_PARTICLE_CONFIG = {
  desktopCount: 500,
  mobileCount: 250,
  mediumCount: 350,
  spawnRadius: 2.0,
  initialSpeed: 0.2,
  damping: 0.985,
  lifetimeRange: [2, 5] as [number, number],
  baseColor: "#ffffff",
  pointSize: 3,
  noiseStrength: 0.15,
  attractionStrength: 0.25,
} as const;

export const HERO_ANIMATION_CONFIG = {
  containerStagger: 0.08,
  delayChildren: 0.1,
  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
  durationShort: 0.4,
  durationMedium: 0.5,
  durationLong: 0.75,
} as const;

export const HERO_BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export type HeroParticleConfig = typeof HERO_PARTICLE_CONFIG;
export type HeroAnimationConfig = typeof HERO_ANIMATION_CONFIG;
export type HeroBreakpoints = typeof HERO_BREAKPOINTS;
