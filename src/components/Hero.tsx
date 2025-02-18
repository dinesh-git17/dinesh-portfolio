"use client";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center h-screen text-center w-full">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-5xl md:text-7xl font-bold text-white"
      >
        Dinesh Dawonauth
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="text-xl md:text-2xl mt-4 text-gray-300"
      >
        Data Scientist | ML Enthusiast
      </motion.p>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="mt-6 flex space-x-6"
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
