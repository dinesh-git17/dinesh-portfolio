// src/components/Hero.tsx
"use client"; // if you have any state or effect here, otherwise remove
export default function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center h-screen text-center w-full">
      <h1 className="text-5xl md:text-7xl font-bold text-white">
        Dinesh Dawonauth
      </h1>
      <p className="text-xl md:text-2xl mt-4 text-gray-300">
        Data Scientist | ML Enthusiast
      </p>
      <div className="mt-6 flex space-x-6">
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
      </div>
    </section>
  );
}
