// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ConnectingDots from "@/components/ConnectingDots"; // Import effect

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dinesh Dawonauth - Portfolio",
  description: "Data Scientist | Machine Learning Enthusiast | Portfolio",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body className={`${inter.className} bg-[#1C1C28] text-white`}>
        {/* Connecting Dots Background */}
        <ConnectingDots />

        {/* Main Content */}
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  );
}
