"use client";
import { useEffect, useState } from "react";
import FloatingDots from "@/components/FloatingDots";
import {
  FaPaperPlane,
  FaEnvelope,
  FaUser,
  FaCommentDots,
  FaInstagram,
  FaGithub,
  FaLinkedin,
} from "react-icons/fa";

export default function ContactPage() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setHasMounted(true);
      console.log(
        "%c📬 Contact Page Fully Mounted",
        "color: cyan; font-weight: bold;"
      );
    }, 500);
  }, []);

  if (!hasMounted) return null;

  return (
    <section
      id="contact"
      className="relative w-full min-h-screen flex flex-col items-center justify-center bg-inherit text-inherit font-inter overflow-hidden px-4 pt-12 md:pt-16"
    >
      {/* Floating Dots Background */}
      <FloatingDots />

      {/* Content Wrapper */}
      <div className="max-w-4xl mx-auto flex flex-col gap-6 items-center relative z-10 w-full">
        {/* Get in Touch Card */}
        <div className="bg-[#181824] w-full max-w-3xl p-6 rounded-xl shadow-lg flex flex-col items-center space-y-3 transform transition duration-300 hover:scale-105 hover:shadow-purple-500/50 h-auto flex-1 overflow-hidden">
          <FaPaperPlane className="text-purple-400 text-4xl" />

          <h2 className="text-3xl md:text-4xl font-extrabold tracking-wide text-center relative">
            Get In Touch
            <span className="block w-32 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mt-2 mx-auto animate-pulse"></span>
          </h2>

          {/* Contact Form */}
          <form className="w-full flex flex-col gap-4">
            <div className="relative w-full">
              <FaUser className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Your Name"
                className="w-full bg-[#1e1e2e] text-white p-3 pl-10 rounded-lg shadow-md outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>

            <div className="relative w-full">
              <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                placeholder="Your Email"
                className="w-full bg-[#1e1e2e] text-white p-3 pl-10 rounded-lg shadow-md outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>

            <div className="relative w-full">
              <FaCommentDots className="absolute left-3 top-3 text-gray-400" />
              <textarea
                placeholder="Your Message"
                rows={4}
                className="w-full bg-[#1e1e2e] text-white p-3 pl-10 rounded-lg shadow-md outline-none focus:ring-2 focus:ring-purple-500 transition"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white font-semibold p-3 rounded-lg shadow-md hover:scale-105 transition transform"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Social Media Card */}
        <div className="bg-[#181824] w-full max-w-3xl p-6 rounded-xl shadow-lg flex flex-col items-center space-y-3 transform transition duration-300 hover:scale-105 hover:shadow-purple-500/50 h-auto flex-1 overflow-hidden">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-wide text-center relative">
            Social Media
            <span className="block w-24 h-1 bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 rounded-full mt-2 mx-auto animate-pulse"></span>
          </h2>

          {/* Social Media Icons */}
          <div className="flex space-x-6">
            <a
              href="https://www.instagram.com/yourhandle"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1e1e2e] p-4 rounded-xl shadow-md flex items-center justify-center transition duration-300 transform hover:scale-110 hover:shadow-purple-500/50"
            >
              <FaInstagram className="text-pink-500 text-3xl" />
            </a>

            <a
              href="https://github.com/dinesh-git17"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1e1e2e] p-4 rounded-xl shadow-md flex items-center justify-center transition duration-300 transform hover:scale-110 hover:shadow-purple-500/50"
            >
              <FaGithub className="text-white text-3xl" />
            </a>

            <a
              href="https://www.linkedin.com/in/dineshsdawonauth"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1e1e2e] p-4 rounded-xl shadow-md flex items-center justify-center transition duration-300 transform hover:scale-110 hover:shadow-purple-500/50"
            >
              <FaLinkedin className="text-blue-400 text-3xl" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
