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

  // ✅ Reset Game Function
  const resetGame = useCallback(() => {
    let newHighScore = highScore;

    // ✅ Ensure High Score updates BEFORE setting game over state
    if (scoreRef.current > highScore) {
      newHighScore = scoreRef.current;
      setHighScore(newHighScore);
      localStorage.setItem("highScore", newHighScore.toString());
    }

    // ✅ Reset game state
    birdYRef.current = 250;
    velocityYRef.current = 0;
    pipesRef.current = [];
    scoreRef.current = 0;
    setScore(0);
    rocketAngleRef.current = 0;
    setGameOver(false);
    setGameRunning(true);
  }, [highScore]);

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

      // ✅ Always clear the canvas to prevent ghosting
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0A0A0F";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

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

          // ✅ Collision Detection (Ensures Smooth Transition to Game Over)
          if (
            (rocketX + 15 > pipe.x &&
              rocketX - 15 < pipe.x + pipeWidth &&
              (rocketY - 15 < pipe.height ||
                rocketY + 15 > pipe.height + pipeGap)) ||
            rocketY + 15 >= canvas.height
          ) {
            running = false;
            setGameRunning(false);
            setIsTransitioning(true); // ✅ Prevents the button from showing too early

            // ✅ Stop Game Rendering Immediately
            pipesRef.current = [];

            // ✅ Force Full Canvas Clear (No Leftover Pipes)
            requestAnimationFrame(() => {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.fillStyle = "#0A0A0F";
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            });

            // ✅ Pause for a brief moment before showing Game Over (Smooth Transition)
            setTimeout(() => {
              setGameOver(true);
              setIsTransitioning(false); // ✅ Re-enable button only when transition is complete
            }, 500); // ✅ 500ms pause prevents an instant jump
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
    <div className="flex flex-col items-center relative">
      <canvas
        ref={canvasRef}
        width={400}
        height={500}
        className="border border-purple-500 rounded-lg shadow-xl"
      />

      {/* ✅ Game Over Screen with Guaranteed Wider Score Card */}
      {gameOver && (
        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-black via-purple-900 to-black z-50">
          {/* ✅ Game Over Text */}
          <h1
            className="font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 drop-shadow-lg animate-pulse whitespace-nowrap"
            style={{
              fontSize: "40px",
              lineHeight: "1.2",
              textAlign: "center",
              position: "absolute",
              top: "22%",
              width: "320px", // ✅ Ensures "Game Over" and card match in width
            }}
          >
            GAME OVER
          </h1>

          {/* ✅ Score & High Score - Properly Wider Card */}
          <div
            className="bg-[#1e1e2e] p-5 rounded-xl shadow-md flex flex-col items-center space-y-3 transition duration-300 hover:scale-105 hover:shadow-purple-500/50"
            style={{
              position: "absolute",
              top: "45%",
              width: "220px", // ✅ Explicitly setting width so it matches "Game Over"
            }}
          >
            <table className="w-full text-lg font-semibold text-gray-300 border-separate border-spacing-y-3">
              <tbody>
                <tr className="border-b border-gray-600">
                  <td className="py-2 text-left flex justify-between w-full">
                    <span>Score</span>
                    <span className="opacity-0 mx-4">|</span>{" "}
                    {/* ✅ Imaginary Divider */}
                    <span className="text-yellow-400">{score}</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 text-left flex justify-between w-full">
                    <span>High Score</span>
                    <span className="opacity-0 mx-4">|</span>{" "}
                    {/* ✅ Imaginary Divider */}
                    <span className="text-pink-400">{highScore}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

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
