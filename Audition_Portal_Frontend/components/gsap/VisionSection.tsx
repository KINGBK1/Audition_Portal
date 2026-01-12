'use client'

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import AnimatedTitle from "./AnimatedTitle";

gsap.registerPlugin(ScrollTrigger);

export default function VisionSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Mask clip-path animation
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "center center",
          end: "+=800 center",
          scrub: 0.5,
          pin: true,
          pinSpacing: true,
        },
      });

      timeline.to(maskRef.current, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        width: "100vw",
        height: "100vh",
        borderRadius: 0,
        ease: "power2.inOut",
      });

      // Content fade in
      gsap.from(".vision-content", {
        opacity: 0,
        y: 50,
        duration: 1,
        scrollTrigger: {
          trigger: ".vision-content",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden"
      id="vision"
    >
      <div
        ref={maskRef}
        className="absolute inset-0 flex items-center justify-center"
        style={{
          clipPath: "polygon(20% 20%, 80% 20%, 80% 80%, 20% 80%)",
          width: "50vw",
          height: "50vh",
          borderRadius: "20px",
          margin: "auto",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 opacity-90" />
        <div className="absolute inset-0 bg-[url('/circuit.svg')] opacity-10" />
      </div>

      <div className="relative z-10 container mx-auto px-6">
        <AnimatedTitle
          title="Our <b>Vision</b>"
          containerClass="mb-12 text-4xl md:text-6xl lg:text-7xl font-bold text-center text-white"
        />

        <div className="vision-content max-w-4xl mx-auto">
          <div className="bg-black/60 backdrop-blur-md p-8 md:p-12 rounded-3xl border border-white/20">
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-8 text-center">
              Being a bunch of FOSS enthusiasts, we preach the idea of{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 font-bold">
                &quot;free things are the best things&quot;
              </span>{" "}
              and firmly believe in sharing knowledge.
            </p>

            <p className="text-lg md:text-xl text-gray-400 leading-relaxed mb-8 text-center">
              We strive to elevate the tech culture in our college and believe that this can 
              only be done through giving people digital resources and knowledge in all realms 
              from hardware to software and data to design.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <div className="px-6 py-3 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full border border-indigo-500/30">
                <span className="text-indigo-300 font-semibold">Freedom</span>
              </div>
              <div className="px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30">
                <span className="text-purple-300 font-semibold">Expression</span>
              </div>
              <div className="px-6 py-3 bg-gradient-to-r from-pink-500/20 to-red-500/20 rounded-full border border-pink-500/30">
                <span className="text-pink-300 font-semibold">Open Source</span>
              </div>
            </div>

            <blockquote className="mt-12 text-center">
              <p className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 italic">
                &quot;We promote FOSS through various endeavours because we believe in the freedom of expression for everyone.&quot;
              </p>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}
