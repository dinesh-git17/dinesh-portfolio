// src/components/Navbar.tsx
"use client"; // If you have interactive elements in the Navbar
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full flex justify-between items-center px-8 py-4 bg-black/50 backdrop-blur-lg text-white z-10">
      <div className="text-2xl font-bold">Dinesh</div>
      <div className="space-x-6 text-lg">
        <Link href="#projects" className="hover:text-gray-400 transition">
          Projects
        </Link>
        <Link href="#contact" className="hover:text-gray-400 transition">
          Contact
        </Link>
      </div>
    </nav>
  );
}
