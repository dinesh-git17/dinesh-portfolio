"use client";
import { ReactNode, useEffect, useState } from "react";
import ConnectingDots from "@/components/ConnectingDots";
import Navbar from "@/components/Navbar";
import "@/app/globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  const [showNavbar, setShowNavbar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowNavbar(window.scrollY > window.innerHeight * 0.8); // Navbar appears after scrolling
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <html lang="en">
      <body>
        {showNavbar && <Navbar />}
        <ConnectingDots />
        <main>{children}</main>
      </body>
    </html>
  );
}
