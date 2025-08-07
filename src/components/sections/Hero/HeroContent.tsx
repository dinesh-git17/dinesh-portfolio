// src/components/sections/Hero/HeroContent.tsx
// Hero section text content with responsive layout, accessibility, and motion

"use client";

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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const ctaGroupVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.06,
    },
  },
};

const ctaItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
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
    : "space-y-6 md:space-y-8";

  const getCtaClasses = (
    variant: "primary" | "secondary" = "primary"
  ): string => {
    const baseClasses =
      "inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500";

    if (variant === "primary") {
      return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-lg hover:shadow-xl`;
    }

    return `${baseClasses} border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100`;
  };

  const isExternalUrl = (href: string): boolean => {
    return href.startsWith("http") || href.startsWith("//");
  };

  if (shouldReduceMotion) {
    return (
      <section
        className={`max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 ${spacingClasses} ${alignmentClasses} ${className}`}
        aria-labelledby={headlineId}
      >
        <h1
          id={headlineId}
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900"
        >
          {headline}
        </h1>

        {subheadline && (
          <p className="max-w-prose text-lg sm:text-xl text-gray-600 text-balance leading-relaxed">
            {subheadline}
          </p>
        )}

        {ctas.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            {ctas.map((cta, index) => (
              <Link
                key={index}
                href={cta.href}
                className={getCtaClasses(cta.variant)}
                aria-label={cta.ariaLabel || cta.label}
                rel={
                  isExternalUrl(cta.href) ? "noopener noreferrer" : undefined
                }
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
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1
        id={headlineId}
        className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900"
        variants={itemVariants}
      >
        {headline}
      </motion.h1>

      {subheadline && (
        <motion.p
          className="max-w-prose text-lg sm:text-xl text-gray-600 text-balance leading-relaxed"
          variants={itemVariants}
        >
          {subheadline}
        </motion.p>
      )}

      {ctas.length > 0 && (
        <motion.div
          className="flex flex-col sm:flex-row gap-4 sm:gap-6"
          variants={ctaGroupVariants}
        >
          {ctas.map((cta, index) => (
            <motion.div key={index} variants={ctaItemVariants}>
              <Link
                href={cta.href}
                className={getCtaClasses(cta.variant)}
                aria-label={cta.ariaLabel || cta.label}
                rel={
                  isExternalUrl(cta.href) ? "noopener noreferrer" : undefined
                }
                onClick={cta.onClick}
              >
                {cta.label}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.section>
  );
}
