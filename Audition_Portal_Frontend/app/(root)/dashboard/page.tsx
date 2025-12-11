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

const Dashboard = () => {
  const calculateTimeLeft = () => {
    const targetDate = '2026-01-01';
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
    } else {
      onComplete();
    }

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

  useEffect(() => {
    dispatch(verifyToken())
      .unwrap()
      .then(() => {
        dispatch(fetchUserData())
          .unwrap()
          .finally(() => setIsLoading(false));
      })
      .catch(() => {
        push("/");
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      });
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`, {
        method: 'GET',
        credentials: 'include',
      });

      const data = await res.json();

      if (data.success) {
        push('/');
      } else {
        alert('Logout failed');
      }
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Error logging out');
    }
  }

  const hasCompletedQuiz = userInfo?.hasGivenExam && userInfo?.round === 1;
  const isRoundTwo = userInfo?.round === 2;
  const isRoundThreeOrHigher = userInfo?.round && userInfo.round >= 3;

  const handleRoundNavigation = () => {
    if (userInfo?.round === 2) {
      push(`/exam/round2`);
    }
  };

  return (
    <div>
      {isLoading ? (
        <Loader />
      ) : (
        <div className='relative h-screen w-screen overflow-hidden'>
          <div className="fixed top-6 right-6 z-50">
            <Popover>
              <PopoverTrigger>
                <Avatar className="hover:brightness-75 w-11 h-11 cursor-pointer">
                  <AvatarImage src={userInfo?.picture || undefined} alt="image" />
                  <AvatarFallback>
                    {userInfo?.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </PopoverTrigger>

              <PopoverContent className='dark'>
                <div className='flex flex-col p-4'>
                  <p className='text-slate-400 text-sm'>Signed in as</p>
                  <p className='text-slate-100 font-semibold'>{userInfo?.username}</p>
                  <Button
                    className='mt-4 dark'
                    onClick={() => push('/profile')}
                  >
                    View Profile
                  </Button>
                  <Button
                    variant={'outline'}
                    className='mt-2 dark'
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
            <div className='flex items-center justify-center h-full flex-col space-y-12'>
              {/* Timer */}
              <div className="flex items-center justify-center flex-col space-y-6">
                <span className="text-slate-300 text-xl md:text-3xl font-light">
                  Round ends in
                </span>
                <div className="flex justify-center gap-3 md:gap-5">
                  <div className="flex w-16 md:w-20 flex-col items-center">
                    <p className="font-bold text-3xl md:text-5xl text-slate-200">{timeLeft.days}</p>
                    <div className="text-xs md:text-sm text-slate-400 mt-1">Days</div>
                  </div>
                  <p className="font-bold text-3xl md:text-5xl text-slate-400">:</p>
                  <div className="flex w-16 md:w-20 flex-col items-center">
                    <p className="font-bold text-3xl md:text-5xl text-slate-200">{timeLeft.hours}</p>
                    <div className="text-xs md:text-sm text-slate-400 mt-1">Hours</div>
                  </div>
                  <p className="font-bold text-3xl md:text-5xl text-slate-400">:</p>
                  <div className="flex w-16 md:w-20 flex-col items-center">
                    <p className="font-bold text-3xl md:text-5xl text-slate-200">{timeLeft.minutes}</p>
                    <div className="text-xs md:text-sm text-slate-400 mt-1">Min</div>
                  </div>
                  <p className="font-bold text-3xl md:text-5xl text-slate-400">:</p>
                  <div className="flex w-16 md:w-20 flex-col items-center">
                    <p className="font-bold text-3xl md:text-5xl text-slate-200">{timeLeft.seconds}</p>
                    <div className="text-xs md:text-sm text-slate-400 mt-1">Sec</div>
                  </div>
                </div>
              </div>

              {/* Completion Card */}
              <Card className='dark border-slate-800 w-[85vw] md:w-[32vw]'>
                <CardHeader className="text-center pb-6">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <CardTitle className="text-2xl text-white">Quiz Completed</CardTitle>
                  <CardDescription className="text-base text-slate-400 mt-2">
                    Submitted successfully
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center pb-6">
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Your submission is under review. You&apos;ll be notified about the next round.
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : isRoundTwo ? (
            <div className='flex items-center justify-center h-full'>
              {/* Round 2 Card with Button */}
              <div className="relative">
                {/* Decorative elements */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                  <div className="relative">
                    <Trophy className="w-16 h-16 text-yellow-500 animate-bounce" />
                    <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
                  </div>
                </div>

                <Card className='dark border-emerald-500/50 w-[85vw] md:w-[42vw] bg-slate-900 shadow-2xl shadow-emerald-500/20'>
                  <CardHeader className="pb-6 pt-12">
                    <div className="flex items-center justify-center mb-4">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                        🎉 Qualified for Round 2
                      </div>
                    </div>
                    <CardTitle className="text-2xl md:text-3xl text-center bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent font-bold">
                      Congratulations!
                    </CardTitle>
                    <CardDescription className="text-center text-base text-slate-300 mt-3">
                      You&apos;ve successfully advanced to the next stage
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6 pb-8">
                    {/* Achievement Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-800 rounded-lg p-4 text-center border border-slate-600">
                        <div className="text-2xl font-bold text-emerald-400">2</div>
                        <div className="text-xs text-slate-400 mt-1">Current Round</div>
                      </div>
                      <div className="bg-slate-800 rounded-lg p-4 text-center border border-slate-600">
                        <div className="text-2xl font-bold text-blue-400">1</div>
                        <div className="text-xs text-slate-400 mt-1">Rounds Cleared</div>
                      </div>
                    </div>

                    {/* Motivational Message */}
                    <div className="bg-emerald-900/40 border border-emerald-500/50 rounded-lg p-4">
                      <p className="text-slate-200 text-sm text-center leading-relaxed">
                        You&apos;re doing great! Ready to take on the next challenge and prove your skills?
                      </p>
                    </div>

                    {/* Action Button */}
                    <button 
                      onClick={handleRoundNavigation} 
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold text-base py-6 rounded-md flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 transition-all duration-300 hover:shadow-green-500/50 hover:scale-[1.02]"
                    >
                      <span>Begin Round 2</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>

                    {/* Additional Info */}
                    <p className="text-center text-xs text-slate-400">
                      Make sure you&apos;re ready before starting the assessment
                    </p>
                  </CardContent>
                </Card>

                {/* Decorative glow effect */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-green-500/10 to-emerald-500/10 blur-3xl rounded-full" />
              </div>
            </div>
          ) : isRoundThreeOrHigher ? (
            <div className='flex items-center justify-center h-full'>
              {/* Round 3+ Congratulations Card - No Button */}
              <div className="relative">
                {/* Decorative elements */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                  <div className="relative">
                    <Star className="w-16 h-16 text-yellow-400 animate-pulse" />
                    <Trophy className="w-8 h-8 text-yellow-500 absolute -bottom-2 -right-2" />
                  </div>
                </div>

                <Card className='dark border-yellow-500/50 w-[85vw] md:w-[42vw] bg-slate-900 shadow-2xl shadow-yellow-500/20'>
                  <CardHeader className="pb-6 pt-12 text-center">
                    <div className="flex items-center justify-center mb-4">
                      <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                        🏆 Round {userInfo?.round} Cleared!
                      </div>
                    </div>
                    <CardTitle className="text-2xl md:text-3xl text-center bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent font-bold">
                      Outstanding Achievement!
                    </CardTitle>
                    <CardDescription className="text-center text-base text-slate-300 mt-3">
                      Congratulations on clearing Round {userInfo?.round}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6 pb-8">
                    {/* Achievement Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-800 rounded-lg p-4 text-center border border-slate-600">
                        <div className="text-2xl font-bold text-yellow-400">{userInfo?.round}</div>
                        <div className="text-xs text-slate-400 mt-1">Current Round</div>
                      </div>
                      <div className="bg-slate-800 rounded-lg p-4 text-center border border-slate-600">
                        <div className="text-2xl font-bold text-amber-400">{userInfo?.round - 1}</div>
                        <div className="text-xs text-slate-400 mt-1">Rounds Cleared</div>
                      </div>
                    </div>

                    {/* Success Message */}
                    <div className="bg-yellow-900/40 border border-yellow-500/50 rounded-lg p-6">
                      <p className="text-slate-200 text-base text-center leading-relaxed font-medium">
                        You&apos;ve successfully completed Round {userInfo?.round}! 🎉
                      </p>
                      <p className="text-slate-300 text-sm text-center mt-3">
                        Wait for further instructions from the team.
                      </p>
                    </div>

                    {/* Celebration Message */}
                    <div className="text-center py-4">
                      <p className="text-slate-400 text-sm">
                        You&apos;re one step closer to joining the team!
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Decorative glow effect */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 blur-3xl rounded-full" />
              </div>
            </div>
          ) : (
            <div className='flex items-center justify-center h-full flex-col space-y-14'>
              {/* Timer */}
              <div className="flex items-center justify-center flex-col space-y-7">
                <span className="text-slate-300 text-3xl md:text-5xl font-light">
                  Round ends in
                </span>
                <div className="flex justify-center gap-4 md:gap-6">
                  <div className="flex w-16 md:w-24 flex-col items-center">
                    <p className="font-bold text-4xl md:text-6xl text-slate-200">{timeLeft.days}</p>
                    <div className="text-sm md:text-base text-slate-400 mt-2">Days</div>
                  </div>
                  <p className="font-bold text-4xl md:text-6xl text-slate-400">:</p>
                  <div className="flex w-16 md:w-24 flex-col items-center">
                    <p className="font-bold text-4xl md:text-6xl text-slate-200">{timeLeft.hours}</p>
                    <div className="text-sm md:text-base text-slate-400 mt-2">Hours</div>
                  </div>
                  <p className="font-bold text-4xl md:text-6xl text-slate-400">:</p>
                  <div className="flex w-16 md:w-24 flex-col items-center">
                    <p className="font-bold text-4xl md:text-6xl text-slate-200">{timeLeft.minutes}</p>
                    <div className="text-sm md:text-base text-slate-400 mt-2">Min</div>
                  </div>
                  <p className="font-bold text-4xl md:text-6xl text-slate-400">:</p>
                  <div className="flex w-16 md:w-24 flex-col items-center">
                    <p className="font-bold text-4xl md:text-6xl text-slate-200">{timeLeft.seconds}</p>
                    <div className="text-sm md:text-base text-slate-400 mt-2">Sec</div>
                  </div>
                </div>
              </div>

              {/* Quiz Card */}
              <Card className='dark border-slate-800 w-[85vw] md:w-[38vw]'>
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-white">General Round</CardTitle>
                  <CardDescription className="text-base text-slate-400">
                    Time to put your skills to the test
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-300 text-base">
                    Please go through the{' '}
                    <Popover>
                      <PopoverTrigger>
                        <span className="text-blue-400 hover:text-blue-300 cursor-pointer underline">
                          rules
                        </span>
                      </PopoverTrigger>
                      <PopoverContent className='dark border-slate-800'>
                        <div className="space-y-2">
                          <p className="text-slate-300 text-sm">• 45 minutes to complete</p>
                          <p className="text-slate-300 text-sm">• 10 questions total</p>
                          <p className="text-slate-300 text-sm">• 1 mark per question</p>
                          <p className="text-slate-300 text-sm">• No negative marking</p>
                        </div>
                      </PopoverContent>
                    </Popover>
                    {' '}before attempting
                  </p>
                  <Button 
                    onClick={() => push('/exam')} 
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-base py-5"
                  >
                    Start Test
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          <AnimatedGridPattern
            numSquares={30}
            maxOpacity={0.5}
            duration={3}
            repeatDelay={1}
            className={cn(
              "[mask-image:radial-gradient(1024px_circle_at_center,white,transparent)]",
              " h-[94%] overflow-hidden skew-y-3",
            )}
          />
          <Meteors number={20} />
        </div>
      )}
    </div>
  )
}

export default Dashboard

function onComplete() {
  throw new Error('Function not implemented.');
}
