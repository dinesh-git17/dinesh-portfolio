// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ConnectingDots from "@/components/ConnectingDots"; // Import effect
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dinesh Dawonauth - Portfolio",
  description: "Data Scientist | Machine Learning Enthusiast | Portfolio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body className={`${inter.className} bg-[#1C1C28] text-white`}>
        {/* Navbar should be the highest layer */}
        <Navbar />

        {/* Connecting Dots Effect (Behind Everything) */}
        <div className="absolute inset-0 z-0">
          <ConnectingDots />
        </div>

        {/* Main Content */}
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  );
}
