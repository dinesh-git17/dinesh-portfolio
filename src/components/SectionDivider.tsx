"use client";
import { FaRobot } from "react-icons/fa"; // Import robot icon

export default function SectionDivider() {
  return (
    <div className="relative w-full flex items-center justify-center my-6">
      {/* Left Robot */}
      <FaRobot className="text-purple-500 text-2xl animate-bounce" />

      {/* Main Line */}
      <div className="w-3/4 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-2 relative">
        {/* Glowing Effect */}
        <div className="absolute top-0 left-0 w-full h-full blur-md opacity-50 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
      </div>

      {/* Right Robot */}
      <FaRobot className="text-purple-500 text-2xl animate-bounce" />
    </div>
  );
}
