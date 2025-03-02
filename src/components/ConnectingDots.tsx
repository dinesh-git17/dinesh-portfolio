"use client";

import { useEffect, useRef } from "react";

// Dot interface
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
  const mouse = useRef({ x: -999, y: -999 });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Connecting dots
    const connectingDots: Dot[] = [];
    const numConnectingDots = 400;
    for (let i = 0; i < numConnectingDots; i++) {
      connectingDots.push({
        x: randomInRange(0, width),
        y: randomInRange(0, height),
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: randomInRange(2, 3),
        color: "rgba(160, 32, 240, 0.9)", // Futuristic space purple
      });
    }

    // Floating dots
    const floatingDots: Dot[] = [];
    const numFloatingDots = 40;
    for (let i = 0; i < numFloatingDots; i++) {
      floatingDots.push({
        x: randomInRange(0, width),
        y: randomInRange(0, height),
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: randomInRange(2, 4),
        color:
          Math.random() > 0.5
            ? "rgba(128, 0, 128, 0.8)"
            : "rgba(75, 0, 130, 0.8)", // Deep purple hues
      });
    }

    // Configuration settings
    const visibleRadius = 500;
    const cursorConnectionDistance = 120;
    const dotConnectionDistance = 90;
    const minDotConnectionDistance = 30;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Update floating dots
      floatingDots.forEach((dot) => {
        dot.x += dot.vx;
        dot.y += dot.vy;
        if (dot.x < 0 || dot.x > width) dot.vx = -dot.vx;
        if (dot.y < 0 || dot.y > height) dot.vy = -dot.vy;
      });

      // Draw floating dots
      floatingDots.forEach((dot) => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = dot.color;
        ctx.fill();
      });

      // Filter connecting dots within the mouse area
      const dotsLinkedToCursor = connectingDots.filter((dot) => {
        return (
          Math.hypot(dot.x - mouse.current.x, dot.y - mouse.current.y) <
          visibleRadius
        );
      });

      // Draw connections from the cursor only
      dotsLinkedToCursor.forEach((dot) => {
        const d = Math.hypot(dot.x - mouse.current.x, dot.y - mouse.current.y);
        if (d < cursorConnectionDistance) {
          ctx.beginPath();
          ctx.moveTo(mouse.current.x, mouse.current.y);
          ctx.lineTo(dot.x, dot.y);
          ctx.strokeStyle = `rgba(160, 32, 240,${1 - d / cursorConnectionDistance})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      });

      // Draw connected dots
      dotsLinkedToCursor.forEach((dot) => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(160, 32, 240, 0.8)`;
        ctx.fill();
      });

      // Ensure dots **only** connect to other dots **if** first connected to cursor
      for (let i = 0; i < dotsLinkedToCursor.length; i++) {
        for (let j = i + 1; j < dotsLinkedToCursor.length; j++) {
          const dotA = dotsLinkedToCursor[i];
          const dotB = dotsLinkedToCursor[j];
          const dist = Math.hypot(dotA.x - dotB.x, dotA.y - dotB.y);
          if (dist < dotConnectionDistance && dist > minDotConnectionDistance) {
            ctx.beginPath();
            ctx.moveTo(dotA.x, dotA.y);
            ctx.lineTo(dotB.x, dotB.y);
            ctx.strokeStyle = `rgba(160, 32, 240,${1 - dist / dotConnectionDistance})`;
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

    requestAnimationFrame(animate);

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
