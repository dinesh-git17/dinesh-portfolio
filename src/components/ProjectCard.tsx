import React from "react";

interface ProjectCardProps {
  name: string;
  description: string;
  url: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  name,
  description,
  url,
}) => {
  return (
    <div className="bg-gray-800 p-5 rounded-lg shadow-lg transition-transform transform hover:scale-105 hover:shadow-2xl">
      <h3 className="text-2xl font-bold text-blue-300">{name}</h3>
      <p className="text-gray-300 mt-2 mb-4 text-sm opacity-90 leading-relaxed">
        {description || "No description available."}
      </p>
      <a
        href={url}
        className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-all"
        target="_blank"
        rel="noopener noreferrer"
      >
        🚀 View Repository
      </a>
    </div>
  );
};

export default ProjectCard;
