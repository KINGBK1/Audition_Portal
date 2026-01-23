"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaGithub, FaPhotoVideo } from "react-icons/fa";
import { HiCheck, HiExclamation, HiClock } from "react-icons/hi";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, AlertCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { panelLinks } from "@/components/panelLinks";




export default function Round2() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();
  const [status, setStatus] = useState("incomplete");
  const [taskLink, setTaskLink] = useState("");
  const [gdLink, setGdLink] = useState("");
  const [taskLinkValid, setTaskLinkValid] = useState<boolean | null>(null);
  const [gdLinkValid, setGdLinkValid] = useState<boolean | null>(null);
  const [panel, setPanel] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewEntry, setIsNewEntry] = useState(true);
  const [isUnderReview, setIsUnderReview] = useState(false);

  // URL Validation Logic
  const validateUrl = (url: string, type: "github" | "creative"): boolean => {
    if (!url.trim()) return false;
    try {
      const urlObj = new URL(url);
      if (type === "github") return urlObj.hostname.includes("github.com");
      const validDomains = [
        "drive.google.com",
        "canva.com",
        "figma.com",
        "behance.net",
        "notion.site",
      ];
      return validDomains.some((domain) => urlObj.hostname.includes(domain));
    } catch {
      return false;
    }
  };

  const handleTaskLinkValidation = () => {
    const isValid = validateUrl(taskLink, "github");
    setTaskLinkValid(isValid);
    if (isValid) {
      toast.success("GitHub Verified", {
        style: { background: "#1e3a8a", color: "#fff", borderRadius: "0px" },
      });
    } else {
      toast.error(
        "Please enter a valid GitHub repository link (github.com only)",
        {
          style: { background: "#7f1d1d", color: "#fff", borderRadius: "0px" },
        }
      );
    }
  };

  const handleGdLinkValidation = () => {
    const isValid = validateUrl(gdLink, "creative");
    setGdLinkValid(isValid);
    if (isValid) {
      toast.success("Assets Verified", {
        style: { background: "#581c87", color: "#fff", borderRadius: "0px" },
      });
    } else {
      toast.error(
        "Please enter a valid Canva, Drive, Figma, or portfolio link",
        {
          style: { background: "#7f1d1d", color: "#fff", borderRadius: "0px" },
        }
      );
    }
  };

  const fetchUser = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const user = await res.json();

      // Only allow access if user is exactly in round 2
      if (!user.hasGivenExam || user.round !== 2) {
        toast.error("You are not authorized to access Round 2");
        router.push("/dashboard");
        return;
      }

      setPanel(user.panel ?? null);

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
          const dbStatus = round2Data.entry.status;
          const storedLinks = round2Data.entry.taskLink || "";
          const [firstLine, secondLine] = storedLinks.split(/\r?\n/, 2);
          const review = round2Data.entry.review;
          const reviewPanel = round2Data.entry.panel;

          setTaskLink(firstLine || "");
          setGdLink(secondLine || "");
          setStatus(dbStatus || "incomplete");
          setIsNewEntry(false);
          setPanel(reviewPanel);

          // Check review.forwarded status
          if (review) {
            if (review.forwarded === false) {
              // Submission is under review - disable submission
              setIsUnderReview(true);
              setIsSubmitted(true); // Keep form disabled
              if (firstLine) setTaskLinkValid(validateUrl(firstLine, "github"));
            } else if (review.forwarded === true) {
              // Forwarded is true - allow resubmission
              setIsUnderReview(false);
              setIsSubmitted(false);
            }
          } else {
            // No review exists yet
            if (dbStatus === "done") {
              setIsSubmitted(true);
              if (firstLine) setTaskLinkValid(validateUrl(firstLine, "github"));
            } else {
              setIsSubmitted(false);
            }
          }
        }
      }
    } catch (e) {
      toast.error("Failed to fetch user data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleSubmit = async () => {
    if (isSubmitted) return;

    // Validation Check
    if (!taskLink.trim() || !validateUrl(taskLink, "github")) {
      toast.error("Valid GitHub link is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const combinedLink = gdLink.trim()
        ? `${taskLink.trim()}\n${gdLink.trim()}`
        : taskLink.trim();

      const requestBody = {
        taskLink: combinedLink,
        taskAlloted: "Round 2 submission",
        status: "done",
        addOns: [],
        ...(isNewEntry && panel !== null && { panel }),
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/round2`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Submission failed");
      }

      setIsSubmitted(true);
      toast.success("SUBMISSION LOGGED SUCCESSFULLY");

      // Optional: Redirect after success
      setTimeout(() => router.push("/dashboard"), 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading)
    return (
      <div className="h-screen w-full bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen w-full bg-[#02010a] text-slate-200 font-mono relative flex flex-col items-center justify-center overflow-x-hidden overflow-y-auto">
      {/* DYNAMIC HIGH-BRIGHTNESS BACKGROUND */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Orbital Blue Orb */}
        <motion.div
          animate={{
            top: ["10%", "80%", "80%", "10%", "10%"],
            left: ["10%", "10%", "80%", "80%", "10%"],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute w-[50vw] h-[50vw] bg-blue-600/30 blur-[120px] rounded-full"
        />
        {/* Orbital Violet Orb */}
        <motion.div
          animate={{
            bottom: ["10%", "80%", "80%", "10%", "10%"],
            right: ["10%", "10%", "80%", "80%", "10%"],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute w-[45vw] h-[45vw] bg-purple-600/25 blur-[130px] rounded-full"
        />

        {/* Subtle Grid Overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(#1e293b 1px, transparent 1px)`,
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      <Toaster position="top-center" />

      <div className="container relative z-10 max-w-7xl w-full flex flex-col justify-between py-6 sm:py-10 px-4 sm:px-8">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mt-4 sm:mt-6"
        >
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-2">
            <div className="h-[1px] w-6 sm:w-12 bg-blue-400/50 shadow-[0_0_8px_#3b82f6]" />
            <p className="text-blue-400 tracking-[0.3em] sm:tracking-[0.6em] text-[9px] sm:text-[11px] uppercase font-black drop-shadow-lg">
              Authorized // Round 2 Submission
            </p>
            <div className="h-[1px] w-6 sm:w-12 bg-blue-400/50 shadow-[0_0_8px_#3b82f6]" />
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter text-white uppercase leading-tight">
            TECH{" "}
            <span className="relative inline-block pr-2 text-blue-600">
              REVIEW
            </span>
          </h1>
        </motion.div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 md:gap-10 w-full my-4 sm:my-6 items-stretch">
          {/* LEFT: FORMS */}
          <div className="lg:col-span-7 flex flex-col gap-4 sm:gap-6">
            <div className="group flex-1 border border-white/10 bg-white/5 backdrop-blur-2xl p-4 sm:p-6 relative rounded-none shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-all hover:border-blue-500/50">
              <div className="absolute top-0 left-0 w-full h-[4px] bg-blue-500 shadow-[0_0_15px_#3b82f6]" />
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2 sm:gap-4 mt-2 sm:mt-3">
                  <FaGithub className="text-2xl sm:text-3xl text-blue-300 animate-pulse" />
                  <h3 className="text-sm sm:text-xl font-mono font-bold uppercase tracking-wide sm:tracking-widest text-white">
                    GITHUB REPOSITORY LINK
                  </h3>
                </div>
                <Badge className="bg-blue-500 text-white rounded-none font-bold text-xs">
                  REQUIRED
                </Badge>
              </div>

              <div className="space-y-2 pt-2">
                <div className="relative">
                  <Input
                    value={taskLink}
                    disabled={isSubmitted || isUnderReview}
                    onChange={(e) => setTaskLink(e.target.value)}
                    placeholder="https://github.com/username/repository"
                    className="bg-black/80 border-slate-500 rounded-none h-10 sm:h-12 px-3 sm:px-4 text-xs sm:text-sm tracking-normal focus:border-blue-500 uppercase transition-all"
                  />
                  {taskLinkValid !== null && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {taskLinkValid ? (
                        <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                      ) : (
                        <AlertCircle className="h-6 w-6 text-red-400" />
                      )}
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleTaskLinkValidation}
                  disabled={isSubmitted || isSubmitting || isUnderReview}
                  className="w-full bg-blue-600 hover:bg-white hover:text-black text-white rounded-none h-10 sm:h-12 font-black uppercase tracking-tight text-xs sm:text-sm transition-all duration-500 mb-4"
                >
                  VALIDATE
                </Button>
                {taskLinkValid === false && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Please enter a valid GitHub repository link (github.com
                    only)
                  </p>
                )}
              </div>
            </div>

            <div className="group flex-1 border border-white/10 bg-white/5 backdrop-blur-2xl p-4 sm:p-6 relative rounded-none shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-all hover:border-purple-500/50">
              <div className="absolute top-0 left-0 w-full h-[4px] bg-purple-600 shadow-[0_0_15px_#9333ea]" />
              <div className="flex items-center gap-3 sm:gap-5 mb-4 sm:mb-6">
                <FaPhotoVideo className="text-2xl sm:text-3xl text-purple-400" />
                <h3 className="text-sm sm:text-xl font-mono font-bold uppercase tracking-wide sm:tracking-widest text-white">
                  Creative Assets Link (Optional)
                </h3>
              </div>
              <div className="space-y-2">
                <Input
                  value={gdLink}
                  disabled={isUnderReview}
                  onChange={(e) => setGdLink(e.target.value)}
                  placeholder="Canva, Drive, Figma, or Portfolio link"
                  className="bg-black/80 border-slate-700 rounded-none h-10 sm:h-12 px-3 sm:px-4 text-xs sm:text-sm tracking-normal focus:border-purple-500 uppercase transition-all"
                />
                <Button
                  onClick={handleGdLinkValidation}
                  disabled={isUnderReview}
                  className="w-full bg-slate-900 border border-purple-500/30 text-purple-400 hover:bg-purple-600 hover:text-white rounded-none h-10 sm:h-12 font-black uppercase tracking-tight text-xs sm:text-sm transition-all duration-500 mb-4"
                >
                  Validate
                </Button>
                {gdLinkValid === false && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Please enter a valid Canva, Drive, Figma, or portfolio link
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: STATUS */}
          {/* RIGHT: STATUS SELECTOR */}
          <div className="lg:col-span-5 self-start">
            <div className="border border-white/10 bg-white/5 backdrop-blur-3xl p-4 sm:p-6 relative shadow-2xl overflow-hidden">
              <motion.div
                animate={{
                  backgroundColor:
                    status === "done"
                      ? "#10b981"
                      : status === "partially done"
                      ? "#3b82f6"
                      : "#f55f4b",
                }}
                className="absolute top-0 left-0 w-full h-[3px] transition-colors duration-500"
              />

              <h3 className="text-base sm:text-lg font-mono font-bold uppercase tracking-wide text-white/90 mb-4 sm:mb-6 border-b border-white/10 pb-2">
                TASK STATUS
              </h3>

              <div className="space-y-3">
                {[
                  {
                    value: "done",
                    label: "Done",
                    icon: HiCheck,
                    color: "text-emerald-400",
                    activeClass:
                      "bg-emerald-500/20 border-emerald-500 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.2)]",
                  },
                  {
                    value: "partially done",
                    label: "Partially Done",
                    icon: HiClock,
                    color: "text-blue-400",
                    activeClass:
                      "bg-blue-500/20 border-blue-500 text-blue-100 shadow-[0_0_20px_rgba(59,130,246,0.2)]",
                  },
                  {
                    value: "incomplete",
                    label: "Incomplete",
                    icon: HiExclamation,
                    color: "text-amber-400",
                    activeClass:
                      "bg-red-500/20 border-red-500 text-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.2)]",
                  },
                ].map((option) => {
                  const isActive = status === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => !isSubmitted && !isUnderReview && setStatus(option.value)}
                      disabled={isUnderReview}
                      className={cn(
                        "w-full py-3 px-5 border transition-all duration-300 flex items-center justify-between rounded-none relative group",
                        isActive
                          ? option.activeClass
                          : "bg-black/40 border-white/10 text-slate-500 hover:border-white/30 hover:bg-white/5"
                      )}
                    >
                      {/* Background Glow Layer for Active State */}
                      {isActive && (
                        <motion.div
                          layoutId="statusGlow"
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                        />
                      )}

                      <span
                        className={cn(
                          "font-black uppercase tracking-[0.2em] text-[11px] z-10 transition-colors",
                          isActive ? "text-white" : "group-hover:text-slate-300"
                        )}
                      >
                        {option.label}
                      </span>

                      <option.icon
                        className={cn(
                          "text-xl z-10 transition-all duration-300",
                          isActive
                            ? "text-white scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                            : option.color
                        )}
                      />
                    </button>
                  );
                })}
              </div>

              <p className="mt-6 text-[9px] text-slate-400 uppercase tracking-widest text-center opacity-80">
                Select current task progress
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <motion.div className="flex flex-col items-center gap-3 sm:gap-4 mb-4 sm:mb-0">
          <Button
            onClick={handleSubmit}
            // Logic: Disable if already submitted OR if currently submitting OR if link isn't valid OR if under review
            disabled={isSubmitted || isSubmitting || !taskLinkValid || isUnderReview}
            className={cn(
              "group relative h-10 sm:h-12 w-full max-w-xl transition-all duration-700 rounded-none font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] text-sm sm:text-lg overflow-hidden",
              isUnderReview
                ? "bg-amber-900/40 text-amber-500 border border-amber-500/50 cursor-not-allowed shadow-none"
                : isSubmitted
                ? "bg-emerald-900/40 text-emerald-500 border border-emerald-500/50 cursor-not-allowed shadow-none"
                : "bg-blue-600 text-white hover:bg-blue-400 hover:text-black shadow-[0_0_50px_rgba(37,99,235,0.4)]"
            )}
          >
            {isUnderReview ? (
              <span className="flex items-center gap-2 sm:gap-3">
                <HiClock className="w-4 h-4 sm:w-6 sm:h-6" /> UNDER REVIEW
              </span>
            ) : isSubmitted ? (
              <span className="flex items-center gap-2 sm:gap-3">
                <HiCheck className="w-4 h-4 sm:w-6 sm:h-6" /> SUBMITTED
              </span>
            ) : isSubmitting ? (
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin" />
            ) : (
              <span className="flex items-center gap-3 sm:gap-6">
                FINAL SUBMISSION{" "}
                <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 group-hover:translate-x-4 transition-transform" />
              </span>
            )}
          </Button>
          <div className="flex items-center gap-4 sm:gap-10 opacity-40">
            <div className="h-[1px] w-12 sm:w-24 bg-blue-500" />
            <p className="text-[8px] sm:text-[10px] text-blue-400 uppercase tracking-[0.5em] sm:tracking-[1em] animate-pulse">
              SECURE_LINK_ESTABLISHED
            </p>
            <div className="h-[1px] w-12 sm:w-24 bg-blue-500" />
          </div>
        </motion.div>
      </div>

      <style jsx global>{`
        /* Set monospace font across the page */
        body,
        input,
        button,
        textarea,
        select,
        h1,
        h2,
        h3,
        h4,
        h5,
        h6,
        p,
        span,
        div {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco,
            "Roboto Mono", "Courier New", monospace;
        }

        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
