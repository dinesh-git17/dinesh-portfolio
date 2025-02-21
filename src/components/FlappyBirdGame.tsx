"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import FloatingDots from "@/components/FloatingDots";

// ✅ Define Pipe Type
type Pipe = {
  x: number;
  height: number;
  passed: boolean;
};

export default function FlappyBirdGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false); // ✅ Track game over state
  const birdYRef = useRef(250);
  const velocityYRef = useRef(0);
  const pipesRef = useRef<Pipe[]>([]);
  const scoreRef = useRef(0);
  const [score, setScore] = useState(0);
  const [rocketLoaded, setRocketLoaded] = useState(false);
  const rocketImg = useRef<HTMLImageElement | null>(null);
  const rocketAngleRef = useRef(0);
  const [highScore, setHighScore] = useState(0); // ✅ High Score State
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false); // ✅ For smooth fade transition

  const gravity = 0.5;
  const pipeWidth = 60;
  const pipeGap = 150;
  const rotationSmoothness = 0.1;

  // ✅ Preload Rocket Image
  useEffect(() => {
    const rocket = new Image();
    rocket.src = "/rocket.png";
    rocket.onload = () => {
      setRocketLoaded(true);
      rocketImg.current = rocket;
    };
  }, []);

  useEffect(() => {
    const savedHighScore = localStorage.getItem("highScore");
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  // ✅ Linear Interpolation Function (Lerp) for smooth rotation
  const lerp = (start: number, end: number, factor: number) =>
    start + (end - start) * factor;

  // ✅ Smooth Jump Function
  const jump = useCallback(() => {
    if (!gameRunning || gameOver) return;
    velocityYRef.current = -8;
    rocketAngleRef.current = 0.3;
  }, [gameRunning, gameOver]);

  const resetGame = useCallback(() => {
    setGameOver(false);
    setGameRunning(true);

    // ✅ Ensure High Score updates BEFORE resetting the game
    setHighScore((prevHighScore) => {
      const newHighScore = Math.max(prevHighScore, scoreRef.current);
      localStorage.setItem("highScore", newHighScore.toString());
      return newHighScore;
    });

    // ✅ Reset game state
    birdYRef.current = 250;
    velocityYRef.current = 0;
    pipesRef.current = [];
    scoreRef.current = 0;
    setScore(0);
    rocketAngleRef.current = 0;
  }, []);

  // ✅ Game Loop
  useEffect(() => {
    if (!gameRunning || gameOver || !rocketLoaded || !rocketImg.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let running = true;

    function gameLoop() {
      if (!running || !ctx || !canvas || !rocketImg.current) return;

      // ✅ Apply the same gradient background as the Game Over screen
      const backgroundGradient = ctx.createLinearGradient(
        0,
        0,
        0,
        canvas.height
      );
      backgroundGradient.addColorStop(0, "#1e1e2e");
      backgroundGradient.addColorStop(0.4, "#15131a");
      backgroundGradient.addColorStop(1, "#0A0A0F");

      ctx.fillStyle = backgroundGradient; // ✅ Apply matching background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // ✅ Draw Score with Modern UI Styling
      const gradient = ctx.createLinearGradient(20, 0, 200, 0);
      gradient.addColorStop(0, "#8b5cf6"); // Purple
      gradient.addColorStop(0.5, "#ec4899"); // Pink
      gradient.addColorStop(1, "#3b82f6"); // Blue

      ctx.fillStyle = gradient; // ✅ Gradient color effect
      ctx.font = "bold 20px 'Inter', sans-serif"; // ✅ Uses website font
      ctx.textAlign = "left";
      ctx.shadowColor = "rgba(255, 255, 255, 0.4)"; // ✅ Adds a soft glow effect
      ctx.shadowBlur = 8;
      ctx.fillText(`Score: ${scoreRef.current}`, 20, 50); // ✅ Adjusted positioning for better alignment

      // ✅ Stop rendering objects when Game Over
      if (gameOver) return; // ✅ Prevents further drawing

      // ✅ Define Rocket Position BEFORE Using It
      const rocketX = 50;
      const rocketY = birdYRef.current;

      // ✅ Apply Gravity Smoothly (Only if Game is Running)
      velocityYRef.current += gravity;
      birdYRef.current = Math.max(birdYRef.current + velocityYRef.current, 0);

      // ✅ Smoothly transition the rocket's rotation angle
      const targetAngle = Math.min(
        Math.max(velocityYRef.current * 0.07, -0.6),
        0.5
      );
      rocketAngleRef.current = lerp(
        rocketAngleRef.current,
        targetAngle,
        rotationSmoothness
      );

      // ✅ Draw Rocket with Smooth Rotation (Only if Game is Running)
      ctx.save();
      ctx.translate(rocketX, rocketY);
      ctx.rotate(rocketAngleRef.current);
      ctx.drawImage(rocketImg.current, -20, -20, 40, 40);
      ctx.restore();

      // ✅ Draw Modernized Pipes (Only if Game is Running)
      pipesRef.current = pipesRef.current
        .map((pipe) => {
          const gradient = ctx.createLinearGradient(
            pipe.x,
            0,
            pipe.x + pipeWidth,
            0
          );
          gradient.addColorStop(0, "#6B46C1");
          gradient.addColorStop(1, "#D946EF");

          ctx.fillStyle = gradient;
          ctx.shadowColor = "#D946EF";
          ctx.shadowBlur = 10;

          ctx.fillRect(pipe.x, 0, pipeWidth, pipe.height);
          ctx.fillRect(
            pipe.x,
            pipe.height + pipeGap,
            pipeWidth,
            canvas.height - pipe.height - pipeGap
          );

          // collision detection
          if (
            (rocketX + 15 > pipe.x &&
              rocketX - 15 < pipe.x + pipeWidth &&
              (rocketY - 15 < pipe.height ||
                rocketY + 15 > pipe.height + pipeGap)) ||
            rocketY + 15 >= canvas.height
          ) {
            running = false;
            setGameRunning(false);
            setIsTransitioning(true); // ✅ Prevents glitches
            setIsFadingOut(true); // ✅ Start the fade-out effect

            // ✅ Stop Game Rendering Immediately
            pipesRef.current = [];

            // ✅ Ensure High Score Updates BEFORE setting Game Over
            setHighScore((prevHighScore) => {
              const newHighScore = Math.max(prevHighScore, scoreRef.current);
              localStorage.setItem("highScore", newHighScore.toString());
              return newHighScore;
            });

            // ✅ Delay the Game Over screen appearance (Smooth Transition)
            setTimeout(() => {
              setGameOver(true);
              setIsFadingOut(false); // ✅ Reset fade state
              setIsTransitioning(false);
            }, 800); // ✅ 800ms delay ensures a smooth transition
          }

          // ✅ Score Update
          if (!pipe.passed && pipe.x + pipeWidth < 50) {
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
  }, [gameRunning, gameOver, rocketLoaded]);

  useEffect(() => {
    if (!gameRunning || gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleJump = () => jump();
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === "Space") jump();
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
      }
    }, 2000);

    return () => {
      clearInterval(pipeInterval);
      canvas.removeEventListener("click", handleJump);
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [gameRunning, gameOver, jump]);

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center bg-inherit text-inherit font-inter overflow-hidden">
      {/* ✅ Floating Dots Background */}
      <FloatingDots />

      {/* ✅ Game Card Wrapper - Keeps everything centered and inside the game */}
      <div className="relative flex flex-col items-center">
        {/* ✅ Display Running Score inside the Game Card */}
        {gameRunning && !gameOver && (
          <div
            className={`absolute top-4 left-4 bg-[#1e1e2e] px-4 py-2 rounded-lg shadow-md border border-yellow-500 transition-opacity duration-500 ${
              isFadingOut ? "opacity-0" : "opacity-100"
            }`}
          >
            <p className="text-yellow-400 text-xl font-bold tracking-wide drop-shadow-md">
              Score: {score}
            </p>
          </div>
        )}

        {/* ✅ Game Canvas & Card with a Modern Border */}
        <div
          className={`relative rounded-xl shadow-lg transition-opacity duration-700 ${
            isFadingOut ? "opacity-0" : "opacity-100"
          }`}
          style={{
            width: "480px",
            height: "600px",
            padding: "4px", // ✅ Adds space for the border
            borderRadius: "16px", // ✅ Smooth rounded edges
            border: "2px solid transparent", // ✅ Transparent border (base)
            background:
              "linear-gradient(#1e1e2e, #1e1e2e), radial-gradient(circle at top, #8b5cf6, #ec4899, #3b82f6)", // ✅ Gradient border effect
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
          }}
        >
          <canvas
            ref={canvasRef}
            width={480}
            height={600}
            className="rounded-lg shadow-inner w-full h-full"
          />
        </div>

        {/* ✅ Game Over Screen with Modern Border */}
        {gameOver && !isFadingOut && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-700 animate-fadeIn"
            style={{
              width: "480px",
              height: "600px",
              padding: "4px", // ✅ Adds space for the border
              borderRadius: "16px", // ✅ Smooth rounded edges
              border: "2px solid transparent", // ✅ Transparent border (base)
              background:
                "linear-gradient(#1e1e2e, #1e1e2e), radial-gradient(circle at top, #8b5cf6, #ec4899, #3b82f6)", // ✅ Gradient border effect
              backgroundOrigin: "border-box",
              backgroundClip: "padding-box, border-box",
            }}
          >
            {/* ✅ Game Over Text */}
            <h1
              className="font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-500 drop-shadow-lg animate-pulse whitespace-nowrap"
              style={{
                fontSize: "40px",
                lineHeight: "1.2",
                textAlign: "center",
              }}
            >
              GAME OVER
            </h1>

            {/* ✅ Score & High Score Card */}
            <div
              className="bg-[#181824] p-6 rounded-xl shadow-md flex flex-col items-center space-y-4 transition duration-300 hover:scale-105 hover:shadow-purple-500/50 mt-6"
              style={{
                width: "320px",
              }}
            >
              <table className="w-full text-lg font-semibold text-gray-300 border-separate border-spacing-y-3">
                <tbody>
                  <tr className="border-b border-gray-600">
                    <td className="py-2 text-left flex justify-between w-full">
                      <span>Score</span>
                      <span className="opacity-0 mx-4">|</span>
                      <span className="text-yellow-400">{score}</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-left flex justify-between w-full">
                      <span>High Score</span>
                      <span className="opacity-0 mx-4">|</span>
                      <span className="text-pink-400">{highScore}</span>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* ✅ Play Again Button - Now Inside the Card */}
              <button
                className="w-[180px] py-2 text-md font-semibold text-white bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-lg shadow-md hover:scale-105 hover:shadow-purple-500/50 transition-all duration-300"
                onClick={() => {
                  setGameRunning(true); // ✅ Restart game instantly
                  resetGame(); // ✅ Reset all states properly
                }}
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ✅ Hide the "Start Game" button during transition & when game is running */}
      {!gameRunning && !gameOver && !isTransitioning && (
        <button
          className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:scale-105 transition transform"
          onClick={() => {
            setGameRunning(true); // ✅ Ensure instant state update
            resetGame(); // ✅ Reset game fully before rendering first frame
          }}
        >
          Start Game
        </button>
      )}
    </div>
  );
}
