'use client'

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger);

interface AnimatedNavbarProps {
  onSignIn: () => void;
}

export default function AnimatedNavbar({ onSignIn }: AnimatedNavbarProps) {
  const navbarRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const showAnim = gsap.from(navbarRef.current, {
      yPercent: -100,
      paused: true,
      duration: 0.3,
    }).progress(1);

    ScrollTrigger.create({
      start: "top top",
      end: "max",
      onUpdate: (self) => {
        if (self.direction === -1) {
          showAnim.play();
          setIsVisible(true);
        } else if (self.direction === 1) {
          showAnim.reverse();
          setIsVisible(false);
        }
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div
      ref={navbarRef}
      className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10"
    >
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-white">GLUG</span>
          <span className="text-sm text-gray-400">NIT Durgapur</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#about" className="text-gray-300 hover:text-white transition-colors">
            About
          </a>
          <a href="#what-we-do" className="text-gray-300 hover:text-white transition-colors">
            What We Do
          </a>
          <a href="#vision" className="text-gray-300 hover:text-white transition-colors">
            Vision
          </a>
        </div>

        <button
          onClick={onSignIn}
          className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 font-medium"
        >
          Join Us
        </button>
      </nav>
    </div>
  );
}
