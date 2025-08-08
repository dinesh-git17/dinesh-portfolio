// src/components/sections/Hero/index.tsx
// MAIN Hero Section component with layout structure and responsive design

"use client";

import {
  ctaGroupVariants,
  fadeInUp,
  heroContainerVariants,
  textStaggerVariants,
} from "@/lib/animations/HeroAnimations";
import { heroContentConfig } from "@/lib/config/heroConfig";
import { detectDevicePerformanceSync } from "@/lib/performance/DeviceDetection";
import { motion, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import type { JSX } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import AnimatedText from "./AnimatedText";
import HeroContent from "./HeroContent";

const ParticleSystem = dynamic(() => import("./ParticleSystem"), {
  ssr: false,
  loading: () => null,
});

export interface HeroProps {
  enableParticles?: boolean;
  className?: string;
  heading?: string;
  subheading?: string;
  primaryCTAText?: string;
  primaryCTAHref?: string;
  secondaryCTAText?: string;
  secondaryCTAHref?: string;
}

export default function Hero({
  enableParticles = true,
  className = "",
  heading,
  subheading,
  primaryCTAText,
  primaryCTAHref,
  secondaryCTAText,
  secondaryCTAHref,
}: HeroProps): JSX.Element {
  const shouldReduceMotion = useReducedMotion();
  const [isMounted, setIsMounted] = useState(false);
  const [deviceTier, setDeviceTier] = useState<"low" | "medium" | "high">(
    "medium"
  );

  useEffect(() => {
    setIsMounted(true);

    try {
      const detection = detectDevicePerformanceSync();
      setDeviceTier(detection.tier);
    } catch (error) {
      console.warn("Device detection failed:", error);
    }
  }, []);

  const shouldShowParticles = useMemo(() => {
    return enableParticles && isMounted && !shouldReduceMotion;
  }, [enableParticles, isMounted, shouldReduceMotion]);

  const containerVariants = useMemo(() => {
    if (shouldReduceMotion) {
      return {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
      };
    }
    return heroContainerVariants;
  }, [shouldReduceMotion]);

  const handleParticleEngineReady = useCallback(() => {
    console.log("Particle engine initialized successfully");
  }, []);

  const ctaArray = useMemo(() => {
    if (primaryCTAText || secondaryCTAText) {
      return [
        ...(primaryCTAText
          ? [
              {
                label: primaryCTAText,
                href: primaryCTAHref || "/projects",
                variant: "primary" as const,
                ariaLabel: `${primaryCTAText} - Navigate to projects`,
              },
            ]
          : []),
        ...(secondaryCTAText
          ? [
              {
                label: secondaryCTAText,
                href: secondaryCTAHref || "/about",
                variant: "secondary" as const,
                ariaLabel: `${secondaryCTAText} - Learn more about me`,
              },
            ]
          : []),
      ];
    }

    return [
      {
        label: heroContentConfig.primaryCTA.label,
        href: heroContentConfig.primaryCTA.href,
        variant: heroContentConfig.primaryCTA.variant as
          | "primary"
          | "secondary",
        ariaLabel: heroContentConfig.primaryCTA.ariaLabel,
      },
      {
        label: heroContentConfig.secondaryCTA.label,
        href: heroContentConfig.secondaryCTA.href,
        variant: heroContentConfig.secondaryCTA.variant as
          | "primary"
          | "secondary",
        ariaLabel: heroContentConfig.secondaryCTA.ariaLabel,
      },
    ];
  }, [primaryCTAText, primaryCTAHref, secondaryCTAText, secondaryCTAHref]);

  const displayHeading = heading || heroContentConfig.headline;
  const displaySubheading = subheading || heroContentConfig.subheadline;

  return (
    <section
      className={`relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 ${className}`}
      role="banner"
      aria-label="Hero section"
    >
      {shouldShowParticles && (
        <div
          className="absolute inset-0 -z-10 pointer-events-none"
          aria-hidden="true"
        >
          <ParticleSystem
            performanceTier={deviceTier}
            enableInteraction={!shouldReduceMotion}
            onEngineReady={handleParticleEngineReady}
          />
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
      >
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="space-y-6">
            <AnimatedText
              text={displayHeading}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white drop-shadow-lg tracking-tight"
              as="h1"
              delay={shouldReduceMotion ? 0 : 0.2}
              stagger={shouldReduceMotion ? 0 : 0.1}
              variants={shouldReduceMotion ? undefined : textStaggerVariants}
            />

            <AnimatedText
              text={displaySubheading}
              className="text-lg sm:text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto drop-shadow-md leading-relaxed"
              as="p"
              delay={shouldReduceMotion ? 0 : 0.4}
              stagger={shouldReduceMotion ? 0 : 0.05}
              variants={shouldReduceMotion ? undefined : fadeInUp}
            />
          </div>

          <motion.div
            variants={shouldReduceMotion ? {} : ctaGroupVariants}
            initial="initial"
            animate="animate"
            className="pt-4"
          >
            <HeroContent
              headline=""
              subheadline=""
              ctas={ctaArray}
              align="center"
              dense={false}
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
