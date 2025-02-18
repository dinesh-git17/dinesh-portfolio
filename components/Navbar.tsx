"use client";
import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed top-0 left-0 w-full flex justify-between items-center px-8 py-4 bg-black/50 backdrop-blur-lg text-white"
    >
      <div className="text-2xl font-bold">Dinesh</div>
      <div className="space-x-6 text-lg">
        <a href="#projects" className="hover:text-gray-400 transition">
          Projects
        </a>
        <a href="#contact" className="hover:text-gray-400 transition">
          Contact
        </a>
      </div>
    </motion.nav>
  );
}
