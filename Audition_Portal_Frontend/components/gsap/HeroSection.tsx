'use client'

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  onGetStarted: () => void;
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance animation
      gsap.from(".hero-title", {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: "power3.out",
      });

      gsap.from(".hero-subtitle", {
        opacity: 0,
        y: 30,
        duration: 1,
        delay: 0.3,
        ease: "power3.out",
      });

      gsap.from(".hero-cta", {
        opacity: 0,
        y: 20,
        duration: 1,
        delay: 0.6,
        ease: "power3.out",
      });

      // Scroll-triggered clip-path animation
      if (imageRef.current) {
        gsap.to(imageRef.current, {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          borderRadius: 0,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.5,
          },
        });
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black"
      id="hero"
    >
      {/* Background Image with Clip Path Animation */}
      <div
        ref={imageRef}
        className="absolute inset-0 z-0"
        style={{
          clipPath: "polygon(20% 20%, 80% 20%, 80% 80%, 20% 80%)",
          borderRadius: "20px",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="hero-title mb-6">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-white mb-4">
            GLUG
          </h1>
          <p className="text-2xl md:text-4xl text-gray-300 font-light">
            GNU/Linux User&apos;s Group
          </p>
        </div>

        <div className="hero-subtitle mb-8 max-w-3xl mx-auto">
          <p className="text-xl md:text-2xl text-gray-400">
            Free and Open Source Software @ NIT Durgapur
          </p>
          <p className="text-lg md:text-xl text-indigo-400 mt-4 font-semibold">
            Since 2003
          </p>
        </div>

        <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={onGetStarted}
            className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-lg font-bold rounded-full hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-indigo-500/50 transform hover:scale-105"
          >
            Join Our Community
          </button>
          <a
            href="#about"
            className="px-8 py-4 border-2 border-white/30 text-white text-lg font-bold rounded-full hover:border-white/60 hover:bg-white/10 transition-all duration-300"
          >
            Learn More
          </a>
        </div>

        <div className="mt-16 flex items-center justify-center">
          <div className="animate-bounce">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
