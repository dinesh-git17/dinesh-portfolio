"use client";
import { useEffect, useState } from "react";
import FloatingDots from "./FloatingDots";
import { FaPython, FaReact, FaNodeJs, FaDatabase, FaTerminal } from "react-icons/fa";
import { SiNextdotjs, SiTailwindcss, SiTensorflow, SiPytorch, SiScikitlearn, SiPandas, SiMysql } from "react-icons/si";

const techStack = [
  { name: "Python", icon: <FaPython className="text-blue-500" /> },
  { name: "SQL", icon: <FaDatabase className="text-yellow-400" /> },
  { name: "Bash / Shell", icon: <FaTerminal className="text-gray-400" /> },
  { name: "React", icon: <FaReact className="text-blue-400" /> },
  { name: "Next.js", icon: <SiNextdotjs className="text-white" /> },
  { name: "Node.js", icon: <FaNodeJs className="text-green-500" /> },
  { name: "Tailwind CSS", icon: <SiTailwindcss className="text-cyan-400" /> },
  { name: "TensorFlow", icon: <SiTensorflow className="text-orange-400" /> },
  { name: "PyTorch", icon: <SiPytorch className="text-red-500" /> },
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
        {/* About Me Text */}
        <div className="flex flex-col space-y-6">
          <h2 className="text-5xl font-extrabold tracking-wide text-center md:text-left relative">
            About Me
            <span className="block w-24 h-1 bg-blue-500 mt-2 mx-auto md:mx-0"></span>
          </h2>

          <p className="text-lg leading-relaxed">
            I am a <strong>results-driven Machine Learning & Data Science specialist</strong> passionate about building AI-powered solutions.
            My expertise includes <strong>predictive modeling, cloud deployment, and data pipeline automation</strong>, leveraging the latest
            advancements in <strong>Deep Learning, NLP, and MLOps</strong> to solve real-world challenges.
          </p>
        </div>

        {/* Tech Stack Section */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {techStack.map((tech) => (
            <div key={tech.name} className="bg-gray-900 p-6 rounded-xl shadow-md flex flex-col items-center transform transition duration-300 hover:scale-105 hover:shadow-blue-500/50">
              {tech.icon}
              <span className="mt-3 text-sm font-semibold">{tech.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
