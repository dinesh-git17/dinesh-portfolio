"use client";

import { motion } from "framer-motion";
import ExperienceCard from "@/components/About/ExperienceCard";
import SkillItem from "@/components/About/SkillItem";


const About = () => {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 md:px-12 lg:px-24 bg-[#0a0a0a] text-white">
      {/* Hero Section */}
      <motion.div
        className="text-center mt-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl md:text-6xl font-extrabold text-[#50dcff]">
          About Me
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-400">
          Passionate Data Scientist & AI Enthusiast
        </p>
      </motion.div>

      {/* Bio Section */}
      <motion.section
        className="mt-12 max-w-3xl text-center"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <p className="text-gray-300 text-lg">
          I'm Dinesh, a data scientist with a passion for **AI, Machine
          Learning, and Data Analysis**. I thrive on solving complex problems
          with **data-driven insights** and building **cutting-edge AI models**.
        </p>
        <p className="mt-4 text-gray-400">
          With a strong background in **Python, TensorFlow, PyTorch, and
          Data Visualization**, I love **turning data into actionable
          intelligence**.
        </p>
      </motion.section>

      {/* Skills Section */}
      <motion.section
        className="mt-16 w-full max-w-4xl"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7, duration: 0.8 }}
      >
        <h2 className="text-2xl font-semibold text-[#50dcff]">Skills</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 text-center">
          {[
            "Python",
            "Machine Learning",
            "Deep Learning",
            "NLP",
            "Data Visualization",
            "TensorFlow",
            "PyTorch",
            "SQL",
            "Pandas",
            "NumPy",
            "Matplotlib",
          ].map((skill, index) => (
            <SkillItem key={index} skill={skill} />
          ))}
        </div>
      </motion.section>

      {/* Experience Section */}
      <motion.section
        className="mt-16 w-full max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.8 }}
      >
        <h2 className="text-2xl font-semibold text-[#50dcff]">Experience</h2>
        <div className="mt-6 space-y-6">
          {[
            {
              role: "Machine Learning Engineer",
              company: "Tech AI Solutions",
              duration: "2023 - Present",
            },
            {
              role: "Data Scientist",
              company: "Data Insights Co.",
              duration: "2021 - 2023",
            },
            {
              role: "AI Research Intern",
              company: "University AI Lab",
              duration: "2020 - 2021",
            },
          ].map((exp, index) => (
            <ExperienceCard key={index} {...exp} />
          ))}
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.div
        className="mt-16 text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <p className="text-gray-300">Want to collaborate?</p>
        <a
          href="mailto:dinesh@example.com"
          className="mt-4 inline-block bg-[#50dcff] text-black font-bold px-6 py-2 rounded-lg hover:bg-[#40c0e0] transition"
        >
          Get in Touch
        </a>
      </motion.div>
    </main>
  );
};

export default About;
