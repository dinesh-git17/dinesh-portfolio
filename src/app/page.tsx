// src/app/page.tsx
"use client"; // We want the hero to be interactive if needed
import Hero from "@/components/Hero";
import AboutMe from "@/components/AboutMe";

export default function Home() {
  return (
    <>
      <Hero />
      <AboutMe />
      {/* Additional sections can go here */}
    </>
  );
}
