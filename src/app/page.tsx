"use client";
import Hero from "@/components/Hero";
import AboutMe from "@/components/AboutMe";
import ContactPage from "@/components/Contact";
import SectionDivider from "@/components/SectionDivider"; // Import the divider

export default function Home() {
  return (
    <>
      <Hero />
      <SectionDivider />
      <AboutMe />
      <SectionDivider />
      <ContactPage />
    </>
  );
}
