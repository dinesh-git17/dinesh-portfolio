"use client";
import { useEffect, useState } from "react";
import { FaBars, FaUserAstronaut, FaGamepad } from "react-icons/fa";

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const aboutSection = document.getElementById("about");
      if (!aboutSection) return;

      const aboutPosition = aboutSection.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;

      if (aboutPosition < windowHeight * 0.5) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScroll = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    targetId: string
  ) => {
    event.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      const offset = 10; // Adjust this value for more spacing
      const elementPosition =
        targetElement.getBoundingClientRect().top + window.scrollY;

      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth",
      });
    }
  };

  return (
    <nav
      className={`fixed top-0 w-full px-6 py-4 transition-opacity duration-500 font-inter z-50 ${
        isVisible
          ? "opacity-100 bg-[#0A0A0F]/80 backdrop-blur-lg shadow-lg"
          : "opacity-0"
      }`}
    >
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* 🚀 Clickable Astronaut Icon (Scrolls to Top) */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="hover:text-purple-400 transition duration-300"
        >
          <FaUserAstronaut className="text-purple-400 text-2xl md:text-3xl" />
        </button>

        {/* Navbar Links */}
        <ul className="hidden md:flex space-x-8 text-white text-sm uppercase tracking-wide">
          <li className="group">
            <a
              href="#about"
              onClick={(e) => handleScroll(e, "about")}
              className="transition duration-300 hover:text-purple-400 hover:drop-shadow-[0_0_10px_rgba(192,132,252,0.8)]"
            >
              About
              <span className="block h-0.5 w-0 bg-purple-400 group-hover:w-full transition-all duration-300"></span>
            </a>
          </li>
          <li className="group">
            <a
              href="#projects"
              onClick={(e) => handleScroll(e, "projects")}
              className="transition duration-300 hover:text-purple-400 hover:drop-shadow-[0_0_10px_rgba(192,132,252,0.8)]"
            >
              Projects
              <span className="block h-0.5 w-0 bg-purple-400 group-hover:w-full transition-all duration-300"></span>
            </a>
          </li>
          <li className="group">
            <a
              href="#contact"
              onClick={(e) => handleScroll(e, "contact")}
              className="transition duration-300 hover:text-purple-400 hover:drop-shadow-[0_0_10px_rgba(192,132,252,0.8)]"
            >
              Contact
              <span className="block h-0.5 w-0 bg-purple-400 group-hover:w-full transition-all duration-300"></span>
            </a>
          </li>
          <li>
            <a
              href="/flappy-bird"
              className="flex items-center gap-1 text-white transition duration-300 hover:text-purple-400 hover:drop-shadow-[0_0_15px_rgba(192,132,252,1)]"
            >
              <FaGamepad className="text-purple-400" />
              Play Game
            </a>
          </li>
        </ul>

        {/* Mobile Menu Icon */}
        <div className="md:hidden">
          <FaBars className="text-white text-xl cursor-pointer hover:text-purple-400 transition duration-300" />
        </div>
      </div>
    </nav>
  );
}
