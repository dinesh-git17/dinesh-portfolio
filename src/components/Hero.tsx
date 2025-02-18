"use client";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center h-screen text-center">
      {/* Background Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black opacity-40"></div>

      {/* Animated Name */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative text-5xl md:text-7xl font-bold text-white"
      >
        Dinesh Dawonauth
      </motion.h1>

      {/* Animated Role */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="relative text-xl md:text-2xl mt-4 text-gray-300"
      >
        Data Scientist | ML Enthusiast
      </motion.p>

      {/* Call-to-Action Buttons */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="relative mt-6 flex space-x-4"
      >
        <a
          href="#projects"
          className="px-6 py-3 border border-white rounded-lg hover:bg-white hover:text-black transition"
        >
          Projects
        </a>
        <a
          href="#contact"
          className="px-6 py-3 border border-white rounded-lg hover:bg-white hover:text-black transition"
        >
          Contact
        </a>
      </motion.div>
    </section>
  );
}
