'use client'

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/hooks";
import { verifyToken } from "@/lib/store/features/auth/authSlice";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import gsap from "gsap";
import { TiLocationArrow } from "react-icons/ti";
import { FaGithub, FaLinkedin, FaTwitter, FaDiscord } from "react-icons/fa";
import AnimatedTitle from "@/components/AnimatedTitle";
import Navbar from "@/components/landing/Navbar";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [hasClicked, setHasClicked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadedVideos, setLoadedVideos] = useState(0);
  const [authChecking, setAuthChecking] = useState(true);
  
  const dispatch = useAppDispatch();
  const router = useRouter();
  const nextVideoRef = useRef<HTMLVideoElement>(null);
  const currentVideoRef = useRef<HTMLVideoElement>(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  
  const totalVideos = 4;
  const upcomingVideoIndex = (currentIndex % totalVideos) + 1;

  const handleVideoLoad = () => {
    setLoadedVideos((prev) => prev + 1);
  };

  const handleVideoError = () => {
    console.warn('Video failed to load, using fallback');
    setLoadedVideos((prev) => prev + 1);
  };

  const handleMiniVdClick = () => {
    setHasClicked(true);
    setCurrentIndex(upcomingVideoIndex);
  };

  useEffect(() => {
    if (loadedVideos === totalVideos - 1) {
      setLoading(false);
    }
  }, [loadedVideos]);

  useEffect(() => {
    const handleScroll = () => {
      const video = currentVideoRef.current;
      if (!video || !video.duration) return;

      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollFraction = Math.min(scrollTop / docHeight, 1);
      
      // Scrub video based on scroll position
      video.currentTime = scrollFraction * video.duration;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const verified = await dispatch(verifyToken()).unwrap();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const user = await res.json();

        if (verified.role === "ADMIN") {
          router.push("/admin/profile");
          return;
        }

        if (user.round >= 2) {
          router.replace("/exam/round2");
          return;
        }

        router.push("/dashboard");
      } catch (err) {
        console.error("Auth failed:", err);
        setAuthChecking(false);
      }
    };

    checkAuth();
  }, [dispatch, router]);

  useGSAP(() => {
    if (hasClicked) {
      gsap.set("#next-video", { visibility: "visible" });

      gsap.to("#next-video", {
        transformOrigin: "center center",
        scale: 1,
        width: "100%",
        height: "100%",
        duration: 1,
        ease: "power1.inOut",
        onStart: () => {
          nextVideoRef.current?.play();
        },
      });

      gsap.from("#current-video", {
        transformOrigin: "center center",
        scale: 0.5,
        duration: 2,
        ease: "power1.inOut",
      });
    }
  }, { dependencies: [currentIndex], revertOnUpdate: true });

  useGSAP(() => {
    gsap.to("#video-frame", {
      clipPath: "polygon(14% 0, 72% 0, 88% 90%, 0 95%)",
      borderRadius: "0% 0% 40% 10%",
      ease: "power1.inOut",
      scrollTrigger: {
        trigger: "#video-frame",
        start: "center center",
        end: "bottom center",
        scrub: true,
      },
    });
  });

  const getVideoSrc = (index: number) => `/videos/hero-${index}.mp4`;

  function Signin() {
    const oauthUrl = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_URL;
    if (oauthUrl) {
      window.location.href = oauthUrl;
    } else {
      console.error("OAuth URL is not defined");
    }
  }

  if (authChecking) {
    return (
      <div className="flex-center absolute z-[100] h-dvh w-screen overflow-hidden bg-violet-50">
        <div className="three-body">
          <div className="three-body__dot"></div>
          <div className="three-body__dot"></div>
          <div className="three-body__dot"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen w-screen overflow-x-hidden">
      <Navbar />
      
      {loading && (
        <div className="flex-center absolute z-[100] h-dvh w-screen overflow-hidden bg-violet-50">
          <div className="three-body">
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
          </div>
        </div>
      )}
      
      {/* Hero Section with Video - Fixed Background */}
      <div className="fixed inset-0 w-screen h-screen z-0">
        <div
          id="video-frame"
          className="absolute inset-0 w-full h-full overflow-hidden bg-blue-75"
        >
          <div>
            <div className="mask-clip-path absolute-center absolute z-50 size-64 cursor-pointer overflow-hidden rounded-lg">
              <div
                onClick={handleMiniVdClick}
                className="origin-center scale-50 opacity-0 transition-all duration-500 ease-in hover:scale-100 hover:opacity-100"
              >
                <video
                  ref={nextVideoRef}
                  src={getVideoSrc(upcomingVideoIndex)}
                  loop
                  muted
                  className="size-64 origin-center scale-150 object-cover object-center rounded-lg"
                  onLoadedData={handleVideoLoad}
                  onError={handleVideoError}
                />
              </div>
            </div>
            
            <video
              ref={nextVideoRef}
              src={getVideoSrc(currentIndex)}
              loop
              muted
              id="next-video"
              className="absolute-center invisible z-20 absolute size-64 object-cover object-center"
              onLoadedData={handleVideoLoad}
              onError={handleVideoError}
            />
            
            <video
              ref={currentVideoRef}
              src={getVideoSrc(currentIndex === totalVideos - 1 ? 1 : currentIndex)}
              loop
              muted
              id="current-video"
              className="absolute left-0 top-0 size-full object-cover object-center"
              onLoadedData={handleVideoLoad}
              onError={handleVideoError}
            />
          </div>

          <h1 className="special-font hero-heading absolute bottom-5 right-5 z-40 text-blue-75">
            GL<b>U</b>G
          </h1>
          
          <div className="absolute left-0 top-0 z-40 size-full">
            <div className="mt-24 px-5 sm:px-10">
              <h1 className="special-font hero-heading text-blue-100">
                Open<b>S</b>ource
              </h1>
              <p className="mb-5 max-w-64 font-robert-regular text-blue-100">
                Enter the FOSS Community <br />
                Unleash Your Potential
              </p>
              <button
                onClick={Signin}
                className="bg-yellow-300 text-black px-6 py-3 rounded-full font-black uppercase flex items-center gap-2 hover:bg-yellow-400 transition-all hover:scale-105"
              >
                <span>Watch trailer</span>
                <TiLocationArrow />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for scroll */}
      <div className="relative z-10 h-screen"></div>

      {/* Dummy Section 1 */}
      <section className="relative z-10 min-h-screen w-screen px-10 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-16 max-w-4xl">
          <h2 className="text-6xl font-black text-white mb-6">Innovation</h2>
          <p className="text-2xl text-white/80">Building the future of open source technology</p>
        </div>
      </section>

      {/* Dummy Section 2 */}
      <section className="relative z-10 min-h-screen w-screen px-10 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-16 max-w-4xl">
          <h2 className="text-6xl font-black text-white mb-6">Community</h2>
          <p className="text-2xl text-white/80">Join thousands of developers worldwide</p>
        </div>
      </section>

      {/* Dummy Section 3 */}
      <section className="relative z-10 min-h-screen w-screen px-10 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-16 max-w-4xl">
          <h2 className="text-6xl font-black text-white mb-6">Excellence</h2>
          <p className="text-2xl text-white/80">Pushing boundaries in software development</p>
        </div>
      </section>

      {/* Contact/CTA Section */}
      <section id="contact" className="relative z-10 my-20 min-h-96 w-screen px-10">
        <div className="relative rounded-lg bg-black py-24 text-blue-50 sm:overflow-hidden border-8 border-blue-900">
          <div className="flex flex-col items-center text-center">
            <p className="mb-10 text-[10px] uppercase">
              Join GLUG
            </p>

            <AnimatedTitle
              title="let's b<b>u</b>ild the <br /> new era of <br /> <b>o</b>pen source t<b>o</b>gether."
              containerClass="special-font !md:text-[6.2rem] w-full font-zentry !text-5xl !font-black !leading-[.9]"
            />

            <button
              onClick={Signin}
              className="mt-10 cursor-pointer bg-yellow-300 text-black px-10 py-5 rounded-full font-black uppercase text-lg flex items-center gap-3 hover:bg-yellow-400 transition-all hover:scale-110 shadow-2xl"
            >
              <span>Start your journey</span>
              <TiLocationArrow className="text-2xl" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 w-screen bg-[#5542ff] py-8 text-white">
        <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-4 md:flex-row max-w-7xl">
          <div className="text-center md:text-left">
            <h3 className="text-3xl font-black mb-2">GLUG</h3>
            <p className="text-sm font-light">©GNU/Linux Users Group 2026. All rights reserved</p>
          </div>

          <div className="flex justify-center gap-6">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-white transition-colors duration-300 hover:text-yellow-300 text-2xl">
              <FaGithub />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-white transition-colors duration-300 hover:text-yellow-300 text-2xl">
              <FaLinkedin />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white transition-colors duration-300 hover:text-yellow-300 text-2xl">
              <FaTwitter />
            </a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-white transition-colors duration-300 hover:text-yellow-300 text-2xl">
              <FaDiscord />
            </a>
          </div>

          <a href="#privacy-policy" className="text-center text-sm font-light hover:underline md:text-right">
            Privacy Policy
          </a>
        </div>
      </footer>
    </main>
  );
}
