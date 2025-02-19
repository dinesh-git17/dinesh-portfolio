"use client";

import { useState } from "react";
import { FaArrowDown } from "react-icons/fa";
import { motion } from "framer-motion";

export default function Hero() {
  const [pulse, setPulse] = useState(false);

  // Smooth scrolling with natural easing
  const smoothScrollTo = (targetY: number, duration: number) => {
    const startY = window.scrollY;
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);

      // Ease-in-out effect
      const easedProgress =
        progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      window.scrollTo(0, startY + (targetY - startY) * easedProgress);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  // Handle click: trigger pulse effect, then scroll
  const handleClick = () => {
    setPulse(true);

    setTimeout(() => {
      setPulse(false); // Reset pulse after animation completes

      // Delay the scroll to allow pulse animation to be visible first
      const aboutSection = document.getElementById("about");
      if (aboutSection) {
        smoothScrollTo(aboutSection.offsetTop, 900); // Slightly faster scroll (900ms)
      }
    }, 600); // Wait for pulse effect to complete before scrolling
  };

  return (
    <section className="relative flex flex-col items-center justify-center h-screen text-center w-full">
      {/* Greeting */}
      <h1 className="text-4xl md:text-6xl font-bold text-white">
        Hello, I&#39;m{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
          Dinesh
        </span>
        .
      </h1>

      {/* Role */}
      <p className="text-2xl md:text-3xl mt-4 text-gray-300">
        I&#39;m a Data Scientist and ML enthusiast.
      </p>

      {/* Down Arrow with Shake on Load + Pulse Effect */}
      <div className="mt-12 relative">
        <motion.div
          onClick={handleClick}
          className="relative flex items-center justify-center p-5 border border-purple-400 rounded-full cursor-pointer hover:bg-purple-400 hover:text-black transition-all duration-300 overflow-hidden shadow-lg hover:shadow-purple-500/50"
          initial={{ x: 0 }}
          animate={{ x: [0, -5, 5, -5, 5, 0] }} // Shake effect
          transition={{
            duration: 0.6,
            ease: "easeInOut",
            repeat: 1,
            delay: 0.8,
          }} // Delayed for better UX
        >
          <FaArrowDown className="text-2xl text-white transition-transform duration-300 hover:scale-110" />

          {/* Pulse Effect Expanding on Click */}
          {pulse && (
            <span
              key={Math.random()} // Forces re-render to trigger animation
              className="absolute bg-purple-400 opacity-30 rounded-full animate-pulse-effect"
              style={{
                width: "300px",
                height: "300px",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            ></span>
          )}
        </motion.div>
      </div>

      {/* Pulse Effect Animation */}
      <style jsx>{`
        @keyframes pulse-effect {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          100% {
            transform: scale(2.5);
            opacity: 0;
          }
        }
        .animate-pulse-effect {
          animation: pulse-effect 0.6s ease-out;
        }
      `}</style>
    </section>
  );
}
