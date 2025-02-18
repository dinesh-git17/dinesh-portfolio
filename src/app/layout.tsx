// src/app/layout.tsx
import "./globals.css";           // Import your global styles
import Navbar from "@/components/Navbar";
import ConnectingDots from "@/components/ConnectingDots";

export const metadata = {
  title: "Dinesh Portfolio",
  description: "My personal portfolio website",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white min-h-screen relative overflow-hidden">
        {/* Your existing Navbar (client component) */}
        <Navbar />

        {/* The connecting-dots effect behind everything */}
        <ConnectingDots />

        {/* The main area where page.tsx content goes */}
        <main className="w-full flex flex-col items-center justify-center">
          {children}
        </main>
      </body>
    </html>
  );
}
