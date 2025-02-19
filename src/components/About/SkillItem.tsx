"use client";

import { motion } from "framer-motion";

// Define TypeScript Interface for Props
interface SkillItemProps {
  skill: string;
}

const SkillItem: React.FC<SkillItemProps> = ({ skill }) => {
  return (
    <motion.div
      className="bg-[#1a1a1a] px-4 py-2 rounded-lg text-gray-300 text-lg"
      whileHover={{ scale: 1.1, backgroundColor: "#50dcff", color: "#000" }}
    >
      {skill}
    </motion.div>
  );
};

export default SkillItem;
