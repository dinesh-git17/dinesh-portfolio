// src/components/sections/Hero/HeroContent.tsx
// Phase 4: Enhanced CTA animations with staggered motion and hover effects

"use client";

import {
  ctaGroupVariants,
  ctaItemVariants,
  fadeInUp,
  heroContainerVariants,
  heroItemVariants,
} from "@/lib/animations/HeroAnimations";
import { motion, useReducedMotion, Variants } from "framer-motion";
import Link from "next/link";
import React from "react";

export interface HeroContentProps {
  headline: string;
  subheadline?: string;
  ctas?: Array<{
    label: string;
    href: string;
    ariaLabel?: string;
    variant?: "primary" | "secondary";
    onClick?: () => void;
  }>;
  align?: "left" | "center";
  className?: string;
  dense?: boolean;
}

const ctaHoverVariants: Variants = {
  initial: { scale: 1, y: 0 },
  hover: {
    scale: 1.05,
    y: -2,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25,
      mass: 0.8,
    },
  },
  tap: {
    scale: 0.98,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 600,
      damping: 30,
    },
  },
};

const ctaGlowVariants: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  hover: {
    opacity: 1,
    scale: 1.1,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

function getCtaClasses(variant?: "primary" | "secondary"): string {
  const baseClasses =
    "relative inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 overflow-hidden group";

  if (variant === "secondary") {
    return `${baseClasses} text-white border-2 border-white/30 hover:border-white/50 hover:bg-white/10 focus:ring-white/30 backdrop-blur-sm`;
  }

  return `${baseClasses} bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 focus:ring-blue-500 shadow-xl hover:shadow-2xl hover:shadow-blue-500/25`;
}

function isExternalUrl(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}

export default function HeroContent({
  headline,
  subheadline,
  ctas = [],
  align = "center",
  className = "",
  dense = false,
}: HeroContentProps): React.JSX.Element {
  const shouldReduceMotion = useReducedMotion();
  const headlineId = "hero-headline";

  const alignmentClasses =
    align === "left"
      ? "text-left md:text-left items-start md:items-start"
      : "text-center items-center";

  const spacingClasses = dense
    ? "space-y-4 md:space-y-6"
    : "space-y-6 md:space-y-8 lg:space-y-10";

  if (shouldReduceMotion) {
    return (
      <section
        className={`max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 ${spacingClasses} ${alignmentClasses} ${className}`}
        aria-labelledby={headlineId}
      >
        {headline && (
          <h1
            id={headlineId}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white"
          >
            {headline}
          </h1>
        )}

        {subheadline && (
          <p className="max-w-prose text-lg sm:text-xl text-gray-200 text-balance leading-relaxed">
            {subheadline}
          </p>
        )}

        {ctas.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
            {ctas.map((cta, index) => (
              <Link
                key={index}
                href={cta.href}
                className={getCtaClasses(cta.variant)}
                aria-label={cta.ariaLabel || cta.label}
                rel={
                  isExternalUrl(cta.href) ? "noopener noreferrer" : undefined
                }
                target={isExternalUrl(cta.href) ? "_blank" : undefined}
                onClick={cta.onClick}
              >
                {cta.label}
              </Link>
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <motion.section
      className={`max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 ${spacingClasses} ${alignmentClasses} ${className}`}
      aria-labelledby={headlineId}
      variants={heroContainerVariants}
      initial="initial"
      animate="animate"
    >
      {headline && (
        <motion.h1
          id={headlineId}
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white"
          variants={heroItemVariants}
        >
          {headline}
        </motion.h1>
      )}

      {subheadline && (
        <motion.p
          className="max-w-prose text-lg sm:text-xl text-gray-200 text-balance leading-relaxed"
          variants={fadeInUp}
        >
          {subheadline}
        </motion.p>
      )}

      {ctas.length > 0 && (
        <motion.div
          className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center"
          variants={ctaGroupVariants}
          initial="initial"
          animate="animate"
        >
          {ctas.map((cta, index) => (
            <motion.div
              key={index}
              variants={ctaItemVariants}
              whileHover="hover"
              whileTap="tap"
              className="relative"
            >
              <motion.div
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-xl"
                variants={ctaGlowVariants}
                initial="initial"
                whileHover="hover"
              />

              <motion.div
                variants={ctaHoverVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
              >
                <Link
                  href={cta.href}
                  className={getCtaClasses(cta.variant)}
                  aria-label={cta.ariaLabel || cta.label}
                  rel={
                    isExternalUrl(cta.href) ? "noopener noreferrer" : undefined
                  }
                  target={isExternalUrl(cta.href) ? "_blank" : undefined}
                  onClick={cta.onClick}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {cta.label}
                    {cta.variant === "primary" && (
                      <svg
                        className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    )}
                  </span>

                  {cta.variant === "primary" && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/10 to-purple-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                  )}
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.section>
  );
}
