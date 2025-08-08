// src/app/page.tsx
// Main page using correct Hero component according to gameplan

"use client";

import Hero from "@/components/sections/Hero";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Hero
        enableParticles={true}
        heading="Dinesh Dawonauth"
        subheading="Full Stack Developer & Machine Learning Engineer crafting innovative digital experiences"
        primaryCTAText="View Projects"
        primaryCTAHref="/projects"
        secondaryCTAText="About Me"
        secondaryCTAHref="/about"
        className="min-h-screen"
      />
    </main>
  );
}
