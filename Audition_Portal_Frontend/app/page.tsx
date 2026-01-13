"use client";

import { Spotlight } from "@/components/ascertainityui/Spotlight";
import Particles from "@/components/magicui/particles";
import { SparklesCore } from "@/components/ascertainityui/sparkles";
import IconCloud from "@/components/magicui/icon-cloud";
import BlurIn from "@/components/magicui/blur-in";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import { useAppDispatch } from "@/lib/hooks";
import { verifyToken } from "@/lib/store/features/auth/authSlice";

const slugs = [
  "typescript",
  "javascript",
  "dart",
  "java",
  "react",
  "flutter",
  "android",
  "html5",
  "css3",
  "nodedotjs",
  "express",
  "nextdotjs",
  "prisma",
  "amazonaws",
  "postgresql",
  "firebase",
  "nginx",
  "vercel",
  "testinglibrary",
  "jest",
  "cypress",
  "docker",
  "git",
  "jira",
  "github",
  "gitlab",
  "visualstudiocode",
  "androidstudio",
  "sonarqube",
  "figma",
];

export default function Home() {
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        //Verify token
        const verified = await dispatch(verifyToken()).unwrap();

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const user = await res.json();

        // Redirect logic
        if (verified.role === "ADMIN") {
          router.push("/admin/profile");
          return;
        }

        // round-based redirect
        if (user.round >= 2) {
          console.log(user.round);
          router.replace("/exam/round2");
          return;
        }

        router.push("/dashboard");
      } catch (err) {
        console.error("Auth failed:", err);
        setLoading(false);
      }
    };

    checkAuth();
  }, [dispatch, router]);

  function Signin() {
    const oauthUrl = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_URL;
    if (oauthUrl) {
      setLoading(true); // show loader while redirecting
      window.location.href = oauthUrl;
    } else {
      console.error("OAuth URL is not defined");
    }
  }

  return (
    <div className="h-[100vh] w-full rounded-md flex md:items-center md:justify-center bg-slate-900">
      {loading ? (
        <Loader />
      ) : (
        <div className="h-[100vh] w-full rounded-md flex md:items-center md:justify-center bg-black antialiased bg-grid-white/[0.02] relative overflow-hidden">
          <Spotlight
            className="-top-20 left-0 md:left-96 md:-top-86"
            fill="#fff"
          />
          <Particles
            className="absolute inset-0"
            quantity={300}
            ease={80}
            color="#ffffff"
            refresh
          />

          {/* Left side icons */}
          <div className="hidden md:flex relative h-full w-full max-w-[40rem] items-center justify-center overflow-hidden rounded-lg px-20 pb-20 pt-8 translate-x-12">
            <IconCloud iconSlugs={slugs} />
          </div>

          {/* Right side content */}
          <div className="relative flex flex-col h-full w-full items-center justify-center overflow-hidden rounded-lg p-4">
            <div className="w-full flex flex-col items-center justify-center overflow-hidden rounded-md">
              <BlurIn
                word="GLUG AUDITONS"
                className="md:text-7xl text-6xl lg:text-8xl font-black text-center relative z-20 pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-slate-600 to-gray-300/80 bg-clip-text leading-none text-transparent dark:from-white dark:to-slate-900/10"
              />
              <div className="w-[40rem] transition-opacity fade-in-5 h-32 relative">
                <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[3px] w-3/4 blur-sm" />
                <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-5/4" />
                <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[7px] w-1/4 blur-sm" />
                <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-2/4" />

                <SparklesCore
                  background="transparent"
                  minSize={0.4}
                  maxSize={1}
                  particleDensity={500}
                  className="w-full h-full"
                  particleColor="#FFFFFF"
                />
                <div className="absolute inset-0 w-full h-full bg-black/[0.9] [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
              </div>
            </div>

            {/* Sign-in Button */}
            <div className="flex justify-between items-center">
              <div className="flex items-center justify-center rounded-full p-4 animate-fade-in">
                <div className="relative flex items-center justify-center p-5 rounded-full bg-black ring-container hover:animate-pulse-spin">
                  <div className="absolute inset-0 flex items-center justify-center ring">
                    <div className="ring-layer"></div>
                    <div className="ring-layer"></div>
                  </div>
                  <Image
                    src="glug.svg"
                    alt="GLUG Logo"
                    width={100}
                    height={100}
                    className="rounded-full z-20 duration-300 scale-150 brightness-90 hover:brightness-110 transition ease-in cursor-pointer"
                    onClick={Signin}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* TELEMETRY HUD */}
          <div className="absolute bottom-8 w-full px-12 flex justify-between items-end pointer-events-none opacity-40 hidden md:flex z-50">
            <div className="text-[12px] space-y-1 tracking-[0.2em] uppercase">
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />{" "}
                STATUS: STABLE
              </p>
              <p>SECTOR: 7G-XC</p>
              <p>VELOCITY: 28,000 KM/H</p>
            </div>
            <div className="text-[12px] text-right tracking-[0.2em] uppercase">
              <p>AUDITION PORTAL TERMINAL: V2.0.4</p>
              <p>© 2026 GNU/LINUX USERS GROUP</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
