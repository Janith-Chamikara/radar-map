"use client";

import { useEffect, useRef, useState } from "react";

interface HackerRadarProps {
  targetImagePath?: string;
}

export default function HackerRadar({
  targetImagePath = "/target-icon.png",
}: HackerRadarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [angle, setAngle] = useState(0);
  const [targetImage, setTargetImage] = useState<HTMLImageElement | null>(null);

  // Target position in the top right quadrant
  const targetPosition = { x: 0.6, y: 0.2 }; // Normalized coordinates (0-1)

  // Load target image
  useEffect(() => {
    const img = new window.Image();
    img.src = targetImagePath; // Use the prop instead of hardcoded path
    img.crossOrigin = "anonymous"; // Prevent CORS issues
    img.onload = () => {
      setTargetImage(img);
    };

    // Fallback in case image doesn't load
    img.onerror = () => {
      console.warn("Failed to load target image, using fallback");
      // Create a fallback image using a data URL
      const fallbackImg = new window.Image();
      // Simple red target icon as data URL
      fallbackImg.src =
        "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZWQiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjYiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIyIi8+PC9zdmc+";
      fallbackImg.onload = () => {
        setTargetImage(fallbackImg);
      };
    };

    return () => {
      // Clean up
      img.onload = null;
      img.onerror = null;
    };
  }, [targetImagePath]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    const resizeCanvas = () => {
      const size = Math.min(window.innerWidth - 40, 600);
      canvas.width = size;
      canvas.height = size;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Animation frame
    const interval = setInterval(() => {
      setAngle((prev) => (prev + 2) % 360);
    }, 30);

    // Cleanup
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background - darker to match the image
    ctx.fillStyle = "rgba(0, 10, 0, 0.9)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add some digital noise
    drawNoise(ctx, canvas.width, canvas.height);

    // Draw grid lines
    drawGrid(ctx, centerX, centerY, radius);

    // Draw radar circles
    drawRadarCircles(ctx, centerX, centerY, radius);

    // Draw radar sweep
    drawRadarSweep(ctx, centerX, centerY, radius, angle);

    // Draw target - always with detection effects
    const targetX = centerX + targetPosition.x * radius * 2 - radius;
    const targetY = centerY + targetPosition.y * radius * 2 - radius;

    if (targetImage) {
      drawTargetWithImage(ctx, targetX, targetY, targetImage);
    } else {
      // Fallback to original target drawing if image isn't loaded yet
      drawTarget(ctx, targetX, targetY);
    }

    // Draw center point
    ctx.fillStyle = "rgba(0, 255, 0, 0.8)";
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
    ctx.fill();

    // Draw coordinates
    drawCoordinates(ctx, canvas.width, canvas.height);
  }, [angle, targetImage]);

  // Draw digital noise
  const drawNoise = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    ctx.fillStyle = "rgba(0, 255, 0, 0.02)";
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 2 + 1;
      ctx.fillRect(x, y, size, size);
    }
  };

  // Draw grid lines
  const drawGrid = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number
  ) => {
    ctx.strokeStyle = "rgba(0, 255, 0, 0.1)";
    ctx.lineWidth = 1;

    // Horizontal and vertical lines
    ctx.beginPath();
    ctx.moveTo(centerX - radius, centerY);
    ctx.lineTo(centerX + radius, centerY);
    ctx.moveTo(centerX, centerY - radius);
    ctx.lineTo(centerX, centerY + radius);
    ctx.stroke();

    // Diagonal lines
    ctx.beginPath();
    ctx.moveTo(centerX - radius * 0.7, centerY - radius * 0.7);
    ctx.lineTo(centerX + radius * 0.7, centerY + radius * 0.7);
    ctx.moveTo(centerX - radius * 0.7, centerY + radius * 0.7);
    ctx.lineTo(centerX + radius * 0.7, centerY - radius * 0.7);
    ctx.stroke();
  };

  // Draw radar circles
  const drawRadarCircles = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number
  ) => {
    ctx.strokeStyle = "rgba(0, 255, 0, 0.3)";
    ctx.lineWidth = 1;

    for (let i = 1; i <= 3; i++) {
      const circleRadius = (radius / 3) * i;
      ctx.beginPath();
      ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw outer circle
    ctx.strokeStyle = "rgba(0, 255, 0, 0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
  };

  // Draw radar sweep
  const drawRadarSweep = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    angle: number
  ) => {
    const angleRad = ((angle - 90) * Math.PI) / 180;

    // Draw line
    ctx.strokeStyle = "rgba(0, 255, 0, 0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(angleRad) * radius,
      centerY + Math.sin(angleRad) * radius
    );
    ctx.stroke();

    // Draw sweep gradient using a pie/sector shape
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);

    // Create a sector/pie slice for the sweep
    const sweepAngle = Math.PI / 4; // 45 degrees in radians
    ctx.arc(centerX, centerY, radius, angleRad - sweepAngle, angleRad, false);
    ctx.lineTo(centerX, centerY);

    // Create a gradient for the sweep
    const gradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      radius
    );
    gradient.addColorStop(0, "rgba(0, 255, 0, 0.3)");
    gradient.addColorStop(0.7, "rgba(0, 255, 0, 0.1)");
    gradient.addColorStop(1, "rgba(0, 255, 0, 0)");

    ctx.fillStyle = gradient;
    ctx.fill();

    // Add a subtle glow effect at the edge of the sweep
    ctx.strokeStyle = "rgba(0, 255, 0, 0.2)";
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  // Draw target with image - always with detection effects
  const drawTargetWithImage = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    image: HTMLImageElement
  ) => {
    const size = 40; // Size of the target image

    // Save the current context state
    ctx.save();

    // Enhanced blinking effect - more pronounced
    const blinkIntensity = Math.sin(Date.now() / 150) * 0.5 + 0.5; // Oscillates between 0 and 1

    // Add glow effect
    ctx.shadowColor = `rgba(255, 0, 0, ${0.5 + blinkIntensity * 0.5})`;
    ctx.shadowBlur = 15 + blinkIntensity * 10;

    // Pulsing effect
    const scale = 1 + Math.sin(Date.now() / 200) * 0.15;
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.translate(-x, -y);

    // Draw the image centered on the target position
    ctx.drawImage(image, x - size / 2, y - size / 2, size, size);

    // Restore the context state
    ctx.restore();

    // Add target info text with blinking effect
    const textOpacity = 0.7 + blinkIntensity * 0.3;
    ctx.fillStyle = `rgba(255, 50, 50, ${textOpacity})`;
    ctx.font = "10px monospace";
    ctx.fillText("TARGET FOUND", x + size / 2 + 5, y - 5);
    ctx.fillText("ID: XR-7429", x + size / 2 + 5, y + 7);

    // Add distance - matching the image showing 289m
    ctx.fillText(`DIST: 289m`, x + size / 2 + 5, y + 19);

    // Add a targeting box around the image - always visible with blinking effect
    ctx.strokeStyle = `rgba(255, 50, 50, ${textOpacity})`;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 3]); // Dashed line
    ctx.strokeRect(x - size / 2 - 5, y - size / 2 - 5, size + 10, size + 10);
    ctx.setLineDash([]); // Reset to solid line
  };

  // Original target drawing (fallback) - always with detection effects
  const drawTarget = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const size = 10;

    // Enhanced blinking effect - more pronounced
    const blinkIntensity = Math.sin(Date.now() / 150) * 0.5 + 0.5; // Oscillates between 0 and 1
    const opacity = 0.7 + blinkIntensity * 0.3;

    // Draw target
    ctx.strokeStyle = `rgba(255, 50, 50, ${opacity})`;
    ctx.lineWidth = 2;

    // Outer circle
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.stroke();

    // Inner circle
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.stroke();

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(x - size * 1.5, y);
    ctx.lineTo(x + size * 1.5, y);
    ctx.moveTo(x, y - size * 1.5);
    ctx.lineTo(x, y + size * 1.5);
    ctx.stroke();

    // Target data
    ctx.fillStyle = `rgba(255, 50, 50, ${opacity})`;
    ctx.font = "10px monospace";
    ctx.fillText("TARGET FOUND", x + size * 2, y);
    ctx.fillText("ID: XR-7429", x + size * 2, y + 12);
    ctx.fillText("DIST: 289m", x + size * 2, y + 24);

    // Add a glow effect
    ctx.beginPath();
    ctx.arc(x, y, size * 1.5, 0, Math.PI * 2);
    const glowGradient = ctx.createRadialGradient(
      x,
      y,
      size * 0.5,
      x,
      y,
      size * 2
    );
    glowGradient.addColorStop(0, `rgba(255, 50, 50, ${0.3 * blinkIntensity})`);
    glowGradient.addColorStop(1, "rgba(255, 50, 50, 0)");
    ctx.fillStyle = glowGradient;
    ctx.fill();

    // Add a targeting box
    ctx.strokeStyle = `rgba(255, 50, 50, ${opacity})`;
    ctx.setLineDash([5, 3]); // Dashed line
    ctx.strokeRect(x - size * 1.5, y - size * 1.5, size * 3, size * 3);
    ctx.setLineDash([]); // Reset to solid line
  };

  // Draw coordinates
  const drawCoordinates = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
    ctx.font = "10px monospace";

    // X coordinates
    for (let i = 0; i <= 10; i++) {
      const x = (width / 10) * i;
      ctx.fillText(`${i * 10}`, x, height - 5);
    }

    // Y coordinates
    for (let i = 0; i <= 10; i++) {
      const y = (height / 10) * i;
      ctx.fillText(`${i * 10}`, 5, y);
    }
  };

  return (
    <div className="relative flex justify-center">
      <canvas
        ref={canvasRef}
        className="max-h-[600px] max-w-full rounded-full border border-green-500/30"
      />
      <div className="absolute left-0 top-0 h-full w-full rounded-full bg-green-500/5 shadow-inner" />
    </div>
  );
}
