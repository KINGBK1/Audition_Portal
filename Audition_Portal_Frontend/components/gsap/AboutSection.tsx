'use client'

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import AnimatedTitle from "./AnimatedTitle";
import Parallax3D from "./Parallax3D";

gsap.registerPlugin(ScrollTrigger);

export default function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".about-card", {
        opacity: 0,
        y: 100,
        stagger: 0.2,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top center",
          end: "center center",
          toggleActions: "play none none reverse",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen py-20 bg-gradient-to-b from-black via-slate-900 to-black"
      id="about"
    >
      <div className="container mx-auto px-6">
        <AnimatedTitle
          title="Who <b>We</b> Are"
          containerClass="mb-16 text-4xl md:text-6xl lg:text-7xl font-bold text-center text-white"
        />

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          <Parallax3D className="about-card">
            <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 p-8 rounded-2xl border border-indigo-500/30 backdrop-blur-sm h-full">
              <div className="text-indigo-400 mb-4">
                <svg
                  className="w-12 h-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Our Community</h3>
              <p className="text-gray-300 leading-relaxed">
                The GNU/Linux User&apos;s Group, NIT Durgapur is a community of GNU/Linux Users 
                that promote the use of Free and Open Source Software. The Group was 
                established in 2003 by a bunch of FOSS enthusiasts with the idea of 
                popularising and contributing to Open Source.
              </p>
            </div>
          </Parallax3D>

          <Parallax3D className="about-card">
            <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 p-8 rounded-2xl border border-purple-500/30 backdrop-blur-sm h-full">
              <div className="text-purple-400 mb-4">
                <svg
                  className="w-12 h-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Who We Are</h3>
              <p className="text-gray-300 leading-relaxed">
                We are a plethora of designers, contributors and developers that believe in 
                learning and sharing through opening up your mind to Open Source. Our community 
                thrives on collaboration, innovation, and the belief that knowledge should be 
                free and accessible to all.
              </p>
            </div>
          </Parallax3D>
        </div>
      </div>
    </section>
  );
}
