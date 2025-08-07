// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dinesh Dawonauth - Full Stack Developer & ML Engineer",
  description:
    "Personal portfolio showcasing innovative web development, machine learning projects, and interactive experiences.",
  keywords: [
    "Full Stack Developer",
    "Machine Learning",
    "Next.js",
    "Three.js",
    "React",
  ],
  authors: [{ name: "Dinesh Dawonauth" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1d4ed8",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
