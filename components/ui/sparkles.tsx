"use client";

import React, { useRef, useEffect } from "react";

type ParticlesProps = {
  id?: string;
  className?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleColor?: string;
  particleDensity?: number;
};

export const SparklesCore = (props: ParticlesProps) => {
  const {
    className,
    background = "transparent",
    minSize = 0.4,
    maxSize = 1,
    particleColor = "#FFFFFF",
    particleDensity = 120,
  } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.clientWidth || 300;
    let height = canvas.clientHeight || 300;

    canvas.width = width;
    canvas.height = height;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.clientWidth || 300;
      height = canvas.clientHeight || 300;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", handleResize);

    const densityVal = particleDensity || 120;
    const particleCount = Math.min(150, Math.max(10, Math.floor((width * height * densityVal) / 20000)));
    
    const particles: {
      x: number;
      y: number;
      size: number;
      speedY: number;
      opacity: number;
      fadeSpeed: number;
    }[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * (maxSize - minSize) + minSize,
        speedY: -(Math.random() * 0.4 + 0.1),
        opacity: Math.random(),
        fadeSpeed: (Math.random() * 0.015 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
      });
    }

    const draw = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, width, height);

      if (background !== "transparent") {
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, width, height);
      }

      ctx.fillStyle = particleColor;
      
      for (const p of particles) {
        p.y += p.speedY;
        p.opacity += p.fadeSpeed;
        
        if (p.opacity > 1) {
          p.opacity = 1;
          p.fadeSpeed = -p.fadeSpeed;
        } else if (p.opacity < 0.1) {
          p.opacity = 0.1;
          p.fadeSpeed = -p.fadeSpeed;
        }

        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }

        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [background, minSize, maxSize, particleColor, particleDensity]);

  return <canvas ref={canvasRef} className={className} style={{ display: "block" }} />;
};
