'use client'

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import AnimatedTitle from "./AnimatedTitle";
import Parallax3D from "./Parallax3D";

gsap.registerPlugin(ScrollTrigger);

export default function WhatWeDoSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".activity-card", {
        opacity: 0,
        scale: 0.8,
        stagger: 0.15,
        duration: 0.8,
        ease: "back.out(1.7)",
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

  const activities = [
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      title: "Workshops",
      description: "Through varied workshops on revolutionary Open Technologies throughout the year, we spread the idea of Open Source to beginners and veterans alike.",
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-900/40 to-cyan-900/40",
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
      ),
      title: "Community Forum",
      description: "We provide budding enthusiasts like ourselves a forum to contribute and learn about FOSS. A space where ideas flourish and knowledge is shared freely.",
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-900/40 to-pink-900/40",
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: "Learning Resources",
      description: "We bring people together to ideate and contribute to the leading Open technologies. We provide help and resources to everyone who wants to make the web world a better place.",
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-900/40 to-emerald-900/40",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen py-20 bg-gradient-to-b from-black via-slate-800 to-black"
      id="what-we-do"
    >
      <div className="container mx-auto px-6">
        <AnimatedTitle
          title="What <b>We</b> Do"
          containerClass="mb-16 text-4xl md:text-6xl lg:text-7xl font-bold text-center text-white"
        />

        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {activities.map((activity, index) => (
            <Parallax3D key={index} className="activity-card" intensity={0.5}>
              <div className={`bg-gradient-to-br ${activity.bgColor} p-8 rounded-2xl border border-white/10 backdrop-blur-sm h-full flex flex-col transition-all duration-300 hover:border-white/30`}>
                <div className={`text-transparent bg-clip-text bg-gradient-to-r ${activity.color} mb-4`}>
                  {activity.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{activity.title}</h3>
                <p className="text-gray-300 leading-relaxed flex-grow">
                  {activity.description}
                </p>
                <div className={`mt-6 h-1 w-16 rounded-full bg-gradient-to-r ${activity.color}`} />
              </div>
            </Parallax3D>
          ))}
        </div>
      </div>
    </section>
  );
}
