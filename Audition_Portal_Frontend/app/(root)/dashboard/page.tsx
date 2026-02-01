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
import { FaWhatsapp } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchUserData, selectAuthState, verifyToken } from '@/lib/store/features/auth/authSlice';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { CheckCircle2, ArrowRight, Trophy, Sparkles, Star } from 'lucide-react';
import { panelLinks } from '@/components/panelLinks';

const Dashboard = () => {
  const calculateTimeLeft = () => {
    const targetDate = "2026-02-03T23:59:59"; // Your actual round end date
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
        const userData = await dispatch(fetchUserData()).unwrap();

        // 3. Check if profile is complete
        const isProfileComplete = userData.contact && userData.gender && userData.specialization;

        // 4. If panel is not set and round is 2, fetch Round 2 data to get panel
        // if (userData.round === 2 && (!userData.panel || userData.panel === 0)) {
        //       await handleUserPanel();
        // }

        if (!isProfileComplete) {
          // Redirect to profile page if incomplete
          push("/profile");
          return;
        }
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
  const [panel, setPanel] = useState<number | null>(null);
  
  // Check if timer has expired (all values are 0)
  const isTimerExpired = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  // Get submission reason from sessionStorage
  const [submissionReason, setSubmissionReason] = useState<'manual' | 'timeout' | 'violation' | null>(null);

  useEffect(() => {
    if (hasCompletedQuiz) {
      const reason = sessionStorage.getItem('examSubmissionReason') as 'manual' | 'timeout' | 'violation' | null;
      setSubmissionReason(reason);
    }
  }, [hasCompletedQuiz]);

  // Get submission message based on reason
  const getSubmissionMessage = () => {
    switch (submissionReason) {
      case 'violation':
        return {
          primary: 'Due to security violation, your exam was',
          highlight: 'auto-submitted',
        };
      case 'timeout':
        return {
          primary: 'Your 45-minute session has',
          highlight: 'successfully timed out',
        };
      case 'manual':
      default:
        return {
          primary: 'Your exam has been',
          highlight: 'successfully submitted',
        };
    }
  };

  const submissionMessage = getSubmissionMessage();

  const handleRoundNavigation = () => {
    if (userInfo?.round === 2) {
      push(`/exam/round2`);
    }
  };


  // Fetch user's panel number
  const handleUserPanel = async () => {
    if (userInfo?.round === 2) {
      try {
        const round2Res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/round2/data`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (round2Res.ok) {
          const round2Data = await round2Res.json();
          if (round2Data.entry) {
            const reviewPanel = round2Data.entry.panel;
            setPanel(reviewPanel);
          }
        };
      } catch (error) {
        console.error("Error fetching Round 2 data:", error);
      }
    }
  }

  useEffect(() => {
  if (userInfo?.round === 2) {
    handleUserPanel();
  }
}, [userInfo?.round]);

  return (
    <div>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="relative min-h-screen w-screen overflow-x-hidden overflow-y-auto">
          <div className="fixed top-4 sm:top-6 right-4 sm:right-6 z-50">
            <Popover>
              <PopoverTrigger>
                <Avatar className="hover:brightness-75 w-10 h-10 sm:w-11 sm:h-11 cursor-pointer">
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

          <div className="fixed top-5 sm:top-7 left-4 sm:left-7 text-lg sm:text-xl md:text-2xl lg:text-3xl text-slate-300 z-50">
            Dashboard
          </div>

          {hasCompletedQuiz ? (
            <div className="flex items-center justify-center min-h-screen sm:h-full flex-col space-y-8 sm:space-y-12 z-10 relative px-4 py-8 sm:py-0">
              {/* Themed Completion Card */}
              <div className="max-w-xl w-full border border-slate-800 bg-card/90 backdrop-blur-md p-6 sm:p-10 md:p-14 rounded-none shadow-2xl relative text-center">
                {/* Blue Top Accent Line */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500" />

                <div className="space-y-6 sm:space-y-8">
                  {/* Icon with Emerald Glow */}
                  <div className="relative inline-block">
                    <div className="absolute inset-0 blur-xl bg-emerald-500/10 rounded-full" />
                    <CheckCircle2 className="w-16 h-16 sm:w-20 sm:h-20 text-emerald-500 relative z-10 mx-auto" />
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <p className="text-blue-500 tracking-[0.3em] sm:tracking-[0.5em] text-[9px] sm:text-[10px] uppercase font-black font-mono">
                      Assessment Concluded
                    </p>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-wide sm:tracking-widest text-white font-sans uppercase px-2">
                      Test Completed
                    </h2>
                  </div>

                  {/* Aesthetic Divider */}
                  <div className="flex items-center justify-center gap-3 sm:gap-4">
                    <div className="w-8 sm:w-12 h-[1px] bg-slate-800" />
                    <div className="w-2 h-2 border border-slate-700 rotate-45" />
                    <div className="w-8 sm:w-12 h-[1px] bg-slate-800" />
                  </div>

                  <div className="space-y-4 sm:space-y-5 font-mono">
                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed uppercase tracking-[0.1em] sm:tracking-[0.15em] font-bold px-2 sm:px-4">
                      {submissionMessage.primary}{" "}
                      <span className="text-white">{submissionMessage.highlight}</span>{" "}
                      and all responses have been saved.
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-[0.15em] sm:tracking-[0.2em] leading-relaxed max-w-xs mx-auto px-2">
                      GLUG will now review your performance.
                      Results will be updated on this portal soon.
                    </p>
                  </div>

                  {/* Terminal Status Instead of Button */}
                  <div className="pt-2 sm:pt-4">
                    <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-3 border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.2em]">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                      <span className="hidden xs:inline">Status: </span>Evaluation in Progress
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Footer Detail */}
              <div className="font-mono text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-[0.3em] sm:tracking-[0.5em] text-center px-2">
                <span className="hidden sm:inline">End of Line // Transmission_Complete // </span>
                {new Date().toLocaleTimeString()}
              </div>
            </div>
          ) : isRoundTwo ? (
            <div className="flex items-center justify-center min-h-screen z-10 relative px-4 py-8 sm:py-12">
              <div className="relative w-full max-w-2xl">
                {/* Trophy Section: Responsive scaling and positioning */}
                <div className="absolute -top-4 sm:-top-6 md:-top-10 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="relative">
                    {/* Added responsive w/h: w-12 on mobile, w-20 on desktop */}
                    <Trophy className="w-10 h-10 sm:w-12 sm:h-12 md:w-20 md:h-20 text-blue-500 animate-bounce" />
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 md:w-8 md:h-8 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
                  </div>
                </div>

                {/* Main Card */}
                <div className="border border-slate-800 bg-[#020617]/90 backdrop-blur-md w-full shadow-2xl relative rounded-none p-6 pt-10 sm:p-8 sm:pt-14 md:p-12 md:pt-20">
                  {/* Signature Blue Top Line */}
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500" />

                  <div className="text-center pb-4 sm:pb-6">
                    <div className="flex items-center justify-center mb-3 sm:mb-4">
                      <div className="bg-blue-500/10 border border-blue-500/50 text-blue-400 px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-none text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]">
                        ROUND 01 CLEARED
                      </div>
                    </div>

                    {/* Header: Responsive Font Size and Tracking */}
                    <h2 className="text-2xl sm:text-3xl md:text-5xl font-light tracking-[0.08em] sm:tracking-[0.15em] md:tracking-[0.2em] text-white uppercase font-sans text-center px-2">
                      Congratulations!
                    </h2>

                    <p className="text-center text-[10px] sm:text-[11px] md:text-[14px] font-black tracking-[0.12em] sm:tracking-[0.15em] md:tracking-[0.2em] text-slate-300 mt-3 sm:mt-4 uppercase font-mono">
                      You have qualified for Round 2
                    </p>
                  </div>

                  <div className="space-y-5 sm:space-y-6 md:space-y-8">
                    {/* Stats Divider: Responsive font sizes */}
                    <div className="grid grid-cols-2 border-y border-slate-500/50 py-5 sm:py-6 md:py-8 font-mono">
                      <div className="border-r border-slate-500/50 text-center">
                        <div 
                          onClick={() => {
                            // console.log('Panel:', panel);
                            // console.log('Panel Links:', panelLinks);
                            if (panel && panelLinks[panel]) {
                              window.open(panelLinks[panel], '_blank', 'noopener,noreferrer');
                            } else {
                              alert('Panel information not available yet');
                            }
                          }}
                          className={`inline-block ${!panel ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 transition-transform cursor-pointer'}`}
                        >
                          <FaWhatsapp className="text-3xl sm:text-5xl md:text-6xl text-green-500 mx-auto" />
                        </div>
                        <div className="text-[9px] sm:text-[10px] md:text-[12px] text-slate-300 uppercase tracking-widest mt-2">
                          Join Round 2 Panel
                        </div>
                      </div>
                      <div className="text-center flex pt-4 flex-col justify-between items-center ">
                        <div className="text-2xl   sm:text-2xl md:text-3xl font-light text-emerald-500">
                          01
                        </div>
                        <div className="text-[9px]   sm:text-[10px] md:text-[12px] text-slate-300 uppercase tracking-widest mt-1">
                          Rounds Cleared
                        </div>
                      </div>
                    </div>

                    {/* Motivational Message: Better padding and text wrapping */}
                    <div className="space-y-3 sm:space-y-4 md:space-y-6 pt-2">
                      <p className="text-xs sm:text-sm md:text-base text-slate-200 text-center leading-relaxed uppercase tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.25em] font-black font-mono px-2">
                        You have successfully{" "}
                        <span className="text-blue-400">advanced</span>
                        <br className="hidden sm:block" /> to the next stage
                      </p>

                      <div className="flex items-center justify-center gap-2 md:gap-3">
                        <div className="h-[1px] w-4 md:w-8 bg-slate-800" />
                        <p className="text-[8px] sm:text-[9px] md:text-[12px] text-slate-500 text-center uppercase tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.3em] font-bold font-mono px-1">
                          Protocol: Challenge 02 Ready
                        </p>
                        <div className="h-[1px] w-4 md:w-8 bg-slate-800" />
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={handleRoundNavigation}
                      className="w-full bg-white text-black hover:bg-blue-600 hover:text-white font-black text-[10px] sm:text-[11px] md:text-[13px] uppercase tracking-[0.25em] sm:tracking-[0.3em] md:tracking-[0.4em] h-11 sm:h-12 md:h-14 transition-all duration-300 flex items-center justify-center gap-2 rounded-none"
                    >
                      <span>Initialize Round 02</span>
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>

                {/* Background Glow */}
                <div className="absolute inset-0 -z-10 bg-blue-500/5 blur-[60px] sm:blur-[80px] md:blur-[120px] rounded-full" />
              </div>
            </div>
          ) : isRoundThreeOrHigher ? (
            <div className="flex items-center justify-center min-h-screen z-10 relative px-4 py-8 sm:py-0">
              <div className="relative w-full max-w-2xl">
                {/* Achievement Icon */}
                <div className="absolute -top-4 sm:-top-6 md:-top-8 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="relative">
                    <Star className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-blue-500 animate-pulse" />
                    <Trophy className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-400 absolute -bottom-1 sm:-bottom-2 -right-1 sm:-right-2" />
                  </div>
                </div>

                {/* Main Card: Fixed dark theme */}
                <div className="border border-slate-800 bg-[#020617]/95 backdrop-blur-md w-full shadow-2xl relative rounded-none p-6 pt-12 sm:p-8 sm:pt-14 md:p-10 md:pt-16">
                  {/* Signature Blue Top Line */}
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500" />

                  <div className="text-center pb-6 sm:pb-8">
                    <div className="flex items-center justify-center mb-4 sm:mb-6">
                      <div className="bg-blue-500/10 border border-blue-500/50 text-blue-400 px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-2 rounded-none text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-[0.25em] sm:tracking-[0.3em] md:tracking-[0.4em]">
                        LEVEL {(userInfo?.round || 1) - 1}  COMPLETE
                      </div>
                    </div>

                    <h2 className="text-2xl sm:text-3xl md:text-5xl font-light tracking-[0.08em] sm:tracking-[0.12em] md:tracking-[0.15em] text-white uppercase font-sans px-2">
                      Outstanding Achievement
                    </h2>

                    <p className="text-[10px] sm:text-[11px] font-black tracking-[0.15em] sm:tracking-[0.2em] text-slate-500 mt-3 sm:mt-4 uppercase font-mono">
                      Candidate verification for Round {userInfo?.round}{" "}
                      successful
                    </p>
                  </div>

                  <div className="space-y-6 sm:space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 border-y border-slate-800/50 py-6 sm:py-8 font-mono">
                      <div className="border-r border-slate-800/50 text-center">
                        <div className="text-2xl sm:text-3xl font-light text-white">
                          {userInfo?.round}
                        </div>
                        <div className="text-[8px] sm:text-[9px] text-slate-500 uppercase tracking-widest mt-1">
                          Current Round
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl sm:text-3xl font-light text-blue-400">
                          {(userInfo?.round || 1) - 1}
                        </div>
                        <div className="text-[8px] sm:text-[9px] text-slate-500 uppercase tracking-widest mt-1">
                          Rounds Cleared
                        </div>
                      </div>
                    </div>

                    {/* Structured Success Message */}
                    <div className="space-y-4 sm:space-y-6 pt-2">
                      <div className="space-y-2 sm:space-y-3">
                        <p className="text-xs sm:text-sm md:text-base text-slate-200 text-center leading-relaxed uppercase tracking-[0.12em] sm:tracking-[0.15em] font-black font-mono px-2 sm:px-4">
                          You have successfully{" "}
                          <span className="text-blue-400 font-black">
                            Concluded
                          </span>
                          <br />
                          Round {(userInfo?.round || 1) - 1} Assessment
                        </p>
                      </div>

                      {/* Technical Separator */}
                      <div className="flex items-center justify-center gap-2 sm:gap-3">
                        <div className="h-[1px] w-6 sm:w-8 bg-slate-800" />
                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-blue-500/50 rotate-45" />
                        <div className="h-[1px] w-6 sm:w-8 bg-slate-800" />
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <p className="text-[10px] sm:text-[11px] text-slate-400 text-center uppercase tracking-[0.08em] sm:tracking-[0.1em] font-bold font-mono px-4 sm:px-6">
                          Please standby for further instructions.
                          GLUG will process your performance data
                          shortly.
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-blue-500/60 text-center uppercase tracking-[0.2em] sm:tracking-[0.3em] font-black font-mono animate-pulse">
                          Awaiting Next Phase Initialization
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative background glow */}
                <div className="absolute inset-0 -z-10 bg-blue-500/5 blur-[80px] sm:blur-[100px] md:blur-[120px] rounded-full" />
              </div>
            </div>
          ) : showStartButton ? (
            <div className="flex items-center justify-center min-h-screen sm:h-full flex-col space-y-8 sm:space-y-10 md:space-y-16 px-4 py-8 sm:py-0">
              {/* Timer Section */}
              <div className="flex items-center justify-center flex-col space-y-4 sm:space-y-6 md:space-y-8">
                <span className="text-slate-500 text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-[0.25em] sm:tracking-[0.3em] md:tracking-[0.4em] font-mono">
                  Window Closing In
                </span>
                <div className="flex justify-center gap-3 sm:gap-6 md:gap-8 lg:gap-12">
                  {[
                    { label: "DAYS", value: timeLeft.days },
                    { label: "HOURS", value: timeLeft.hours },
                    { label: "MINS", value: timeLeft.minutes },
                    { label: "SECS", value: timeLeft.seconds },
                  ].map((item, index, array) => (
                    <React.Fragment key={item.label}>
                      <div className="flex flex-col items-center">
                        <p className="font-bold text-2xl sm:text-4xl md:text-5xl lg:text-7xl text-slate-100 tabular-nums tracking-tighter">
                          {String(item.value).padStart(2, "0")}
                        </p>
                        <div className="text-[7px] sm:text-[9px] md:text-[10px] text-slate-500 mt-1.5 sm:mt-2 md:mt-3 tracking-[0.12em] sm:tracking-[0.15em] md:tracking-[0.2em] font-bold">
                          {item.label}
                        </div>
                      </div>
                      {index !== array.length - 1 && (
                        <p className="font-light text-xl sm:text-3xl md:text-4xl lg:text-6xl text-slate-800 self-center -mt-2 sm:-mt-4 md:-mt-6">
                          :
                        </p>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Quiz Card */}
              <Card className="border-white/5 w-full sm:w-[85vw] md:w-[50vw] lg:w-[35vw] max-w-lg bg-black/60 backdrop-blur-xl rounded-none shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <CardHeader className="pb-3 sm:pb-4 border-b border-white/5 mx-4 sm:mx-6 px-0">
                  <CardTitle className="text-sm sm:text-base md:text-lg text-white font-bold uppercase tracking-[0.12em] sm:tracking-[0.15em] md:tracking-[0.2em]">
                    General Round
                  </CardTitle>
                  <CardDescription className="text-[9px] sm:text-[10px] md:text-[11px] text-slate-500 uppercase tracking-wide sm:tracking-wider md:tracking-widest font-medium">
                    Time to put your skills to the test
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5 sm:space-y-6 md:space-y-8 pt-5 sm:pt-6 md:pt-8 px-4 sm:px-6">
                  <p className="text-slate-400 text-[11px] sm:text-xs md:text-sm font-medium leading-relaxed tracking-wide">
                    Please go through the{" "}
                    <Popover>
                      <PopoverTrigger>
                        <span className="text-blue-500 hover:text-blue-400 cursor-pointer underline underline-offset-4 sm:underline-offset-8 transition-colors">
                          rules
                        </span>
                      </PopoverTrigger>
                      <PopoverContent className="bg-black border-white/10 rounded-none shadow-2xl">
                        <div className="space-y-2 sm:space-y-3 p-1">
                          {[
                            "45:00 MINUTE DURATION",
                            "14 SYSTEM QUESTIONS",
                            "BINARY SCORING (1/0)",
                            "ZERO PENALTY PROTOCOL",
                          ].map((rule) => (
                            <p
                              key={rule}
                              className="text-[9px] sm:text-[10px] text-slate-400 font-mono tracking-wide sm:tracking-widest flex items-center gap-2 sm:gap-3"
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
                    onClick={() => !isTimerExpired && push("/exam")}
                    disabled={isTimerExpired}
                    className={cn(
                      "w-full h-11 sm:h-12 md:h-14 text-[12px] sm:text-[14px] md:text-[16px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.3em] transition-colors rounded-none",
                      isTimerExpired 
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                        : "bg-[#f1f5f9] text-slate-950 hover:bg-white cursor-pointer animate-futuristic"
                    )}
                  >
                    {isTimerExpired ? "Round 1 ended" : "Start Test"}
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