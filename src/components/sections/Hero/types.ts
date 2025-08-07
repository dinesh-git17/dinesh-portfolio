// src/components/sections/Hero/types.ts
// TypeScript type definitions for Hero Section components and particle system

/**
 * Main Hero component props interface
 * Configures the entire hero section with content and visual settings
 */
export interface HeroProps {
  /** Primary heading text displayed prominently */
  title: string;
  /** Secondary descriptive text below the title */
  subtitle: string;
  /** Brief professional summary or tagline */
  description: string;
  /** Array of call-to-action buttons */
  ctas: CTA[];
  /** Configuration for the particle background system */
  particleConfig?: ParticleSystemConfig;
  /** Whether to enable reduced motion for accessibility */
  reducedMotion?: boolean;
  /** Custom CSS classes for styling overrides */
  className?: string;
}

/**
 * Call-to-action button configuration
 * Defines interactive buttons for user engagement
 */
export interface CTA {
  /** Button display text */
  label: string;
  /** Navigation URL or action identifier */
  href: string;
  /** Visual style variant */
  variant: CTAVariant;
  /** Whether link opens in new tab */
  external?: boolean;
  /** Accessibility label for screen readers */
  ariaLabel?: string;
  /** Optional icon identifier from Lucide React */
  icon?: string;
}

/**
 * Button style variants for consistent theming
 */
export type CTAVariant = "primary" | "secondary" | "outline" | "ghost";

/**
 * Props for the HeroContent text component
 * Handles typography and text animations
 */
export interface HeroContentProps {
  /** Main heading text */
  title: string;
  /** Subtitle text */
  subtitle: string;
  /** Description paragraph */
  description: string;
  /** Call-to-action buttons */
  ctas: CTA[];
  /** Animation delay in milliseconds */
  animationDelay?: number;
  /** Whether to use reduced motion */
  reducedMotion?: boolean;
}

/**
 * Configuration object for the WebGL particle system
 * Controls visual behavior and performance settings
 */
export interface ParticleSystemConfig {
  /** Total number of particles to render */
  particleCount: number;
  /** Particle movement speed multiplier */
  speed: number;
  /** Color palette for particles */
  colors: ParticleColor[];
  /** Mouse interaction sensitivity */
  interactionRadius: number;
  /** Performance optimization settings */
  performance: PerformanceConfig;
  /** Particle behavior categories */
  categories: ParticleCategory[];
}

/**
 * Performance optimization settings for particle system
 * Ensures smooth 60fps rendering across devices
 */
export interface PerformanceConfig {
  /** Target frames per second */
  targetFPS: number;
  /** Enable performance monitoring */
  enableProfiling: boolean;
  /** Automatically reduce particles on low-end devices */
  adaptiveQuality: boolean;
  /** Maximum render distance for particles */
  cullingDistance: number;
}

/**
 * Individual particle color definition
 * Maps technology categories to visual representations
 */
export interface ParticleColor {
  /** Hexadecimal color value */
  hex: string;
  /** Technology category this color represents */
  category: TechnologyCategory;
  /** Color opacity (0-1) */
  opacity: number;
  /** Whether this color glows or emits light */
  glow?: boolean;
}

/**
 * Particle behavior category configuration
 * Defines movement patterns and visual effects
 */
export interface ParticleCategory {
  /** Unique identifier for the category */
  id: string;
  /** Human-readable category name */
  name: string;
  /** Associated technology category */
  technology: TechnologyCategory;
  /** Movement behavior pattern */
  behavior: ParticleBehavior;
  /** Visual size multiplier */
  sizeMultiplier: number;
  /** Particle density in this category */
  density: number;
}

/**
 * Technology categories for particle system theming
 * Maps to different areas of technical expertise
 */
export type TechnologyCategory =
  | "frontend"
  | "backend"
  | "database"
  | "cloud"
  | "mobile"
  | "ai"
  | "devops"
  | "general";

/**
 * Particle movement behavior patterns
 * Defines how particles move and interact
 */
export type ParticleBehavior =
  | "float"
  | "orbit"
  | "wave"
  | "spiral"
  | "random"
  | "magnetic";

/**
 * Props for the ParticleSystem component
 * Configures the Three.js WebGL particle background
 */
export interface ParticleSystemProps {
  /** Particle system configuration */
  config: ParticleSystemConfig;
  /** Container width in pixels */
  width: number;
  /** Container height in pixels */
  height: number;
  /** Whether mouse interaction is enabled */
  interactive?: boolean;
  /** Performance optimization level */
  quality: QualityLevel;
  /** Callback fired when system is ready */
  onReady?: () => void;
}

/**
 * Rendering quality levels for performance optimization
 * Automatically selected based on device capabilities
 */
export type QualityLevel = "low" | "medium" | "high" | "ultra";

/**
 * Individual particle state interface
 * Represents a single particle in the system
 */
export interface Particle {
  /** Unique particle identifier */
  id: string;
  /** Current X position */
  x: number;
  /** Current Y position */
  y: number;
  /** Current Z position */
  z: number;
  /** Velocity vector */
  velocity: Vector3;
  /** Particle color configuration */
  color: ParticleColor;
  /** Current particle size */
  size: number;
  /** Particle lifecycle age */
  age: number;
  /** Maximum particle lifespan */
  maxAge: number;
  /** Associated behavior category */
  category: ParticleCategory;
}

/**
 * 3D vector representation for particle physics
 * Used for position, velocity, and force calculations
 */
export interface Vector3 {
  /** X-axis component */
  x: number;
  /** Y-axis component */
  y: number;
  /** Z-axis component */
  z: number;
}

/**
 * Mouse interaction state for particle system
 * Tracks user input for responsive particle behavior
 */
export interface MouseState {
  /** Current mouse X position */
  x: number;
  /** Current mouse Y position */
  y: number;
  /** Whether mouse is currently pressed */
  pressed: boolean;
  /** Mouse movement velocity */
  velocity: Vector3;
  /** Last interaction timestamp */
  lastUpdate: number;
}

/**
 * Animation hook configuration for Hero components
 * Standardizes motion timing and easing across the section
 */
export interface HeroAnimationConfig {
  /** Base animation duration in milliseconds */
  duration: number;
  /** Stagger delay between elements */
  stagger: number;
  /** Easing function for smooth transitions */
  easing: string;
  /** Whether to respect user's reduced motion preference */
  respectReducedMotion: boolean;
}

/**
 * Responsive breakpoint configuration
 * Defines behavior changes across screen sizes
 */
export interface ResponsiveConfig {
  /** Mobile particle count override */
  mobile: Partial<ParticleSystemConfig>;
  /** Tablet particle count override */
  tablet: Partial<ParticleSystemConfig>;
  /** Desktop particle count override */
  desktop: Partial<ParticleSystemConfig>;
}

/**
 * Accessibility configuration for Hero section
 * Ensures inclusive user experience
 */
export interface AccessibilityConfig {
  /** Enable high contrast mode */
  highContrast: boolean;
  /** Reduce particle motion */
  reducedMotion: boolean;
  /** Increase focus indicators */
  enhancedFocus: boolean;
  /** Screen reader optimizations */
  screenReaderOptimized: boolean;
}
