import "./globals.css";
import Navbar from "@/components/Navbar";
import BackgroundParticles from "@/components/BackgroundParticles";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white flex flex-col items-center justify-center min-h-screen">
        <BackgroundParticles />
        <Navbar />
        <main className="w-full flex flex-col items-center justify-center">
          {children}
        </main>
      </body>
    </html>
  );
}
