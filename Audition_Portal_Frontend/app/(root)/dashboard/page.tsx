'use client';

import Loader from '@/components/Loader';
import AnimatedGradientText from '@/components/magicui/animated-gradient-text';
import AnimatedGridPattern from '@/components/magicui/animated-grid-pattern';
import { MagicCard, MagicContainer } from '@/components/magicui/magic-container';
import Meteors from '@/components/magicui/meteors';
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchUserData, selectAuthState, verifyToken } from '@/lib/store/features/auth/authSlice';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { CheckCircle2, ArrowRight, Trophy, Sparkles, Star } from 'lucide-react';
// import ClientVerify from '@/components/ClientVerify';

const Dashboard = () => {
  const calculateTimeLeft = () => {
    const targetDate = "2026-01-16"; // Your actual round end date
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    // Removed the 'else { onComplete(); }' block

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  const [time, setTime] = useState(0);
  const dispatch = useAppDispatch();
  const { userInfo } = useAppSelector(selectAuthState);
  const { push } = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Dashboard.tsx (Revised useEffect)

  useEffect(() => {
    const initializeDashboard = async () => {
      setIsLoading(true);
      try {
        // 1. Verify token
        await dispatch(verifyToken()).unwrap();

        // 2. Fetch the absolute latest user data from the server
        await dispatch(fetchUserData()).unwrap();
      } catch (error) {
        // If verifyToken or fetchUserData fails, redirect to login page
        push("/");
      } finally {
        // Ensure loading screen is dismissed
        setIsLoading(false);
      }
    };

    initializeDashboard();

    // Cleanup is not strictly necessary here, but good practice if you added event listeners
  }, [dispatch, push]);
  // useEffect(() => {
  //   if (!isLoading && userInfo) {
  //     if (userInfo.round === 2) {
  //       push("/exam/round2");
  //     }
  //   }
  // }, [isLoading, userInfo, push]);


  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  async function logout(): Promise<void> {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (data.success) {
        push("/");
      } else {
        alert("Logout failed");
      }
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Error logging out");
    }
  }

  const hasCompletedQuiz = userInfo?.hasGivenExam && userInfo?.round === 1;
  const isRoundTwo = userInfo?.round === 2;
  const isRoundThreeOrHigher = userInfo?.round && userInfo.round >= 3;
  const showStartButton = !userInfo?.hasGivenExam;

  const handleRoundNavigation = () => {
    if (userInfo?.round === 2) {
      push(`/exam/round2`);
    }
  };

  return (
    
    <div>
      {/* <ClientVerify /> */}
      {isLoading ? (
        <Loader />
      ) : (
        <div className="relative h-screen w-screen overflow-hidden">
          <div className="fixed top-6 right-6 z-50">
            <Popover>
              <PopoverTrigger>
                <Avatar className="hover:brightness-75 w-11 h-11 cursor-pointer">
                  <AvatarImage
                    src={userInfo?.picture || undefined}
                    alt="image"
                  />
                  <AvatarFallback>
                    {userInfo?.username?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </PopoverTrigger>

              <PopoverContent className="dark">
                <div className="flex flex-col p-4">
                  <p className="text-slate-400 text-sm">Signed in as</p>
                  <p className="text-slate-100 font-semibold">
                    {userInfo?.username}
                  </p>
                  <Button
                    className="mt-4 dark"
                    onClick={() => push("/profile")}
                  >
                    View Profile
                  </Button>
                  <Button
                    variant={"outline"}
                    className="mt-2 dark"
                    onClick={() => logout()}
                  >
                    Logout
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="fixed top-7 left-7 text-2xl md:text-3xl text-slate-300 z-50">
            Dashboard
          </div>

          {hasCompletedQuiz ? (
            <div className="flex items-center justify-center h-full flex-col space-y-12 z-10 relative">
              {/* Themed Completion Card */}
              <div className="max-w-xl w-full border border-slate-800 bg-card/90 backdrop-blur-md p-10 md:p-14 rounded-none shadow-2xl relative text-center">
                {/* Blue Top Accent Line */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500" />

                <div className="space-y-8">
                  {/* Icon with Emerald Glow */}
                  <div className="relative inline-block">
                    <div className="absolute inset-0 blur-xl bg-emerald-500/10 rounded-full" />
                    <CheckCircle2 className="w-20 h-20 text-emerald-500 relative z-10 mx-auto" />
                  </div>

                  <div className="space-y-3">
                    <p className="text-blue-500 tracking-[0.5em] text-[10px] uppercase font-black font-mono">
                      Assessment Concluded
                    </p>
                    <h2 className="text-3xl md:text-4xl font-light tracking-widest text-white font-sans uppercase">
                      Test Completed
                    </h2>
                  </div>

                  {/* Aesthetic Divider */}
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-12 h-[1px] bg-slate-800" />
                    <div className="w-2 h-2 border border-slate-700 rotate-45" />
                    <div className="w-12 h-[1px] bg-slate-800" />
                  </div>

                  <div className="space-y-5 font-mono">
                    <p className="text-slate-400 text-sm leading-relaxed uppercase tracking-[0.15em] font-bold px-4">
                      Your 45-minute session has{" "}
                      <span className="text-white">successfully timed out</span>{" "}
                      and all responses have been saved.
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] leading-relaxed max-w-xs mx-auto">
                      The recruitment team will now review your performance.
                      Results will be updated on this portal soon.
                    </p>
                  </div>

                  {/* Terminal Status Instead of Button */}
                  <div className="pt-4">
                    <div className="inline-flex items-center gap-3 px-5 py-3 border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 font-mono text-[10px] uppercase tracking-[0.2em]">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                      Status: Evaluation in Progress
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Footer Detail */}
              <div className="font-mono text-[10px] text-slate-500 uppercase tracking-[0.5em]">
                End of Line // Transmission_Complete //{" "}
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          ) : isRoundTwo ? (
            <div className="flex items-center justify-center min-h-screen z-10 relative px-4 py-12">
              <div className="relative w-full max-w-2xl">
                {/* Trophy Section: Responsive scaling and positioning */}
                <div className="absolute -top-6 md:-top-10 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="relative">
                    {/* Added responsive w/h: w-12 on mobile, w-20 on desktop */}
                    <Trophy className="w-12 h-12 md:w-20 md:h-20 text-blue-500 animate-bounce" />
                    <Sparkles className="w-5 h-5 md:w-8 md:h-8 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
                  </div>
                </div>

                {/* Main Card */}
                <div className="border border-slate-800 bg-[#020617]/90 backdrop-blur-md w-full shadow-2xl relative rounded-none p-6 pt-12 md:p-12 md:pt-20">
                  {/* Signature Blue Top Line */}
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500" />

                  <div className="text-center pb-6">
                    <div className="flex items-center justify-center mb-4">
                      <div className="bg-blue-500/10 border border-blue-500/50 text-blue-400 px-3 py-1.5 md:px-4 md:py-2 rounded-none text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em]">
                        ROUND 01 CLEARED
                      </div>
                    </div>

                    {/* Header: Responsive Font Size and Tracking */}
                    <h2 className="text-2xl sm:text-3xl md:text-5xl font-light tracking-[0.1em] sm:tracking-[0.2em] text-white uppercase font-sans text-center px-2">
                      Congratulations!
                    </h2>

                    <p className="text-center text-[10px] md:text-[14px] font-black tracking-[0.15em] md:tracking-[0.2em] text-slate-300 mt-4 uppercase font-mono">
                      You have qualified for Round 2
                    </p>
                  </div>

                  <div className="space-y-6 md:space-y-8">
                    {/* Stats Divider: Responsive font sizes */}
                    <div className="grid grid-cols-2 border-y border-slate-500/50 py-6 md:py-8 font-mono">
                      <div className="border-r border-slate-500/50 text-center">
                        <div className="text-2xl md:text-3xl font-light text-white">
                          02
                        </div>
                        <div className="text-[10px] md:text-[12px] text-slate-300 uppercase tracking-widest mt-1">
                          Target Round
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl md:text-3xl font-light text-emerald-500">
                          01
                        </div>
                        <div className="text-[10px] md:text-[12px] text-slate-300 uppercase tracking-widest mt-1">
                          Rounds Cleared
                        </div>
                      </div>
                    </div>

                    {/* Motivational Message: Better padding and text wrapping */}
                    <div className="space-y-4 md:space-y-6 pt-2">
                      <p className="text-xs sm:text-sm md:text-base text-slate-200 text-center leading-relaxed uppercase tracking-[0.2em] md:tracking-[0.25em] font-black font-mono px-2">
                        You have successfully{" "}
                        <span className="text-blue-400">advanced</span>
                        <br className="hidden sm:block" /> to the next stage
                      </p>

                      <div className="flex items-center justify-center gap-2 md:gap-3">
                        <div className="h-[1px] w-4 md:w-8 bg-slate-800" />
                        <p className="text-[9px] md:text-[12px] text-slate-500 text-center uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold font-mono">
                          Protocol: Challenge 02 Ready
                        </p>
                        <div className="h-[1px] w-4 md:w-8 bg-slate-800" />
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={handleRoundNavigation}
                      className="w-full bg-white text-black hover:bg-blue-600 hover:text-white font-black text-[11px] md:text-[13px] uppercase tracking-[0.3em] md:tracking-[0.4em] h-12 md:h-14 transition-all duration-300 flex items-center justify-center gap-2 rounded-none"
                    >
                      <span>Initialize Round 02</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Background Glow */}
                <div className="absolute inset-0 -z-10 bg-blue-500/5 blur-[80px] md:blur-[120px] rounded-full" />
              </div>
            </div>
          ) : isRoundThreeOrHigher ? (
            <div className="flex items-center justify-center h-full z-10 relative">
              <div className="relative">
                {/* Achievement Icon */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="relative">
                    <Star className="w-16 h-16 text-blue-500 animate-pulse" />
                    <Trophy className="w-8 h-8 text-blue-400 absolute -bottom-2 -right-2" />
                  </div>
                </div>

                {/* Main Card: Fixed dark theme */}
                <div className="border border-slate-800 bg-[#020617]/95 backdrop-blur-md w-[85vw] md:w-[42vw] shadow-2xl relative rounded-none p-10 pt-16">
                  {/* Signature Blue Top Line */}
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500" />

                  <div className="text-center pb-8">
                    <div className="flex items-center justify-center mb-6">
                      <div className="bg-blue-500/10 border border-blue-500/50 text-blue-400 px-6 py-2 rounded-none text-[10px] font-black uppercase tracking-[0.4em]">
                        LEVEL {userInfo?.round} COMPLETE
                      </div>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-light tracking-[0.15em] text-white uppercase font-sans">
                      Outstanding Achievement
                    </h2>

                    <p className="text-[11px] font-black tracking-[0.2em] text-slate-500 mt-4 uppercase font-mono">
                      Candidate verification for Round {userInfo?.round}{" "}
                      successful
                    </p>
                  </div>

                  <div className="space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 border-y border-slate-800/50 py-8 font-mono">
                      <div className="border-r border-slate-800/50 text-center">
                        <div className="text-3xl font-light text-white">
                          {userInfo?.round}
                        </div>
                        <div className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">
                          Current Round
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-light text-blue-400">
                          {(userInfo?.round || 1) - 1}
                        </div>
                        <div className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">
                          Rounds Cleared
                        </div>
                      </div>
                    </div>

                    {/* Structured Success Message */}
                    <div className="space-y-6 pt-2">
                      <div className="space-y-3">
                        <p className="text-sm md:text-base text-slate-200 text-center leading-relaxed uppercase tracking-[0.15em] font-black font-mono px-4">
                          You have successfully{" "}
                          <span className="text-blue-400 font-black">
                            Concluded
                          </span>
                          <br />
                          Round {userInfo?.round} Assessment
                        </p>
                      </div>

                      {/* Technical Separator */}
                      <div className="flex items-center justify-center gap-3">
                        <div className="h-[1px] w-8 bg-slate-800" />
                        <div className="w-1.5 h-1.5 bg-blue-500/50 rotate-45" />
                        <div className="h-[1px] w-8 bg-slate-800" />
                      </div>

                      <div className="space-y-3">
                        <p className="text-[11px] text-slate-400 text-center uppercase tracking-[0.1em] font-bold font-mono px-6">
                          Please standby for further instructions. The
                          recruitment team will process your performance data
                          shortly.
                        </p>
                        <p className="text-[10px] text-blue-500/60 text-center uppercase tracking-[0.3em] font-black font-mono animate-pulse">
                          Awaiting Next Phase Initialization
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative background glow */}
                <div className="absolute inset-0 -z-10 bg-blue-500/5 blur-[120px] rounded-full" />
              </div>
            </div>
          ) : showStartButton ? (
            <div className="flex items-center justify-center h-full flex-col space-y-16">
              {/* Timer Section */}
              <div className="flex items-center justify-center flex-col space-y-8">
                <span className="text-slate-500 text-xs md:text-sm font-bold uppercase tracking-[0.4em] font-mono">
                  Window Closing In
                </span>
                <div className="flex justify-center gap-8 md:gap-12">
                  {[
                    { label: "DAYS", value: timeLeft.days },
                    { label: "HOURS", value: timeLeft.hours },
                    { label: "MINS", value: timeLeft.minutes },
                    { label: "SECS", value: timeLeft.seconds },
                  ].map((item, index, array) => (
                    <React.Fragment key={item.label}>
                      <div className="flex flex-col items-center">
                        <p className="font-bold text-5xl md:text-7xl text-slate-100 tabular-nums tracking-tighter">
                          {String(item.value).padStart(2, "0")}
                        </p>
                        <div className="text-[10px] text-slate-500 mt-3 tracking-[0.2em] font-bold">
                          {item.label}
                        </div>
                      </div>
                      {index !== array.length - 1 && (
                        <p className="font-light text-4xl md:text-6xl text-slate-800 self-center -mt-6">
                          :
                        </p>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Quiz Card */}
              <Card className="border-white/5 w-[85vw] md:w-[35vw] bg-black/60 backdrop-blur-xl rounded-none shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <CardHeader className="pb-4 border-b border-white/5 mx-6 px-0">
                  <CardTitle className="text-lg text-white font-bold uppercase tracking-[0.2em]">
                    General Round
                  </CardTitle>
                  <CardDescription className="text-[11px] text-slate-500 uppercase tracking-widest font-medium">
                    Time to put your skills to the test
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 pt-8 px-6">
                  <p className="text-slate-400 text-sm font-medium leading-relaxed tracking-wide">
                    Please go through the{" "}
                    <Popover>
                      <PopoverTrigger>
                        <span className="text-blue-500 hover:text-blue-400 cursor-pointer underline underline-offset-8 transition-colors">
                          rules
                        </span>
                      </PopoverTrigger>
                      <PopoverContent className="bg-black border-white/10 rounded-none shadow-2xl">
                        <div className="space-y-3 p-1">
                          {[
                            "45:00 MINUTE DURATION",
                            "10 SYSTEM QUESTIONS",
                            "BINARY SCORING (1/0)",
                            "ZERO PENALTY PROTOCOL",
                          ].map((rule) => (
                            <p
                              key={rule}
                              className="text-[10px] text-slate-400 font-mono tracking-widest flex items-center gap-3"
                            >
                              <span className="w-1 h-1 bg-blue-600" /> {rule}
                            </p>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>{" "}
                    before attempting.
                  </p>

                  <Button
                    onClick={() => push("/exam")}
                    className={cn(
                      "w-full h-14 text-[16px] font-black uppercase tracking-[0.3em] transition-colors rounded-none cursor-pointer ",
                      "bg-[#f1f5f9] text-slate-950 hover:bg-white", // Sharp Off-white
                      "animate-futuristic"

                    )}
                  >
                    Start Test
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : null}

          <AnimatedGridPattern
            numSquares={30}
            maxOpacity={0.5}
            duration={3}
            repeatDelay={1}
            className={cn(
              "[mask-image:radial-gradient(1024px_circle_at_center,white,transparent)]",
              " h-[94%] overflow-hidden skew-y-3"
            )}
          />
          <Meteors number={20} />
        </div>
      )}
    </div>
  );
}

export default Dashboard

function onComplete() {
  throw new Error('Function not implemented.');
}
