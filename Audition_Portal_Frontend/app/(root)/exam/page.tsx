"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { RocketIcon, Brain, Timer, AlertTriangle, CheckCircle, ImageIcon } from "lucide-react"
import { QuestionType, type QuestionWithOptions } from "@/lib/types"

const Exam = () => {
  const [rulesAccepted, setRulesAccepted] = useState(false)
  const [isExamStarted, setIsExamStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(2700) // 45:00 in seconds
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<{ [key: number]: { optionId?: number; description?: string } }>({})
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()

  const [questions, setQuestions] = useState<QuestionWithOptions[]>([])
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)

  // Fetch questions and options and user from the server
  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoadingQuestions(true)
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quiz`, {
          method: "GET",
          credentials: "include"
        });
        
        const data: any = await res.json()
        setQuestions(data)
      } catch (e) {
        toast({
          variant: "destructive",
          description: "Failed to load questions, please refresh.",
        })
      } finally {
        setIsLoadingQuestions(false)
      }
    }
    const fetchUser = async () => {
      try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`,
        {
          method: "GET",
          credentials: "include"
        })
        const user = await res.json()
        // console.log(user)
      if (user.hasGivenExam) {
        toast({
          variant: "destructive",
          description: "You have already given the exam.",
        })
        router.push("/dashboard")
      }
      
    } catch (e) {
        toast({
          variant: "destructive",
          description: "Failed to fetch user data, please refresh.",
        })  }
    }
    fetchUser()
    fetchQuestions()
  }, [])


  const handleAutoSubmit = async () => {
  if (isSubmitting) return;
  setIsSubmitting(true);

  try {
    const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
      questionId: Number(questionId),
      option: answer.optionId ? { id: answer.optionId } : undefined,
      ans: answer.description || "",
    }));

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





  useEffect(() => {
    // Update progress based on answered questions
    if (questions.length > 0) {
      const answeredQuestions = Object.keys(answers).length
      setProgress((answeredQuestions / questions.length) * 100)
    }
  }, [answers, questions.length])

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

    if (isExamStarted) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer!) // Stop timer when time is up
            handleAutoSubmit()
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer) // Clear the interval when component unmounts
    }
  }, [isExamStarted])

  // Security handlers
  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden" && isExamStarted) {
      toast({
        className: "dark",
        variant: "destructive",
        description: "Switching tabs will submit your answers.",
      })
      handleAutoSubmit()
    }
  }

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault()
    toast({
      className: "dark",
      variant: "destructive",
      description: "Right-click is disabled during the exam.",
    })
  }

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
      e.preventDefault()
      toast({
        className: "dark",
        variant: "destructive",
        description: "Inspect element and other shortcuts are disabled during the exam.",
      })
    }
  }

  const handleWindowBlur = () => {
    if (isExamStarted) {
      toast({
        className: "dark",
        variant: "destructive",
        description: "Leaving the exam window will submit your answers.",
      })
      handleAutoSubmit()
    }
  }

  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    e.preventDefault()
    handleAutoSubmit()
  }

  const handleMouseMove = (e: MouseEvent) => {
    const x = e.clientX
    const y = e.clientY
    const w = window.innerWidth
    const h = window.innerHeight

    if (x < 0 || x > w || y < 0 || y > h) {
      if (isExamStarted) {
        toast({
          className: "dark",
          variant: "destructive",
          description: "Switching workspaces will submit your answers.",
        })
        handleAutoSubmit()
      }
    }
  }

  const handleCopyPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    toast({
      className: "dark",
      variant: "destructive",
      description: "Copy and paste is disabled.",
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const startExam = async () => {
    setIsLoading(true)
    // Simulate loading
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsExamStarted(true)
    setIsLoading(false)

    // Add event listeners for security
    // document.addEventListener("visibilitychange", handleVisibilityChange)
    // document.addEventListener("contextmenu", handleContextMenu)
    // document.addEventListener("keydown", handleKeyDown)
    // window.addEventListener("blur", handleWindowBlur)
    // window.addEventListener("beforeunload", handleBeforeUnload)
    // document.addEventListener("mousemove", handleMouseMove)
  }




  const submitAnswer = async (questionId: number) => {
    const answer = answers[questionId]
    if (!answer) return

    const currentQuestion = questions.find((q) => q.id === questionId)
    if (!currentQuestion) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quiz/answer`, {
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
      })

      if (!response.ok) {
        throw new Error("Failed to submit answer")
      }

      return await response.json()
    } catch (error) {
      console.error("Error submitting answer:", error)
      throw error
    }
  }

  

  const handleOptionSelect = (questionId: number, optionId: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], optionId },
    }))
  }

  const handleDescriptiveAnswer = (questionId: number, description: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], description },
    }))
  }

  const isQuestionAnswered = (questionId: number) => {
    const answer = answers[questionId]
    if (!answer) return false

    const question = questions.find((q) => q.id === questionId)
    if (!question) return false

    // For multiple choice, check if option is selected
    if (question.type === QuestionType.MCQ) {
      return !!answer.optionId
    }

    // For descriptive or pictorial, check if description is not empty
    return !!answer.description && answer.description.trim() !== ""
  }

  const getQuestionTypeBadge = (type: QuestionType) => {
    switch (type) {
      case QuestionType.MCQ:
        return (
          <Badge variant="outline" className="text-blue-400 border-blue-400">
            Multiple Choice
          </Badge>
        )
      case QuestionType.Descriptive:
        return (
          <Badge variant="outline" className="text-green-400 border-green-400">
            Descriptive
          </Badge>
        )
      case QuestionType.Pictorial:
        return (
          <Badge variant="outline" className="text-purple-400 border-purple-400 flex items-center gap-1">
            <ImageIcon className="w-3 h-3" />
            Pictorial
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-gray-400 border-gray-400">
            Unknown
          </Badge>
        )
    }
  }

  if (isLoadingQuestions) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#020817]">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-blue-400 text-lg">Loading questions...</p>
        </div>
      </div>
    )
  }
  

  return (
    <div className="exam-container w-full">
      <AnimatePresence mode="wait">
        {!isExamStarted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-screen flex items-center justify-center bg-[#020817]/80"
          >
            <div className="max-w-4xl w-full mx-4 p-8 bg-[#0a1729] rounded-2xl shadow-2xl backdrop-blur-sm border border-blue-500/20">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="flex items-center justify-center mb-8"
              >
                <RocketIcon className="w-12 h-12 text-blue-500 mr-4" />
                <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text">
                  Ready to be a part of the source?
                </h2>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-6 rounded-xl bg-blue-500/10 border border-blue-500/20"
                >
                  <Brain className="w-8 h-8 text-blue-400 mb-4" />
                  <h3 className="text-xl font-semibold text-blue-400 mb-2">Challenge Your Mind</h3>
                  <p className="text-gray-300">
                    Prepare to showcase your knowledge and problem-solving skills in this exciting journey.
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-6 rounded-xl bg-purple-500/10 border border-purple-500/20"
                >
                  <Timer className="w-8 h-8 text-purple-400 mb-4" />
                  <h3 className="text-xl font-semibold text-purple-400 mb-2">Race Against Time</h3>
                  <p className="text-gray-300">45 minutes to prove your expertise. Every second counts!</p>
                </motion.div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-yellow-500">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-sm">Important Rules:</span>
                </div>
                <ul className="grid md:grid-cols-2 gap-3 text-sm text-gray-300">
                  <li className="flex items-center space-x-2">
                    <Badge variant="secondary">1</Badge>
                    <span>Full-screen mode is mandatory</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Badge variant="secondary">2</Badge>
                    <span>No tab switching allowed</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Badge variant="secondary">3</Badge>
                    <span>Copy-paste is disabled</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Badge variant="secondary">4</Badge>
                    <span>Auto-submit on rule violation</span>
                  </li>
                </ul>
              </div>

              <motion.div
                className="mt-8 flex flex-col md:flex-row items-center justify-end space-y-4 md:space-y-0 md:space-x-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="relative w-full md:w-64">
                  <input
                    type="text"
                    placeholder="Type 'start' to begin"
                    className="w-full px-4 py-2 bg-[#1a2739] rounded-lg text-white border border-blue-500/20 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    onChange={(e) => setRulesAccepted(e.target.value.toLowerCase() === "start")}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <RocketIcon
                      className={`w-4 h-4 transition-colors ${rulesAccepted ? "text-blue-500" : "text-gray-500"}`}
                    />
                  </div>
                </div>
                <Button
                  variant="default"
                  disabled={!rulesAccepted || isLoading}
                  onClick={startExam}
                  className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    "Start Exam"
                  )}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-[#020817]/90 backdrop-blur-sm"
          >
            <div className="container mx-auto p-4">
              {/* Header */}
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-[#0a1729] p-4 rounded-lg border border-blue-500/20"
              >
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold text-white">ROUND-1</h1>
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                    Progress: {Math.round(progress)}%
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <Progress value={progress} className="w-[100px]" />
                  <div className="text-2xl font-mono text-blue-400">{formatTime(timeLeft)}</div>
                </div>
              </motion.div>

              {/* Main Content */}
              <div className="grid md:grid-cols-12 gap-6">
                {/* Question Numbers */}
                <motion.div
                  initial={{ x: -20 }}
                  animate={{ x: 0 }}
                  className="md:col-span-2 bg-[#0a1729] p-4 rounded-lg border border-blue-500/20 md:sticky md:top-4 self-start"
                >
                  <div className="grid grid-cols-5 md:grid-cols-1 gap-2">
                    {questions.map((q, index) => (
                      <motion.button
                        key={q.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentQuestionIndex(index)}
                        className={`w-full p-2 md:p-3 text-center md:text-left rounded-lg transition-colors ${
                          currentQuestionIndex === index
                            ? "bg-blue-600 text-white"
                            : "text-gray-300 hover:bg-[#1a2739] border border-blue-500/20"
                        } ${isQuestionAnswered(q.id) ? "ring-2 ring-green-500/50" : ""}`}
                      >
                        <div className="flex items-center justify-center md:justify-between">
                          <span className="md:hidden">Q{index + 1}</span>
                          <span className="hidden md:inline">Question {index + 1}</span>
                          {isQuestionAnswered(q.id) && <CheckCircle className="w-4 h-4 text-green-500 ml-2" />}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Question and Answer Area */}
                <motion.div
                  initial={{ x: 20 }}
                  animate={{ x: 0 }}
                  className="md:col-span-10 bg-[#0a1729] p-6 rounded-lg border border-blue-500/20"
                >
                  {questions.length > 0 && currentQuestionIndex < questions.length && (
                    <motion.div
                      key={currentQuestionIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mb-6"
                    >
                      <Card className="p-6 mb-6 bg-[#0f2136] border-blue-500/20">
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant="outline" className="text-blue-400 border-blue-400">
                            Question {currentQuestionIndex + 1}
                          </Badge>
                          {getQuestionTypeBadge(questions[currentQuestionIndex].type)}
                        </div>
                        <h2 className="text-xl text-white mb-4">{questions[currentQuestionIndex].description}</h2>

                        {/* Pictorial Question Image */}
                        {questions[currentQuestionIndex].type === QuestionType.Pictorial &&
                          questions[currentQuestionIndex].picture && (
                            <div className="mt-4 flex justify-center">
                              <div className="relative w-full max-w-md h-64 overflow-hidden rounded-lg border border-blue-500/20">
                                <Image
                                  src={questions[currentQuestionIndex].picture || "/placeholder.svg"}
                                  alt="Question image"
                                  fill
                                  className="object-contain"
                                  sizes="(max-width: 768px) 100vw, 500px"
                                />
                              </div>
                            </div>
                          )}
                      </Card>

                      {/* Answer Section */}
                      {questions[currentQuestionIndex].type === QuestionType.MCQ ? (
                        <div className="space-y-3 mb-6">
                          {questions[currentQuestionIndex].options.map((option) => (
                            <motion.div key={option.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                              <label
                                className={`flex items-center p-4 rounded-lg cursor-pointer transition-all ${
                                  answers[questions[currentQuestionIndex].id]?.optionId === option.id
                                    ? "bg-blue-500/20 border border-blue-500"
                                    : "bg-[#1a2739] border border-blue-500/10 hover:border-blue-500/30"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`question-${questions[currentQuestionIndex].id}`}
                                  value={option.id}
                                  checked={answers[questions[currentQuestionIndex].id]?.optionId === option.id}
                                 onChange={() => handleOptionSelect(questions[currentQuestionIndex].id, Number(option.id))}

                                  className="mr-3 h-4 w-4 text-blue-500 focus:ring-blue-500"
                                />
                                <span className="text-white">{option.text}</span>
                              </label>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        // Descriptive or Pictorial questions use textarea
                        <div className="mb-6">
                          <textarea
                            ref={textareaRef}
                            className="w-full h-[200px] p-4 bg-[#1a2739] text-white rounded-lg border border-blue-500/20 resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            placeholder="Write your answer here..."
                            value={answers[questions[currentQuestionIndex].id]?.description || ""}
                            onChange={(e) =>
                              handleDescriptiveAnswer(questions[currentQuestionIndex].id, e.target.value)
                            }
                            onCopy={handleCopyPaste}
                            onPaste={handleCopyPaste}
                          />
                        </div>
                      )}

                      <motion.div
                        className="flex justify-between items-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="flex gap-4">
                          <Button
                            variant="outline"
                            onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                            disabled={currentQuestionIndex === 0}
                            className="border-blue-500/20 hover:bg-blue-500/10"
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                            disabled={currentQuestionIndex === questions.length - 1}
                            className="border-blue-500/20 hover:bg-blue-500/10"
                          >
                            Next
                          </Button>
                        </div>
                        <Button
                          variant="default"
                          onClick={handleAutoSubmit}
                          disabled={isSubmitting}
                          className="relative overflow-hidden group bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                          {isSubmitting ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                            />
                          ) : (
                            <>
                              <span className="relative z-10">Submit Exam</span>
                              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                              <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <RocketIcon className="w-6 h-6 animate-bounce" />
                              </span>
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Exam
