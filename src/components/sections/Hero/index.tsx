// src/components/sections/Hero/index.tsx
// Hero Section component - Main container for portfolio hero with responsive layout and animation

"use client";

import { motion, Variants } from "framer-motion";
import React from "react";

interface HeroProps {
  heading?: string;
  subheading?: string;
  primaryCTAText?: string;
  primaryCTAHref?: string;
  secondaryCTAText?: string;
  secondaryCTAHref?: string;
  enableParticles?: boolean;
  className?: string;
}

interface CTAButton {
  text: string;
  href: string;
  variant: "primary" | "secondary";
}

const Hero: React.FC<HeroProps> = ({
  heading = "Dinesh Dawonauth",
  subheading = "Full Stack Developer & Machine Learning Engineer crafting innovative digital experiences",
  primaryCTAText = "View Projects",
  primaryCTAHref = "/projects",
  secondaryCTAText = "About Me",
  secondaryCTAHref = "/about",
  enableParticles = false,
  className = "",
}) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const ctaButtons: CTAButton[] = [
    { text: primaryCTAText, href: primaryCTAHref, variant: "primary" },
    { text: secondaryCTAText, href: secondaryCTAHref, variant: "secondary" },
  ];

  return (
    <section
      className={`relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 ${className}`}
      aria-label="Hero section"
    >
      {enableParticles && (
        <div
          className="absolute inset-0 z-0"
          role="presentation"
          aria-hidden="true"
        >
          <div id="particle-container" className="w-full h-full" />
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-screen items-center justify-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center max-w-4xl mx-auto"
          >
            <motion.h1
              variants={itemVariants}
              className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
            >
              {heading.split(" ").map((word, index) => (
                <span key={index}>
                  {index === heading.split(" ").length - 1 ? (
                    <span className="gradient-text">{word}</span>
                  ) : (
                    word
                  )}{" "}
                </span>
              ))}
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mx-auto mb-8 max-w-2xl text-lg text-gray-300 sm:text-xl md:text-2xl leading-relaxed"
            >
              {subheading}
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-6"
            >
              {ctaButtons.map((button, index) => (
                <a
                  key={index}
                  href={button.href}
                  className={`
                    inline-flex items-center justify-center
                    rounded-full px-6 py-3 sm:px-8 sm:py-4
                    text-base font-medium
                    transition-all duration-300 ease-in-out
                    hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2
                    ${
                      button.variant === "primary"
                        ? "glass-effect text-white hover:bg-white/20 focus:ring-blue-500"
                        : "border-2 border-accent-400 text-accent-400 hover:bg-accent-400 hover:text-gray-900 focus:ring-accent-500"
                    }
                  `}
                  aria-label={`${button.text} - Navigate to ${button.href}`}
                >
                  {button.text}
                </a>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
