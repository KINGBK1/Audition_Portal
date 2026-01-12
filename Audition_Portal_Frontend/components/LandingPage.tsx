'use client'

import { useState, useEffect } from "react";
import AnimatedNavbar from "./gsap/AnimatedNavbar";
import HeroSection from "./gsap/HeroSection";
import AboutSection from "./gsap/AboutSection";
import WhatWeDoSection from "./gsap/WhatWeDoSection";
import VisionSection from "./gsap/VisionSection";
import CTASection from "./gsap/CTASection";

interface LandingPageProps {
  onSignIn: () => void;
}

export default function LandingPage({ onSignIn }: LandingPageProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="relative w-full bg-black overflow-x-hidden">
      <AnimatedNavbar onSignIn={onSignIn} />
      <HeroSection onGetStarted={onSignIn} />
      <AboutSection />
      <WhatWeDoSection />
      <VisionSection />
      <CTASection onJoinNow={onSignIn} />
    </div>
  );
}
