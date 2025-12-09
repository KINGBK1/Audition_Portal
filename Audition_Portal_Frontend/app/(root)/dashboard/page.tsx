'use client';

import Loader from '@/components/Loader';
// import { BackgroundBeams } from '@/components/ascertainityui/background-beams';
// import { BackgroundBeams } from '@/components/ascertainityui/background-beams';
// import { BackgroundGradientAnimation } from '@/components/ascertainityui/background-gradient-animation';
// import { Vortex } from '@/components/ascertainityui/vortex';
import AnimatedGradientText from '@/components/magicui/animated-gradient-text';
import AnimatedGridPattern from '@/components/magicui/animated-grid-pattern';
import { MagicCard, MagicContainer } from '@/components/magicui/magic-container';
import Meteors from '@/components/magicui/meteors';
import ShineBorder from '@/components/magicui/shine-border';
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
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

const Dashboard = () => {
  const calculateTimeLeft = () => {
    const targetDate = '2026-01-01'; // Replace '2022-01-01' with the actual target date
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

  //implement timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // console.log(userInfo);

  async function logout(): Promise<void> {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/logout`, {
        method: 'GET',
        credentials: 'include', // Send cookies
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


  return (
    <div>
      {isLoading ? (
        <Loader />
      ) : (
        <div className='relative h-screen w-screen overflow-hidden'>
          <div className="fixed top-0 right-0">
            <Popover>
              <PopoverTrigger>
                <Avatar className="hover:brightness-75 w-12 h-12">
                  <AvatarImage src={userInfo?.picture || undefined} alt="image" />
                <AvatarFallback>
                  {userInfo?.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
                </Avatar>
              </PopoverTrigger>

              <PopoverContent className='dark'>
                <div className='flex flex-col p-4'>
                  <p className='text-slate-300'>Signed in as</p>
                  <p className='text-slate-100 font-bold'>{userInfo?.username}</p>
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
          <div className="fixed top-7 left-7 text-2xl md:text-3xl text-slate-300">
            Dashboard
          </div>
          {/* Round Status (Counter) */}
          <div className='flex items-center space-y-24 md:space-y-32 justify-end flex-col'>
            <div className="h-[10vh] md:h-[4vh]"></div>
            {/* CountDown Timer */}
            <div className="flex items-center justify-center flex-col p-5  space-y-10 rounded-md text-slate-300 text-6xl">
              <AnimatedGradientText>
                <span
                  className={cn(
                    `text-center inline animate-gradient bg-gradient-to-r from-[#ffffff] via-[#cccccc92] to-[#f9f9f9e0] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent text-3xl md:text-6xl`,
                  )}
                >
                  Round ends in
                </span>
              </AnimatedGradientText>
              <div className="flex justify-center gap-5 text-2xl">
                <div className="flex w-10 md:w-20 flex-col justify-center items-center">
                  <p className="font-bold text-3xl md:text-6xl">{timeLeft.days}</p>
                  <div className="text-xs md:text-lg text-slate-200">Days</div>
                </div>
                <div>
                  <p className="font-bold text-3xl md:text-6xl animate-pulse"> : </p>
                </div>
                <div className="flex w-10 md:w-20 flex-col justify-center items-center">
                  <p className=" font-bold text-3xl md:text-6xl">{timeLeft.hours}</p>
                  <div className="text-xs md:text-lg text-slate-200">Hours</div>
                </div>
                <div>
                  <p className="font-bold text-3xl md:text-6xl animate-pulse"> : </p>
                </div>
                <div className="flex w-10 md:w-20 flex-col justify-center items-center">
                  <p className=" font-bold text-3xl md:text-6xl">{timeLeft.minutes}</p>
                  <div className="text-xs md:text-lg text-slate-200">Minutes</div>
                </div>
                <div>
                  <p className="font-bold text-3xl md:text-6xl animate-pulse"> : </p>
                </div>
                <div className="flex w-10 md:w-20 flex-col justify-center items-center">
                  <p className=" font-bold text-3xl md:text-6xl">{timeLeft.seconds}</p>
                  <div className="text-xs md:text-lg text-slate-200">Seconds</div>
                </div>
              </div>
            </div>
            {/* Card for showing Rules and Attempting Quiz*/}
            <MagicContainer className="relative z-10 dark w-[90vw] md:w-[40vw] flex items-center justify-center">
              <MagicCard className='dark w-[90vw] md:w-[40vw]'>
                <Card className='dark opacity-95'>
                  <CardHeader>
                    <CardTitle>General Round</CardTitle>
                    <CardDescription>Time to put your skills to the test</CardDescription>
                    <div className="h-4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className='flex flex-col md:flex-row items-center justify-between'>
                      <div>
                        <p>Please go through the <Popover>
                          <PopoverTrigger>
                            <Button variant="link">Rules</Button>
                          </PopoverTrigger>
                          <PopoverContent className='dark'>
                            <p>1. You will have 45 minutes to complete the test</p>
                            <p>2. The test consists of 10 questions</p>
                            <p>3. Each question carries 1 mark</p>
                            <p>4. There is no negative marking</p>
                          </PopoverContent>
                        </Popover> before attempting</p>
                      </div>
                      <div className='pt-6 md:pt-0'>
                        <Button onClick={() => push('/exam')}>Start Test</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </MagicCard>
            </MagicContainer>
          </div>
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
