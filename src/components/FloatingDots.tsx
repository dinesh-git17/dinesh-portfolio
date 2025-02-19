"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Define type for floating dots
type FloatingDot = {
  id: number;
  size: number;
  color: string;
  position: { top: string; left: string };
  animationDuration: number;
};

// Fixed size for all dots
const DOT_SIZE = 6; // Fixed size in pixels

// Function to generate floating dots (client-side only)
const generateFloatingDots = (numDots: number): FloatingDot[] => {
  return Array.from({ length: numDots }, (_, i) => ({
    id: i,
    size: DOT_SIZE, // ✅ Fixed size for all dots
    color: Math.random() > 0.5 ? "bg-blue-300" : "bg-red-300",
    position: {
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
    },
    animationDuration: Math.random() * 67 + 50, // ✅ 20% faster (50s - 117s per cycle)
  }));
};

export default function FloatingDots() {
  const [dots, setDots] = useState<FloatingDot[]>([]); // ✅ Start empty to prevent SSR mismatch

  useEffect(() => {
    setDots(generateFloatingDots(100)); // ✅ Generate only on the client-side
  }, []);

  return (
    <AnimatePresence>
      {dots.map((dot) => (
        <motion.div
          key={dot.id}
          className={`absolute rounded-full ${dot.color}`}
          style={{
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            top: dot.position.top,
            left: dot.position.left,
            opacity: 0.55, // ✅ Instant visibility
          }}
          animate={{
            x: [
              "0vw",
              `${Math.random() * 30 - 15}vw`, // Move randomly left/right within ±15vw
              `${Math.random() * 30 - 15}vw`,
              "0vw",
            ],
            y: [
              "0vh",
              `${Math.random() * 30 - 15}vh`, // Move randomly up/down within ±15vh
              `${Math.random() * 30 - 15}vh`,
              "0vh",
            ],
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: dot.animationDuration, // ✅ 20% faster but still smooth
            repeat: Infinity,
            repeatType: "mirror", // ✅ Reverses motion to keep dots inside the screen
            ease: "easeInOut", // ✅ Smooth continuous floating
          }}
        />
      ))}
    </AnimatePresence>
  );
}
