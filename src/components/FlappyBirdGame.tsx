"use client";
import { useEffect, useRef, useState, useCallback } from "react";

// ✅ Define Pipe Type
type Pipe = {
  x: number;
  height: number;
  passed: boolean;
};

export default function FlappyBirdGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameRunning, setGameRunning] = useState(false);
  const birdYRef = useRef(250);
  const velocityYRef = useRef(0);
  const pipesRef = useRef<Pipe[]>([]);
  const scoreRef = useRef(0);
  const [score, setScore] = useState(0);

  const gravity = 0.5;
  const pipeWidth = 60;
  const pipeGap = 150;

  // ✅ Smooth Jump Function (Bird velocity updates smoothly)
  const jump = useCallback(() => {
    if (!gameRunning) return;
    console.log("Jump triggered!");
    velocityYRef.current = -8; // ✅ Jump starts smoothly with velocityY
  }, [gameRunning]);

  // ✅ Reset Game Function
  const resetGame = useCallback(() => {
    console.log("Game Reset!");
    birdYRef.current = 250;
    velocityYRef.current = 0;
    pipesRef.current = [];
    scoreRef.current = 0;
    setScore(0);
  }, []);

  // ✅ Game Loop (Ensures continuous gravity & bird motion)
  useEffect(() => {
    if (!gameRunning) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let running = true;

    function gameLoop() {
      if (!running || !ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0A0A0F";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // ✅ Bird Drawing
      ctx.fillStyle = "#D946EF";
      ctx.beginPath();
      ctx.arc(50, birdYRef.current, 15, 0, Math.PI * 2);
      ctx.fill();

      // ✅ Apply Gravity Smoothly
      velocityYRef.current += gravity;
      birdYRef.current = Math.max(birdYRef.current + velocityYRef.current, 0);
      console.log(
        "Updated Bird Position:",
        birdYRef.current,
        "VelocityY:",
        velocityYRef.current
      );

      pipesRef.current = pipesRef.current
        .map((pipe) => {
          ctx.fillStyle = "#6B46C1";
          ctx.fillRect(pipe.x, 0, pipeWidth, pipe.height);
          ctx.fillRect(
            pipe.x,
            pipe.height + pipeGap,
            pipeWidth,
            canvas.height - pipe.height - pipeGap
          );

          // ✅ Collision Detection
          if (
            (50 + 15 > pipe.x &&
              50 - 15 < pipe.x + pipeWidth &&
              (birdYRef.current - 15 < pipe.height ||
                birdYRef.current + 15 > pipe.height + pipeGap)) ||
            birdYRef.current + 15 >= canvas.height
          ) {
            running = false;
            setGameRunning(false);
            console.log("Collision Detected! Game Over.");
            alert(`Game Over! Score: ${scoreRef.current}`);
            return null;
          }

          // ✅ Score Update - Ensures score increments only once per pipe
          if (!pipe.passed && pipe.x + pipeWidth < 50) {
            console.log("Pipe Passed! Incrementing Score.");
            pipe.passed = true;
            scoreRef.current += 1;
            setScore(scoreRef.current);
          }

          return { ...pipe, x: pipe.x - 3 };
        })
        .filter(Boolean) as Pipe[];

      requestAnimationFrame(gameLoop);
    }

    gameLoop();
  }, [gameRunning]);

  // ✅ Start Game Function
  const startGame = () => {
    console.log("Game Started!");
    resetGame();
    setGameRunning(true);
  };

  useEffect(() => {
    if (!gameRunning) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleJump = () => {
      console.log("Mouse Click Detected! Triggering Jump.");
      jump();
    };
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        console.log("Spacebar Pressed! Triggering Jump.");
        jump();
      }
    };

    canvas.addEventListener("click", handleJump);
    window.addEventListener("keydown", handleKeyPress);

    const pipeInterval = setInterval(() => {
      if (gameRunning) {
        const minHeight = 50;
        const maxHeight = canvas.height - pipeGap - minHeight;
        const pipeHeight = Math.floor(
          Math.random() * (maxHeight - minHeight) + minHeight
        );
        pipesRef.current.push({
          x: canvas.width,
          height: pipeHeight,
          passed: false,
        });
        console.log("New Pipe Created:", {
          x: canvas.width,
          height: pipeHeight,
        });
      }
    }, 2000);

    return () => {
      clearInterval(pipeInterval);
      canvas.removeEventListener("click", handleJump);
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [gameRunning, jump]);

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        width={400}
        height={500}
        className="border border-purple-500 rounded-lg"
      />
      <p className="mt-2 text-white font-semibold">Score: {score}</p>
      <button
        className="mt-4 px-6 py-2 bg-purple-500 text-white font-bold rounded-lg hover:scale-105 transition transform"
        onClick={startGame}
      >
        Start Game
      </button>
    </div>
  );
}
