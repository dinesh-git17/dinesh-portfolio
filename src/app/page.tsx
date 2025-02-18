"use client";
import { motion } from "framer-motion";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="flex min-h-screen flex-col items-center justify-center bg-black text-white"
    >
      <Hero />
    </motion.main>
  );
}
