'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import AnimatedGridPattern from '@/components/magicui/animated-grid-pattern'
import { cn } from '@/lib/utils'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen w-full bg-[#02010a] text-slate-200 font-mono relative flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            top: ["10%", "40%", "10%"],
            left: ["10%", "30%", "10%"],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute w-[40vw] h-[40vw] bg-red-600/10 blur-[120px] rounded-full"
        />
        <motion.div
          animate={{
            bottom: ["10%", "30%", "10%"],
            right: ["10%", "40%", "10%"],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute w-[40vw] h-[40vw] bg-orange-600/10 blur-[120px] rounded-full"
        />
      </div>

      <div className="relative z-10 w-full max-w-2xl px-6 py-12">
        {/* Main Error Card */}
        <div className="relative border border-red-500/20 bg-white/5 backdrop-blur-2xl p-8 md:p-14 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
          {/* Top Red Line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-red-500 via-orange-500 to-red-700 shadow-[0_0_15px_#ef4444]" />

          {/* Content */}
          <div className="flex flex-col items-center space-y-8 text-center">
            {/* Alert Icon */}
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 blur-[30px] opacity-30 rounded-full" />
              <div className="relative bg-red-500/10 border-2 border-red-500/50 p-6 rounded-none">
                <AlertTriangle className="w-16 h-16 text-red-500" />
              </div>
            </div>

            {/* Error Code */}
            <div className="space-y-3">
              <p className="text-red-500 tracking-[0.5em] text-[10px] uppercase font-black">
                System Error
              </p>
              <h1 className="text-8xl md:text-9xl font-bold tracking-tighter text-white">
                404
              </h1>
              <h2 className="text-2xl md:text-3xl font-bold tracking-wider text-white uppercase">
                Route Not Found
              </h2>
            </div>

            {/* Description */}
            <div className="space-y-4 max-w-md">
              <p className="text-sm text-slate-300 leading-relaxed uppercase tracking-[0.15em] font-bold">
                The requested resource could not be located in the system database.
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="h-[1px] w-8 bg-slate-800" />
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black">
                  Error Code: 404_NOT_FOUND
                </p>
                <div className="h-[1px] w-8 bg-slate-800" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 w-full sm:w-auto">
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="border-slate-700 hover:border-white text-slate-300 hover:text-white bg-transparent rounded-none font-black uppercase tracking-[0.2em] text-[11px] h-12 px-8"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              <Button
                onClick={() => router.push('/')}
                className="bg-red-600 hover:bg-red-500 text-white rounded-none font-black uppercase tracking-[0.2em] text-[11px] h-12 px-8 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
              >
                <Home className="mr-2 h-4 w-4" />
                Return Home
              </Button>
            </div>
          </div>
        </div>

        {/* Technical Footer */}
        <div className="mt-8 text-center">
          <p className="text-[10px] text-slate-600 uppercase tracking-[0.5em] font-mono">
            AUDITION PORTAL // ERROR_404 // {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Background Grid Pattern */}
      <AnimatedGridPattern
        numSquares={40}
        maxOpacity={0.15}
        duration={3}
        repeatDelay={2}
        className={cn(
          "[mask-image:radial-gradient(900px_circle_at_center,white,transparent)]",
          "inset-y-[-10%] h-[120%] skew-y-3"
        )}
      />
    </div>
  )
}