"use client";

import { motion } from "framer-motion";

// Define TypeScript Interface for Props
interface ExperienceCardProps {
  role: string;
  company: string;
  duration: string;
}

const ExperienceCard: React.FC<ExperienceCardProps> = ({
  role,
  company,
  duration,
}) => {
  return (
    <motion.div
      className="bg-[#1a1a1a] p-4 rounded-lg"
      whileHover={{ scale: 1.05 }}
    >
      <h3 className="text-lg text-[#50dcff] font-bold">{role}</h3>
      <p className="text-gray-300">{company}</p>
      <p className="text-gray-400 text-sm">{duration}</p>
    </motion.div>
  );
};

export default ExperienceCard;
