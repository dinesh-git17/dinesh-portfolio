// src/components/sections/Hero/AnimatedText.tsx
// Reusable animated text component with staggered word/letter animations

"use client";

import { motion, Variants } from "framer-motion";
import type { JSX } from "react";
import React, { useMemo } from "react";

export interface AnimatedTextProps {
  text: string;
  as?: keyof JSX.IntrinsicElements;
  variant?: "fadeIn" | "slideUp" | "slideDown";
  split?: "words" | "letters";
  delay?: number;
  stagger?: number;
  className?: string;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  as = "span",
  variant = "fadeIn",
  split = "words",
  delay = 0,
  stagger = 0.1,
  className = "",
}) => {
  const animationVariants = useMemo(
    () => ({
      fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
      },
      slideUp: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
      },
      slideDown: {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
      },
    }),
    []
  );

  const containerVariants: Variants = useMemo(
    () => ({
      initial: {},
      animate: {
        transition: {
          delayChildren: delay,
          staggerChildren: stagger,
        },
      },
    }),
    [delay, stagger]
  );

  const itemVariants: Variants = useMemo(
    () => ({
      initial: animationVariants[variant].initial,
      animate: {
        ...animationVariants[variant].animate,
        transition: {
          duration: 0.6,
          ease: [0.25, 0.46, 0.45, 0.94],
        },
      },
    }),
    [variant, animationVariants]
  );

  const splitText = useMemo(() => {
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
  }, [text, split]);

  const MotionComponent = motion(as);

  return (
    <MotionComponent
      className={className}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {splitText.map((item, index) => (
        <React.Fragment key={item.key}>
          <motion.span
            variants={itemVariants}
            className="inline-block"
            style={{
              visibility: item.isSpace ? "hidden" : "visible",
              width: item.isSpace ? "0.25em" : "auto",
            }}
          >
            {item.content}
          </motion.span>
          {split === "words" && index < splitText.length - 1 && (
            <span className="inline-block" style={{ width: "0.25em" }} />
          )}
        </React.Fragment>
      ))}
    </MotionComponent>
  );
};

export default AnimatedText;
