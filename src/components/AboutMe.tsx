"use client";
import { useEffect, useState } from "react";
import FloatingDots from "./FloatingDots";
import { FaPython, FaReact, FaNodeJs, FaDatabase, FaTerminal, FaUserAstronaut } from "react-icons/fa";
import { SiNextdotjs, SiTailwindcss, SiTensorflow, SiPytorch, SiScikitlearn, SiPandas, SiMysql } from "react-icons/si";

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
      console.log("🚀 AboutMe Component Fully Mounted");
    }, 500);
  }, []);

  if (!hasMounted) return null; // ✅ Prevents flickering before hydration completes

  return (
    <section
      id="about"
      className="relative w-full min-h-screen flex items-center justify-center bg-inherit text-inherit font-inter overflow-hidden"
    >
      {/* Floating Dots Background */}
      <FloatingDots />

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* About Me Card */}
        <div className="bg-[#181824] p-8 rounded-xl shadow-lg flex flex-col items-center space-y-4 transform transition duration-300 hover:scale-105 hover:shadow-purple-500/50">
          {/* 🚀 About Me Icon */}
          <FaUserAstronaut className="text-purple-400 text-5xl" />
          
          {/* About Me Text */}
          <h2 className="text-5xl font-extrabold tracking-wide text-center relative">
            About Me
            {/* 🔥 Groovy Animated Underline */}
            <span className="block w-32 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mt-2 mx-auto animate-pulse"></span>
          </h2>

          <p className="text-lg leading-relaxed text-center">
            I love building <strong>AI-powered applications</strong> that make life easier.  
            From **smart predictions** to **automating workflows**, I turn **complex data** into **real-world solutions**.
            Always experimenting, always learning.
          </p>
        </div>

        {/* Tech Stack Section */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {techStack.map((tech) => (
            <div
              key={tech.name}
              className="bg-[#181824] p-6 rounded-xl shadow-lg flex flex-col items-center transform transition duration-300 hover:scale-105 hover:rotate-2 hover:shadow-purple-500/50"
            >
              {tech.icon}
              <span className="mt-3 text-sm font-semibold">{tech.name}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
