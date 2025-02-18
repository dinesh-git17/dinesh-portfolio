"use client";

import { useEffect, useRef } from "react";

interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

const randomInRange = (min: number, max: number) =>
  Math.random() * (max - min) + min;

export default function ConnectingDots() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Initialize mouse with dummy values; they'll be updated on mount.
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Set initial mouse position to the center of the viewport.
    mouse.current.x = window.innerWidth / 2;
    mouse.current.y = window.innerHeight / 2;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Create a set of dots.
    const dots: Dot[] = [];
    const numDots = 450; // Increased number of dots.
    for (let i = 0; i < numDots; i++) {
      dots.push({
        x: randomInRange(0, width),
        y: randomInRange(0, height),
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: randomInRange(1.5, 3),
        color: "rgba(180,80,180,0.8)", // purple-ish
      });
    }

    // Configuration parameters.
    const visibleRadius = 500; // Increased visible area.
    const cursorConnectionDistance = 150;
    const dotConnectionDistance = 100;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Update dot positions.
      dots.forEach((dot) => {
        dot.x += dot.vx;
        dot.y += dot.vy;
        if (dot.x < 0 || dot.x > width) dot.vx = -dot.vx;
        if (dot.y < 0 || dot.y > height) dot.vy = -dot.vy;
      });

      // Filter dots that are within visible radius of the mouse.
      const visibleDots = dots.filter((dot) => {
        const d = Math.hypot(dot.x - mouse.current.x, dot.y - mouse.current.y);
        return d < visibleRadius;
      });

      // Draw visible dots.
      visibleDots.forEach((dot) => {
        const d = Math.hypot(dot.x - mouse.current.x, dot.y - mouse.current.y);
        const opacity = 1 - d / visibleRadius;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,80,180,${opacity})`;
        ctx.fill();
      });

      // Draw lines from the cursor to each dot within the connection distance.
      visibleDots.forEach((dot) => {
        const d = Math.hypot(dot.x - mouse.current.x, dot.y - mouse.current.y);
        if (d < cursorConnectionDistance) {
          const lineOpacity = 1 - d / cursorConnectionDistance;
          ctx.beginPath();
          ctx.moveTo(mouse.current.x, mouse.current.y);
          ctx.lineTo(dot.x, dot.y);
          ctx.strokeStyle = `rgba(180,80,180,${lineOpacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      // Draw lines connecting the dots to each other.
      for (let i = 0; i < visibleDots.length; i++) {
        for (let j = i + 1; j < visibleDots.length; j++) {
          const dotA = visibleDots[i];
          const dotB = visibleDots[j];
          const dist = Math.hypot(dotA.x - dotB.x, dotA.y - dotB.y);
          if (dist < dotConnectionDistance) {
            const lineOpacity = 1 - dist / dotConnectionDistance;
            ctx.beginPath();
            ctx.moveTo(dotA.x, dotA.y);
            ctx.lineTo(dotB.x, dotB.y);
            ctx.strokeStyle = `rgba(180,80,180,${lineOpacity * 0.8})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: -1,
      }}
    />
  );
}
