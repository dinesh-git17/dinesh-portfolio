// src/components/sections/Hero/HeroSection.tsx
// Main Hero Section integration component with config-driven props

"use client";

import { heroContainerVariants } from "@/lib/animations/HeroAnimations";
import { heroContentConfig } from "@/lib/config/heroConfig";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import type { JSX } from "react";
import { useEffect, useState } from "react";
import AnimatedText from "./AnimatedText";
import HeroContent from "./HeroContent";

const ParticleSystem = dynamic(() => import("./ParticleSystem"), {
  ssr: false,
  loading: () => null,
});

export interface HeroSectionProps {
  enableParticles?: boolean;
  className?: string;
}

export default function HeroSection({
  enableParticles = true,
  className = "",
}: HeroSectionProps): JSX.Element {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const containerVariants = prefersReducedMotion
    ? {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 },
      }
    : heroContainerVariants;

  const ctaArray = [
    {
      label: heroContentConfig.primaryCTA.label,
      href: heroContentConfig.primaryCTA.href,
      variant: heroContentConfig.primaryCTA.variant,
      ariaLabel: heroContentConfig.primaryCTA.ariaLabel,
    },
    {
      label: heroContentConfig.secondaryCTA.label,
      href: heroContentConfig.secondaryCTA.href,
      variant: heroContentConfig.secondaryCTA.variant,
      ariaLabel: heroContentConfig.secondaryCTA.ariaLabel,
    },
  ];

  return (
    <section
      className={`relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 ${className}`}
      role="banner"
      aria-label="Hero section"
    >
      {enableParticles && isMounted && (
        <div
          className="absolute inset-0 -z-10 pointer-events-none"
          aria-hidden="true"
        >
          <ParticleSystem />
        </div>
      )}

      <div
        className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 pointer-events-none"
        aria-hidden="true"
      />

      <motion.div
        className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="space-y-4">
            <AnimatedText
              text={heroContentConfig.headline}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white drop-shadow-lg"
              as="h1"
              delay={prefersReducedMotion ? 0 : 0.2}
            />

            <AnimatedText
              text={heroContentConfig.subheadline}
              className="text-lg sm:text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto drop-shadow-md"
              as="p"
              delay={prefersReducedMotion ? 0 : 0.4}
            />
          </div>

          <motion.div
            variants={
              prefersReducedMotion
                ? {}
                : {
                    initial: { opacity: 0, y: 20 },
                    animate: {
                      opacity: 1,
                      y: 0,
                      transition: { delay: 0.6, duration: 0.6 },
                    },
                  }
            }
            initial="initial"
            animate="animate"
          >
            <HeroContent headline="" subheadline="" ctas={ctaArray} />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
