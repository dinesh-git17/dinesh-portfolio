"use client";
import { useEffect, useState } from "react";
import { FaCodeBranch, FaExternalLinkAlt, FaLaptopCode } from "react-icons/fa";

// Define the correct type for repositories
interface Repository {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  updated_at: string;
  fork: boolean;
}

const generateAIDescription = (name: string): string => {
  const lowerName = name.toLowerCase();
  if (
    lowerName.includes("ml") ||
    lowerName.includes("ai") ||
    lowerName.includes("nn")
  ) {
    return "An AI-powered project exploring machine learning techniques.";
  } else if (
    lowerName.includes("web") ||
    lowerName.includes("frontend") ||
    lowerName.includes("react")
  ) {
    return "A modern web development project with interactive UI components.";
  } else if (
    lowerName.includes("data") ||
    lowerName.includes("analysis") ||
    lowerName.includes("pipeline")
  ) {
    return "A data-centric project focusing on processing and analysis.";
  } else {
    return "A personal project showcasing development and engineering skills.";
  }
};

const Projects = () => {
  const [projects, setProjects] = useState<Repository[]>([]);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setHasMounted(true);
      console.log(
        "%c🚀 Projects Component Fully Mounted",
        "color: cyan; font-weight: bold;"
      );
    }, 500);
  }, []);

  useEffect(() => {
    async function fetchRepositories() {
      try {
        const response = await fetch(
          "https://api.github.com/users/dinesh-git17/repos"
        );
        if (!response.ok) throw new Error("Failed to fetch repositories");

        const data: Repository[] = await response.json();
        const filteredProjects = data
          .filter((repo) => !repo.fork) // Exclude forked repos
          .sort(
            (a, b) =>
              new Date(b.updated_at).getTime() -
              new Date(a.updated_at).getTime()
          ); // Sort by last update

        setProjects(filteredProjects);
      } catch (error) {
        console.error("Error fetching repositories:", error);
      }
    }

    fetchRepositories();
  }, []);

  if (!hasMounted) return null;

  return (
    <section
      id="projects"
      className="relative w-full min-h-screen flex flex-col items-center justify-center bg-inherit text-inherit font-inter overflow-hidden px-4 pt-12 md:pt-16"
    >
      {/* Content Wrapper */}
      <div className="max-w-7xl mx-auto flex flex-col gap-6 items-center relative z-10 w-full justify-between">
        {/* Projects Header */}
        <div className="bg-[#181824] w-full max-w-3xl p-6 rounded-xl shadow-lg flex flex-col items-center space-y-3 transform transition duration-300 hover:scale-105 hover:shadow-purple-500/50">
          <FaLaptopCode className="text-purple-400 text-4xl" />
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-wide text-center relative">
            My Projects
            <span className="block w-32 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mt-2 mx-auto animate-pulse"></span>
          </h2>
          <p className="text-sm md:text-md leading-relaxed text-center px-2">
            Explore my latest <strong>AI and Web Development</strong> projects
            below.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="bg-[#181824] w-full max-w-7xl p-6 rounded-xl shadow-lg flex flex-col items-center space-y-4 h-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group bg-[#1e1e2e] p-6 rounded-xl shadow-md flex flex-col items-center transition duration-300 transform hover:scale-105 hover:shadow-purple-500/50 hover:ring-2 hover:ring-purple-500/60 w-full"
                onMouseEnter={(e) => {
                  console.log(
                    `%c🔍 Hovered Over: ${project.name}`,
                    "color: green; font-weight: bold;"
                  );
                  e.currentTarget.classList.add("animate-wiggle");
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.classList.remove("animate-wiggle");
                }}
              >
                <FaCodeBranch className="text-blue-400 text-4xl" />
                <h3 className="mt-3 text-lg font-semibold text-white text-center">
                  {project.name}
                </h3>
                <p className="text-xs text-gray-400 mt-2 text-center leading-relaxed opacity-90">
                  {project.description || generateAIDescription(project.name)}
                </p>
                <a
                  href={project.html_url}
                  className="mt-4 text-blue-400 font-medium text-sm flex items-center gap-2 transition-all duration-300 hover:text-blue-500 hover:underline hover:underline-offset-4"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Repository <FaExternalLinkAlt className="text-xs" />
                </a>
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
};

export default Projects;
