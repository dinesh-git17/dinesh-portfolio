"use client";
import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed top-0 left-0 w-full flex justify-between items-center p-4 backdrop-blur-md bg-black/50 text-white"
    >
      <div className="text-xl font-bold">Dinesh</div>
      <div className="space-x-6">
        <a href="#projects" className="hover:text-gray-400">Projects</a>
        <a href="#contact" className="hover:text-gray-400">Contact</a>
      </div>
    </motion.nav>
  );
}
