// src/components/sections/Hero/HeroSection.tsx
// Complete Hero Section integration combining all components

"use client";

import Hero from "./index";

export interface HeroSectionProps {
  enableParticles?: boolean;
  className?: string;
  heading?: string;
  subheading?: string;
  primaryCTAText?: string;
  primaryCTAHref?: string;
  secondaryCTAText?: string;
  secondaryCTAHref?: string;
}

export default function HeroSection(props: HeroSectionProps) {
  return <Hero {...props} />;
}
