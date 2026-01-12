'use client'

import { useRef, useState } from "react";
import gsap from "gsap";

interface Parallax3DProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

export default function Parallax3D({ children, className = "", intensity = 1 }: Parallax3DProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!elementRef.current) return;

    const rect = elementRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const xOffset = ((x - centerX) / centerX) * 20 * intensity;
    const yOffset = ((y - centerY) / centerY) * 20 * intensity;

    gsap.to(elementRef.current, {
      x: xOffset,
      y: yOffset,
      rotationY: xOffset / 2,
      rotationX: -yOffset / 2,
      transformPerspective: 500,
      duration: 1,
      ease: "power1.out",
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (!elementRef.current) return;

    gsap.to(elementRef.current, {
      x: 0,
      y: 0,
      rotationY: 0,
      rotationX: 0,
      duration: 0.8,
      ease: "power2.out",
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <div
      ref={elementRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </div>
  );
}
