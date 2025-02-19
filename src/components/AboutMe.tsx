"use client";
import { useEffect, useState } from "react";
import FloatingDots from "./FloatingDots";
import {
  FaPython,
  FaReact,
  FaNodeJs,
  FaDatabase,
  FaTerminal,
  FaUserAstronaut,
  FaLaptopCode,
} from "react-icons/fa";
import {
  SiNextdotjs,
  SiTailwindcss,
  SiTensorflow,
  SiPytorch,
  SiScikitlearn,
  SiPandas,
  SiMysql,
} from "react-icons/si";

const techStack = [
  { name: "Python", icon: <FaPython className="text-blue-400" /> },
  { name: "SQL", icon: <FaDatabase className="text-yellow-500" /> },
  { name: "Bash / Shell", icon: <FaTerminal className="text-gray-300" /> },
  { name: "React", icon: <FaReact className="text-blue-500" /> },
  { name: "Next.js", icon: <SiNextdotjs className="text-white" /> },
  { name: "Node.js", icon: <FaNodeJs className="text-green-400" /> },
  { name: "Tailwind CSS", icon: <SiTailwindcss className="text-cyan-400" /> },
  { name: "TensorFlow", icon: <SiTensorflow className="text-orange-300" /> },
  { name: "PyTorch", icon: <SiPytorch className="text-red-400" /> },
  { name: "Scikit-learn", icon: <SiScikitlearn className="text-yellow-300" /> },
  { name: "Pandas", icon: <SiPandas className="text-blue-300" /> },
  { name: "MySQL", icon: <SiMysql className="text-blue-500" /> },
];

export default function AboutMe() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setHasMounted(true);
      console.log(
        "%c🚀 AboutMe Component Fully Mounted",
        "color: cyan; font-weight: bold;"
      );
    }, 500);
  }, []);

  if (!hasMounted) return null;

  return (
    <section
      id="about"
      className="relative w-full min-h-screen max-h-screen flex flex-col items-center justify-center bg-inherit text-inherit font-inter overflow-hidden px-4 pt-12 md:pt-16"
    >
      {/* Floating Dots Background */}
      <FloatingDots />

      {/* Content Wrapper */}
      <div className="max-w-6xl mx-auto flex flex-col gap-6 items-center relative z-10 h-full w-full justify-between">
        {/* About Me Card */}
        <div className="bg-[#181824] w-full max-w-3xl p-6 rounded-xl shadow-lg flex flex-col items-center space-y-3 transform transition duration-300 hover:scale-105 hover:shadow-purple-500/50 h-auto flex-1 overflow-hidden">
          <FaUserAstronaut className="text-purple-400 text-4xl" />

          <h2 className="text-3xl md:text-4xl font-extrabold tracking-wide text-center relative">
            About Me
            <span className="block w-32 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mt-2 mx-auto animate-pulse"></span>
          </h2>

          <p className="text-sm md:text-md leading-relaxed text-center px-2">
            I love building <strong>AI-powered applications</strong> that make
            life easier.
          </p>
        </div>

        {/* Tech Stack Section (Now Matches About Me Card Style) */}
        <div className="bg-[#181824] w-full max-w-4xl p-6 rounded-xl shadow-lg flex flex-col items-center space-y-4 h-auto flex-1 overflow-hidden">
          {/* 💾 New Tech Stack Icon (Laptop Code Icon) */}
          <FaLaptopCode className="text-purple-400 text-4xl" />

          <h2 className="text-3xl md:text-4xl font-extrabold tracking-wide text-center relative">
            Tech Stack
            <span className="block w-24 h-1 bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 rounded-full mt-2 mx-auto animate-pulse"></span>
          </h2>

          {/* Tech Stack Grid (Each Card Has Its Own `group`) */}
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 w-full">
            {techStack.map((tech) => (
              <div
                key={tech.name}
                className="group bg-[#1e1e2e] p-4 rounded-xl shadow-md flex flex-col items-center transition duration-300 transform hover:scale-105 hover:shadow-purple-500/50 hover:ring-2 hover:ring-purple-500/60"
                onMouseEnter={(e) => {
                  console.log(
                    `%c🔍 Hovered Over: ${tech.name}`,
                    "color: green; font-weight: bold;"
                  );
                  e.currentTarget.classList.add("animate-wiggle");
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.classList.remove("animate-wiggle");
                }}
              >
                {tech.icon}
                <span className="mt-2 text-xs md:text-sm font-semibold transition duration-300 opacity-80 group-hover:text-purple-400">
                  {tech.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tailwind Animation for Smoother Wiggle Effect */}
      <style jsx global>{`
        @keyframes wiggle {
          0% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(0.8deg);
          }
          50% {
            transform: rotate(-0.8deg);
          }
          75% {
            transform: rotate(0.8deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }

        .animate-wiggle {
          animation: wiggle 0.5s ease-in-out infinite alternate;
        }
      `}</style>
    </section>
  );
}
