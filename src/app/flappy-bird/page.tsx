"use client";
import FlappyBirdGame from "../../components/FlappyBirdGame";

export default function FlappyBirdPage() {
  return (
    <section className="flex flex-col items-center justify-center h-screen bg-[#0A0A0F] text-white">
      <h1 className="text-4xl font-bold mb-4 text-purple-400">
        Flappy Bird AI
      </h1>
      <FlappyBirdGame />
    </section>
  );
}
