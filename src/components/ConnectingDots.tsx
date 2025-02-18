"use client";

import { useEffect, useRef } from "react";

// Dot interface; adding a hue property for floating dots.
interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  // For connecting dots, color will be fixed.
  // For floating dots, we'll update hue to generate a changing color.
  hue?: number;
  baseColor?: string;
  color?: string;
}

const randomInRange = (min: number, max: number) =>
  Math.random() * (max - min) + min;

export default function ConnectingDots() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Dummy mouse value; will be set in useEffect.
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Set initial mouse position.
    mouse.current.x = window.innerWidth / 2;
    mouse.current.y = window.innerHeight / 2;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Create connecting dots (using new color #9457EB).
    const connectingDots: Dot[] = [];
    const numConnectingDots = 380;
    for (let i = 0; i < numConnectingDots; i++) {
      connectingDots.push({
        x: randomInRange(0, width),
        y: randomInRange(0, height),
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: randomInRange(1.5, 3),
        // Fixed color: #9457EB => rgb(148,87,235)
        color: "rgba(148,87,235,0.8)",
      });
    }

    // Create floating dots.
    const floatingDots: Dot[] = [];
    const numFloatingDots = 50;
    for (let i = 0; i < numFloatingDots; i++) {
      // Set initial hue randomly (0 to 360)
      const hue = randomInRange(0, 360);
      // baseColor (matte) can be computed from HSL (low saturation, moderate lightness)
      const baseColor = `hsl(${hue}, 30%, 60%)`;
      floatingDots.push({
        x: randomInRange(0, width),
        y: randomInRange(0, height),
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: randomInRange(1.5, 3),
        hue,
        baseColor,
        color: baseColor,
      });
    }

    // Configuration parameters.
    const visibleRadius = 500; // For connecting dots
    const cursorConnectionDistance = 150;
    const dotConnectionDistance = 100;
    // For linking floating dots with connecting dots
    const floatLinkDistance = 120;

    let lastTime = performance.now();

    const animate = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Update connecting dots.
      connectingDots.forEach((dot) => {
        dot.x += dot.vx;
        dot.y += dot.vy;
        if (dot.x < 0 || dot.x > width) dot.vx = -dot.vx;
        if (dot.y < 0 || dot.y > height) dot.vy = -dot.vy;
      });

      // Update floating dots (update position and hue).
      floatingDots.forEach((dot) => {
        dot.x += dot.vx;
        dot.y += dot.vy;
        if (dot.x < 0 || dot.x > width) dot.vx = -dot.vx;
        if (dot.y < 0 || dot.y > height) dot.vy = -dot.vy;

        // Slowly update the hue.
        if (dot.hue !== undefined) {
          dot.hue = (dot.hue + 0.05 * delta) % 360;
          // Create a matte color using HSL.
          dot.color = `hsl(${dot.hue}, 30%, 60%)`;
        }
      });

      // Filter connecting dots near the mouse.
      const visibleDots = connectingDots.filter((dot) => {
        const d = Math.hypot(dot.x - mouse.current.x, dot.y - mouse.current.y);
        return d < visibleRadius;
      });

      // Draw connecting dots.
      visibleDots.forEach((dot) => {
        const d = Math.hypot(dot.x - mouse.current.x, dot.y - mouse.current.y);
        const opacity = 1 - d / visibleRadius;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        // Use new color with adjusted opacity.
        ctx.fillStyle = `rgba(148,87,235,${opacity})`;
        ctx.fill();
      });

      // Draw lines from the cursor to each connecting dot.
      visibleDots.forEach((dot) => {
        const d = Math.hypot(dot.x - mouse.current.x, dot.y - mouse.current.y);
        if (d < cursorConnectionDistance) {
          const lineOpacity = 1 - d / cursorConnectionDistance;
          ctx.beginPath();
          ctx.moveTo(mouse.current.x, mouse.current.y);
          ctx.lineTo(dot.x, dot.y);
          ctx.strokeStyle = `rgba(148,87,235,${lineOpacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      // Draw lines connecting the connecting dots.
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
            ctx.strokeStyle = `rgba(148,87,235,${lineOpacity * 0.8})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw floating dots.
      floatingDots.forEach((dot) => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = dot.color || dot.baseColor || "black";
        ctx.fill();
      });

      // Draw lines linking floating dots to nearby connecting dots.
      floatingDots.forEach((fDot) => {
        visibleDots.forEach((cDot) => {
          const d = Math.hypot(fDot.x - cDot.x, fDot.y - cDot.y);
          if (d < floatLinkDistance) {
            const lineOpacity = 1 - d / floatLinkDistance;
            ctx.beginPath();
            ctx.moveTo(fDot.x, fDot.y);
            ctx.lineTo(cDot.x, cDot.y);
            ctx.strokeStyle = fDot.color
              ? `${fDot.color.replace("hsl", "rgba").replace(")", `,${lineOpacity})`)}`
              : `rgba(0,0,0,${lineOpacity})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        });
      });

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
