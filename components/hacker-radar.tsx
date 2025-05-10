"use client";

import { useEffect, useRef, useState } from "react";

export default function HackerRadar() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [angle, setAngle] = useState(0);
  const [targetVisible, setTargetVisible] = useState(false);

  // Target position in the top right quadrant
  const targetPosition = { x: 0.7, y: 0.3 }; // Normalized coordinates (0-1)

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

      // Check if radar is sweeping over the target (with some margin)
      const targetAngle =
        (Math.atan2(targetPosition.y - 0.5, targetPosition.x - 0.5) * 180) /
        Math.PI;

      const normalizedTargetAngle = (targetAngle + 360) % 360;
      const isNearTarget =
        Math.abs(angle - normalizedTargetAngle) < 20 ||
        Math.abs(angle - normalizedTargetAngle - 360) < 20;

      setTargetVisible(isNearTarget);
    }, 30);

    // Cleanup
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [angle]);

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

    // Draw background
    ctx.fillStyle = "rgba(0, 20, 0, 0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add some digital noise
    drawNoise(ctx, canvas.width, canvas.height);

    // Draw grid lines
    drawGrid(ctx, centerX, centerY, radius);

    // Draw radar circles
    drawRadarCircles(ctx, centerX, centerY, radius);

    // Draw radar sweep
    drawRadarSweep(ctx, centerX, centerY, radius, angle);

    // Draw target - always visible but highlighted when detected
    drawTarget(
      ctx,
      centerX + targetPosition.x * radius * 2 - radius,
      centerY + targetPosition.y * radius * 2 - radius,
      targetVisible
    );

    // Draw center point
    ctx.fillStyle = "rgba(0, 255, 0, 0.8)";
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
    ctx.fill();

    // Draw coordinates
    drawCoordinates(ctx, canvas.width, canvas.height);
  }, [angle, targetVisible]);

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

  // Draw target
  const drawTarget = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    isDetected: boolean
  ) => {
    const size = 10;

    // Base opacity for when not detected
    const baseOpacity = 0.6;

    // Enhanced blinking effect when detected
    const blinkEffect = isDetected ? Math.sin(Date.now() / 100) * 0.4 : 0.5;
    const opacity = baseOpacity + blinkEffect;

    // Color changes based on detection
    const colorIntensity = isDetected ? 255 : 180;

    // Draw target
    ctx.strokeStyle = `rgba(${colorIntensity}, 50, 50, ${opacity})`;
    ctx.lineWidth = isDetected ? 2 : 1.5;

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
    ctx.fillStyle = `rgba(${colorIntensity}, 50, 50, ${opacity})`;
    ctx.font = "10px monospace";
    ctx.fillText(1 === 1 ? "TARGET FOUND" : "TARGET", x + size * 2, y);
    ctx.fillText("ID: XR-7429", x + size * 2, y + 12);

    // Add a glow effect when detected
    if (1 === 1) {
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
      glowGradient.addColorStop(0, "rgba(255, 50, 50, 0.2)");
      glowGradient.addColorStop(1, "rgba(255, 50, 50, 0)");
      ctx.fillStyle = glowGradient;
      ctx.fill();
    }
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
