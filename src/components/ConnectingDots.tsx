// src/components/ConnectingDots.tsx
"use client";
import React, { useEffect, useRef } from "react";

export default function ConnectingDots() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Number of dots, distance, etc.
    let dots: { x: number; y: number; vx: number; vy: number }[] = [];
    const numDots = 100;
    const maxDistance = 120;

    // Resize the canvas to fill window
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Initialize random dot positions
    const initDots = () => {
      dots = [];
      for (let i = 0; i < numDots; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const vx = (Math.random() - 0.5) * 0.5;
        const vy = (Math.random() - 0.5) * 0.5;
        dots.push({ x, y, vx, vy });
      }
    };

    // Update dot positions
    const updateDots = () => {
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        d.x += d.vx;
        d.y += d.vy;

        // Bounce from edges
        if (d.x < 0 || d.x > canvas.width) d.vx = -d.vx;
        if (d.y < 0 || d.y > canvas.height) d.vy = -d.vy;
      }
    };

    // Draw dots and lines
    const drawDots = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw each dot
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        ctx.beginPath();
        ctx.arc(d.x, d.y, 2, 0, 2 * Math.PI);
        ctx.fillStyle = "#ffffff"; // white dots
        ctx.fill();
      }

      // Draw lines if within maxDistance
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDistance) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            // Fade out line with distance
            ctx.strokeStyle = `rgba(255, 255, 255, ${1 - dist / maxDistance})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      updateDots();
      drawDots();
      requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    initDots();
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      // Absolutely position behind everything
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
