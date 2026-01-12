"use client";

import type React from "react";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  RocketIcon,
  Brain,
  Timer,
  AlertTriangle,
  CheckCircle,
  ImageIcon,
} from "lucide-react";
import { QuestionType, type QuestionWithOptions } from "@/lib/types";
import Loader from "@/components/Loader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


// --- NEW REDUX IMPORTS ADDED ---
import { useAppDispatch } from "@/lib/hooks";
import { fetchUserData } from "@/lib/store/features/auth/authSlice";
// --------------------------------

const Exam = () => {
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(2700); // 45:00 in seconds
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{
    [key: number]: { optionId?: number; description?: string };
  }>({});
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  // --- DISPATCH HOOK INITIALIZED ---
  const dispatch = useAppDispatch();
  // ---------------------------------

  const [questions, setQuestions] = useState<QuestionWithOptions[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitConfirmText, setSubmitConfirmText] = useState("");
  const [confirmTimer, setConfirmTimer] = useState(10);

  // Timer logic for the modal
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (showSubmitModal && confirmTimer > 0) {
      // If modal is open and time remains, count down
      interval = setInterval(() => setConfirmTimer((prev) => prev - 1), 1000);
    } else if (showSubmitModal && confirmTimer === 0) {
      // TRIGGER AUTO-SUBMIT WHEN MODAL TIMER EXPIRES
      handleFinalSubmit();
      setShowSubmitModal(false);
    }

    return () => clearInterval(interval);
  }, [showSubmitModal, confirmTimer]); // Both dependencies are needed

  const openSubmitModal = () => {
    setShowSubmitModal(true);
    setConfirmTimer(10);
    setSubmitConfirmText("");
  };

  // Fetch questions and options and user from the server
  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoadingQuestions(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quiz`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data: any = await res.json();
        setQuestions(data);
      } catch (e) {
        toast({
          variant: "destructive",
          description: "Failed to load questions, please refresh.",
        });
      } finally {
        setIsLoadingQuestions(false);
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
        // console.log(user)
        if (user.hasGivenExam) {
          toast({
            variant: "destructive",
            description: "You have already given the exam.",
          });
          router.push("/dashboard");
        }
      } catch (e) {
        toast({
          variant: "destructive",
          description: "Failed to fetch user data, please refresh.",
        });
      }
    };
    fetchUser();
    fetchQuestions();
  }, [router]);

  const handleFinalSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const formattedAnswers = Object.entries(answers).map(
        ([questionId, answer]) => ({
          questionId: Number(questionId),
          option: answer.optionId ? { id: answer.optionId } : undefined,
          ans: answer.description || "",
        })
      );

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quiz/answer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ answers: formattedAnswers }),
        }
      );

      const data = await response.json();
      console.log("submit response:", response.status, data);

      if (!response.ok) {
        throw new Error(data?.message || "Failed to submit exam");
      }

      toast({
        className: "dark",
        variant: "default",
        description: "Exam submitted successfully.",
      });

      setIsExamStarted(false);

      // This line is now functional due to the added imports/hook
      await dispatch(fetchUserData()).unwrap();
      await new Promise((resolve) => setTimeout(resolve, 300));

      // This immediately navigates and shows the "Quiz Completed" screen on the dashboard.
      router.push("/dashboard");
    } catch (error) {
      console.error("Error submitting exam:", error);
      toast({
        className: "dark",
        variant: "destructive",
        description: "Failed to submit answers. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmit = async () => {
    if (isExamStarted) {
      await handleFinalSubmit();
    }
  };

  useEffect(() => {
    // Update progress based on answered questions
    if (questions.length > 0) {
      const answeredQuestions = Object.keys(answers).length;
      setProgress((answeredQuestions / questions.length) * 100);
    }
  }, [answers, questions.length]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isExamStarted) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer!); // Stop timer when time is up
            handleAutoSubmit();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer); // Clear the interval when component unmounts
    };
  }, [isExamStarted]);

  // Security handlers
  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden" && isExamStarted) {
      toast({
        className: "dark",
        variant: "destructive",
        description: "Switching tabs will submit your answers.",
      });
      handleAutoSubmit();
    }
  };

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    toast({
      className: "dark",
      variant: "destructive",
      description: "Right-click is disabled during the exam.",
    });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (
      (e.ctrlKey &&
        (e.key === "i" ||
          e.key === "I" ||
          e.key === "c" ||
          e.key === "C" ||
          e.key === "u" ||
          e.key === "U" ||
          e.key === "j" ||
          e.key === "J")) ||
      e.key === "F12"
    ) {
      e.preventDefault();
      toast({
        className: "dark",
        variant: "destructive",
        description:
          "Inspect element and other shortcuts are disabled during the exam.",
      });
    }
  };

  const handleWindowBlur = () => {
    if (isExamStarted) {
      toast({
        className: "dark",
        variant: "destructive",
        description: "Leaving the exam window will submit your answers.",
      });
      handleAutoSubmit();
    }
  };

  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    e.preventDefault();
    handleAutoSubmit();
  };

  const handleMouseMove = (e: MouseEvent) => {
    const x = e.clientX;
    const y = e.clientY;
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (x < 0 || x > w || y < 0 || y > h) {
      if (isExamStarted) {
        toast({
          className: "dark",
          variant: "destructive",
          description: "Switching workspaces will submit your answers.",
        });
        handleAutoSubmit();
      }
    }
  };

  const handleCopyPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    toast({
      className: "dark",
      variant: "destructive",
      description: "Copy and paste is disabled.",
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const startExam = async () => {
    setIsLoading(true);
    // Simulate loading
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsExamStarted(true);
    setIsLoading(false);

    // Add event listeners for security
    // document.addEventListener("visibilitychange", handleVisibilityChange)
    // document.addEventListener("contextmenu", handleContextMenu)
    // document.addEventListener("keydown", handleKeyDown)
    // window.addEventListener("blur", handleWindowBlur)
    // window.addEventListener("beforeunload", handleBeforeUnload)
    // document.addEventListener("mousemove", handleMouseMove)
  };

  const submitAnswer = async (questionId: number) => {
    const answer = answers[questionId];
    if (!answer) return;

    const currentQuestion = questions.find((q) => q.id === questionId);
    if (!currentQuestion) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quiz/answer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            questionId,
            option: answer.optionId ? { id: answer.optionId } : undefined,
            ans: answer.description || "",
          }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit answer");
      }

      return await response.json();
    } catch (error) {
      console.error("Error submitting answer:", error);
      throw error;
    }
  };

  const handleOptionSelect = (questionId: number, optionId: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], optionId },
    }));
  };

  const handleDescriptiveAnswer = (questionId: number, description: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], description },
    }));
  };

  const isQuestionAnswered = (questionId: number) => {
    const answer = answers[questionId];
    if (!answer) return false;

    const question = questions.find((q) => q.id === questionId);
    if (!question) return false;

    // For multiple choice, check if option is selected
    if (question.type === QuestionType.MCQ) {
      return !!answer.optionId;
    }

    // For descriptive or pictorial, check if description is not empty
    return !!answer.description && answer.description.trim() !== "";
  };

  const getQuestionTypeBadge = (type: QuestionType) => {
    switch (type) {
      case QuestionType.MCQ:
        return (
          <Badge variant="outline" className="text-blue-400 border-blue-400">
            Multiple Choice
          </Badge>
        );
      case QuestionType.Descriptive:
        return (
          <Badge variant="outline" className="text-green-400 border-green-400">
            Descriptive
          </Badge>
        );
      case QuestionType.Pictorial:
        return (
          <Badge
            variant="outline"
            className="text-purple-400 border-purple-400 flex items-center gap-1"
          >
            <ImageIcon className="w-3 h-3" />
            Pictorial
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-gray-400 border-gray-400">
            Unknown
          </Badge>
        );
    }
  };

  if (isLoadingQuestions) {
    return <Loader />;
  }

  return (
    /* 1. bg-background ensures the sidebars match your globals.css navy blue */
    <div className="min-h-screen w-full bg-background text-slate-200 font-mono relative overflow-x-hidden">
      {" "}
      <div className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none overflow-hidden">
        {" "}
        {/* Moving Scanning Beam */}
        <motion.div
          initial={{ top: "-20%" }}
          animate={{ top: "120%" }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-32 bg-gradient-to-b from-transparent via-cyan-600/15 to-transparent z-0"
        />
        {/* Subtle Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>
      <AnimatePresence mode="wait">
        {!isExamStarted ? (
          /* --- FUTURISTIC LOBBY --- */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-6 z-10 relative"
          >
            {/* bg-card/90 allows the background animation to be slightly visible behind the card */}
            <div className="max-w-2xl w-full space-y-8 border border-slate-800 bg-card/90 backdrop-blur-md p-10 md:p-14 rounded-none shadow-2xl relative">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500" />

              <div className="space-y-2">
                <p className="text-blue-500 tracking-[0.3em] text-[10px] uppercase font-black">
                  Identity Verification Required
                </p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-white uppercase">
                  Ready to be a part of the source?
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-6 border border-slate-800 bg-white/[0.03]">
                  <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-2">
                    Cognitive Assessment
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium">
                    Prepare to showcase your knowledge and problem-solving
                    skills in this journey.
                  </p>
                </div>

                <div className="p-6 border border-slate-800 bg-white/[0.03]">
                  <h3 className="text-xs font-black text-slate-100 uppercase tracking-widest mb-2">
                    Temporal Constraint
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium">
                    45 minutes to prove your expertise. Every single second
                    counts.
                  </p>
                </div>
              </div>

              {/* --- SECURITY PROTOCOLS (LARGER & MONO) --- */}
              <div className="space-y-4 pt-6 border-t border-slate-800">
                <div className="flex items-center space-x-2 text-amber-500 uppercase tracking-[0.1em] font-black text-sm md:text-base">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Security Protocols Active</span>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-[11px] md:text-[12px] text-slate-400 uppercase tracking-widest font-bold">
                  <li className="flex items-center gap-2">
                    <span className="text-amber-500/30">/</span> Full-screen
                    mandatory
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-amber-500/30">/</span> Tab switching
                    disabled
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-amber-500/30">/</span> Copy-paste
                    restricted
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-amber-500/30">/</span> Auto-submit on
                    violation
                  </li>
                </ul>
              </div>

              <div className="mt-8 flex flex-col md:flex-row items-end justify-between gap-6">
                <div className="w-full md:w-64 space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-slate-300 font-black">
                    Initialization Key
                  </label>
                  <input
                    type="text"
                    placeholder="TYPE 'START'"
                    className="w-full bg-transparent border-b-2 border-slate-800 py-2 px-2 text-white focus:outline-none focus:border-blue-500 transition-colors uppercase"
                    onChange={(e) =>
                      setRulesAccepted(e.target.value.toLowerCase() === "start")
                    }
                  />
                </div>
                <Button
                  disabled={!rulesAccepted || isLoading}
                  onClick={startExam}
                  className={cn(
                    "w-full md:w-auto h-14 px-12 rounded-none font-black uppercase tracking-[0.3em] text-[11px]",
                    "bg-slate-100 text-slate-950 hover:bg-white animate-slow-breath"
                  )}
                >
                  {isLoading ? "Synchronizing..." : "Initialize Test"}
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* --- EXAM VIEW --- */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-screen flex flex-col relative z-10 w-full overflow-hidden"
          >
            <header className="h-16 border-b border-slate-800 bg-background/90 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
              <div className="flex items-center gap-6">
                <h1 className="text-sm font-black tracking-[0.3em] text-white uppercase">
                  Round // 01
                </h1>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                  Progress: {Math.round(progress)}%
                </span>
              </div>
              <div
                className={cn(
                  "text-xl font-bold tabular-nums tracking-tighter",
                  timeLeft < 300
                    ? "text-red-500 animate-pulse"
                    : "text-blue-400"
                )}
              >
                {formatTime(timeLeft)}
              </div>
            </header>

            <main className="flex-1 w-full p-4 md:p-8 flex items-center justify-center overflow-hidden">
              <div className="container h-full grid md:grid-cols-12 gap-8 items-stretch">
                {/* ASIDE (Sidebar) with Answer Tracking */}
                <aside className="md:col-span-3 lg:col-span-2 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="grid grid-cols-5 md:grid-cols-2 gap-2">
                    {questions.map((q, index) => {
                      const isAnswered = isQuestionAnswered(q.id);
                      const isActive = currentQuestionIndex === index;

                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentQuestionIndex(index)}
                          className={cn(
                            "aspect-square md:aspect-auto md:h-12 flex items-center justify-center border transition-all rounded-none text-xs font-bold font-mono",
                            // 1. Priority: Active Question (Blue)
                            isActive
                              ? "bg-blue-600 border-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                              : // 2. Answered Question (Green)
                              isAnswered
                              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                              : // 3. Unanswered/Default
                                "border-slate-800 bg-card/40 text-slate-500 hover:border-slate-600"
                          )}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </button>
                      );
                    })}
                  </div>
                </aside>
                {/* MAIN CONTENT (Centered Card) */}
                <div className="md:col-span-9 lg:col-span-10 flex flex-col bg-card/30 backdrop-blur-sm border border-slate-800 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500/30" />

                  <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {questions.length > 0 &&
                      currentQuestionIndex < questions.length && (
                        <motion.div
                          key={currentQuestionIndex}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="space-y-8 max-w-4xl mx-auto"
                        >
                          <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                              <span className="text-[11px] text-blue-500 tracking-[0.3em] uppercase font-black">
                                QUESTION // {questions[currentQuestionIndex].id}
                              </span>
                              {getQuestionTypeBadge(
                                questions[currentQuestionIndex].type
                              )}
                            </div>

                            {/* IMAGE SUPPORT: Ensure q.imageUrl exists in your data */}
                            {questions[currentQuestionIndex].picture && (
                              <div className="w-full h-64 md:h-80 bg-black/40 border border-slate-800 flex items-center justify-center overflow-hidden">
                                <img
                                  src={questions[currentQuestionIndex].picture}
                                  alt="Question asset"
                                  className="max-w-full max-h-full object-contain p-2"
                                />
                              </div>
                            )}

                            <h2 className="text-xl md:text-2xl font-bold leading-relaxed text-white uppercase">
                              {questions[currentQuestionIndex].description}
                            </h2>
                          </div>

                          {/* ANSWERS AREA */}
                          <div className="pt-4">
                            {questions[currentQuestionIndex].type === "MCQ" ? (
                              <div className="grid gap-3">
                                {questions[currentQuestionIndex].options.map(
                                  (option) => (
                                    <label
                                      key={option.id}
                                      className={cn(
                                        "flex items-center p-5 border cursor-pointer group",
                                        answers[
                                          questions[currentQuestionIndex].id
                                        ]?.optionId === option.id
                                          ? "bg-blue-600/10 border-blue-600 text-white"
                                          : "bg-background/40 border-slate-800 text-slate-400"
                                      )}
                                    >
                                      <input
                                        type="radio"
                                        className="hidden"
                                        checked={
                                          answers[
                                            questions[currentQuestionIndex].id
                                          ]?.optionId === option.id
                                        }
                                        onChange={() =>
                                          handleOptionSelect(
                                            questions[currentQuestionIndex].id,
                                            Number(option.id)
                                          )
                                        }
                                      />
                                      <div
                                        className={cn(
                                          "w-4 h-4 border mr-4 flex items-center justify-center",
                                          answers[
                                            questions[currentQuestionIndex].id
                                          ]?.optionId === option.id
                                            ? "border-blue-500 bg-blue-500"
                                            : "border-slate-700"
                                        )}
                                      >
                                        {answers[
                                          questions[currentQuestionIndex].id
                                        ]?.optionId === option.id && (
                                          <div className="w-1.5 h-1.5 bg-black" />
                                        )}
                                      </div>
                                      <span className="text-sm font-black uppercase">
                                        {option.text}
                                      </span>
                                    </label>
                                  )
                                )}
                              </div>
                            ) : (
                              <textarea
                                className="w-full h-64 bg-background/40 border border-slate-800 p-6 text-white focus:outline-none focus:border-blue-500 text-sm uppercase"
                                placeholder="TYPE YOUR ANSWER HERE..."
                                value={
                                  answers[questions[currentQuestionIndex].id]
                                    ?.description || ""
                                }
                                onChange={(e) =>
                                  handleDescriptiveAnswer(
                                    questions[currentQuestionIndex].id,
                                    e.target.value
                                  )
                                }
                              />
                            )}
                          </div>
                        </motion.div>
                      )}
                  </div>

                  {/* FOOTER (Next/Prev Buttons) - Forced visibility */}
                  <div className="p-6 border-t border-slate-800 bg-background/50 flex flex-col md:flex-row justify-between items-center gap-6 shrink-0">
                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() =>
                          setCurrentQuestionIndex((prev) =>
                            Math.max(0, prev - 1)
                          )
                        }
                        disabled={currentQuestionIndex === 0}
                        className="border-slate-700 text-slate-300 hover:text-white uppercase tracking-widest text-[10px] font-black px-6"
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          setCurrentQuestionIndex((prev) =>
                            Math.min(questions.length - 1, prev + 1)
                          )
                        }
                        disabled={currentQuestionIndex === questions.length - 1}
                        className="border-slate-700 text-slate-300 hover:text-white uppercase tracking-widest text-[10px] font-black px-6"
                      >
                        Next <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>

                    {/* FINAL SUBMIT - Changed to blue outline for better contrast */}
                    <Button
                      onClick={openSubmitModal} // Now opens the modal first
                      className="w-full md:w-auto px-10 h-12 bg-blue-600 text-white hover:bg-blue-500 transition-all rounded-none font-black uppercase tracking-[0.2em] text-[11px]"
                    >
                      Final Submission
                    </Button>
                  </div>
                </div>
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
      {showSubmitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-md p-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full border border-slate-800 bg-card p-8 space-y-6 shadow-2xl relative"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 10, ease: "linear" }}
                className="h-full bg-red-500"
              />
            </div>

            <div className="space-y-4 text-center">
              <h3 className="text-2xl font-black uppercase tracking-[0.3em] text-white">
                Final Authorization
              </h3>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                {confirmTimer > 0 ? (
                  <>
                    Manual override required. System lock:{" "}
                    <span className="text-red-500 font-mono text-base">
                      {confirmTimer}s
                    </span>
                  </>
                ) : (
                  <span className="text-red-500 animate-pulse">
                    AUTO-SUBMITTING NOW...
                  </span>
                )}
              </p>
            </div>

            <div className="space-y-4">
              <label className="block text-center text-[12px] uppercase tracking-[0.1em] text-slate-500 font-black">
                Verification Phrase:{" "}
                <span className="text-white">"SUBMIT"</span>
              </label>
              <input
                type="text"
                value={submitConfirmText}
                onChange={(e) =>
                  setSubmitConfirmText(e.target.value.toUpperCase())
                }
                /* Changed: Increased font weight and adjusted tracking for the placeholder */
                placeholder="TYPE HERE"
                className="w-full bg-background border-2 border-slate-800 p-4 text-white focus:outline-none focus:border-red-500/50 transition-all font-mono text-center text-lg font-black tracking-[0.3em] placeholder:text-slate-700 placeholder:tracking-[0.2em] placeholder:font-bold"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 h-14 rounded-none uppercase text-xs font-black tracking-[0.3em] border-2 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-white transition-all"
              >
                Abort
              </Button>
              <Button
                disabled={submitConfirmText !== "SUBMIT" || confirmTimer === 0}
                onClick={handleFinalSubmit}
                className={cn(
                  "flex-1 h-14 rounded-none font-black uppercase text-xs tracking-[0.1em] transition-all",
                  submitConfirmText === "SUBMIT"
                    ? "bg-red-600 text-white shadow-[0_0_25px_rgba(220,38,38,0.4)] hover:bg-red-500"
                    : "bg-red-950/30 text-red-900/50 border border-red-900/20"
                )}
              >
                Confirm Submission
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Exam;
