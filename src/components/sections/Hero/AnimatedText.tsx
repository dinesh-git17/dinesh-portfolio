// src/components/sections/Hero/AnimatedText.tsx
// Enhanced animated text component with proper TypeScript variants typing

"use client";

import { wordVariants } from "@/lib/animations/HeroAnimations";
import { motion, useReducedMotion, Variants } from "framer-motion";
import type { JSX } from "react";
import React, { useMemo } from "react";

export interface AnimatedTextProps {
  text: string;
  as?: keyof JSX.IntrinsicElements;
  variant?: "fadeIn" | "slideUp" | "slideDown" | "elastic";
  split?: "words" | "letters" | "none";
  delay?: number;
  stagger?: number;
  className?: string;
  variants?: Variants;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  as = "span",
  variant = "slideUp",
  split = "words",
  delay = 0,
  stagger = 0.08,
  className = "",
  variants,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const animationVariants = useMemo(
    () => ({
      fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
      },
      slideUp: {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
      },
      slideDown: {
        initial: { opacity: 0, y: -30 },
        animate: { opacity: 1, y: 0 },
      },
      elastic: {
        initial: { opacity: 0, y: 50, scale: 0.3 },
        animate: { opacity: 1, y: 0, scale: 1 },
      },
    }),
    []
  );

  const containerVariants: Variants = useMemo(() => {
    if (shouldReduceMotion) {
      return {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
      };
    }

    if (variants) {
      return variants;
    }

    return {
      initial: {},
      animate: {
        transition: {
          delayChildren: delay,
          staggerChildren: stagger,
        },
      },
    };
  }, [variants, delay, stagger, shouldReduceMotion]);

  const itemVariants: Variants = useMemo(() => {
    if (shouldReduceMotion) {
      return {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
      };
    }

    if (variants) {
      return wordVariants;
    }

    const baseVariant = animationVariants[variant];
    const easing =
      variant === "elastic"
        ? ([0.175, 0.885, 0.32, 1.275] as [number, number, number, number])
        : ([0.25, 0.46, 0.45, 0.94] as [number, number, number, number]);

    return {
      initial: baseVariant.initial,
      animate: {
        ...baseVariant.animate,
        transition: {
          duration: variant === "elastic" ? 0.8 : 0.6,
          ease: easing,
        },
      },
    };
  }, [variant, animationVariants, variants, shouldReduceMotion]);

  const splitText = useMemo(() => {
    if (split === "none" || shouldReduceMotion) {
      return [{ content: text, key: "full-text", isSpace: false }];
    }

    if (split === "letters") {
      return text.split("").map((char, index) => ({
        content: char,
        key: `letter-${index}`,
        isSpace: char === " ",
      }));
    }

    return text.split(" ").map((word, index) => ({
      content: word,
      key: `word-${index}`,
      isSpace: false,
    }));
  }, [text, split, shouldReduceMotion]);

  const MotionComponent = motion(as);

  if (shouldReduceMotion || split === "none") {
    return <MotionComponent className={className}>{text}</MotionComponent>;
  }

  return (
    <MotionComponent
      className={className}
      variants={containerVariants}
      initial="initial"
      animate="animate"
      style={{ display: "inline-block" }}
    >
      {splitText.map((item, index) => (
        <React.Fragment key={item.key}>
          <motion.span
            variants={itemVariants}
            className="inline-block"
            style={{
              display: item.isSpace ? "inline" : "inline-block",
              marginRight: item.isSpace ? "0.25em" : "0",
              marginLeft: split === "words" && index > 0 ? "0.25em" : "0",
            }}
          >
            {item.content === " " ? "\u00A0" : item.content}
          </motion.span>
          {split === "words" &&
            index < splitText.length - 1 &&
            item.content !== " " && (
              <span style={{ display: "inline-block", width: "0.25em" }}></span>
            )}
        </React.Fragment>
      ))}
    </MotionComponent>
  );
};

export default AnimatedText;
