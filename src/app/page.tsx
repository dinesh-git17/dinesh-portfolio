// src/app/page.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="mx-auto max-w-7xl px-4 flex min-h-screen items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-6 text-5xl font-bold tracking-tight text-white md:text-7xl lg:text-8xl"
          >
            Dinesh <span className="gradient-text">Dawonauth</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mx-auto mb-8 max-w-2xl text-xl text-gray-300 md:text-2xl leading-relaxed"
          >
            Full Stack Developer & Machine Learning Engineer crafting innovative
            digital experiences
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col gap-4 sm:flex-row sm:justify-center"
          >
            <Link
              href="/projects"
              className="glass-effect rounded-full px-8 py-3 text-white transition-all duration-300 hover:bg-white/20 hover:scale-105 font-medium"
            >
              View Projects
            </Link>
            <Link
              href="/about"
              className="rounded-full border-2 border-emerald-400 px-8 py-3 text-emerald-400 transition-all duration-300 hover:bg-emerald-400 hover:text-gray-900 hover:scale-105 font-medium"
            >
              About Me
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
