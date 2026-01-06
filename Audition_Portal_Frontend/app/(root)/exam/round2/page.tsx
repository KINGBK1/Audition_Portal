"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaGithub, FaPaintBrush, FaPhotoVideo } from "react-icons/fa";
import { HiPlus, HiCheck, HiExclamation, HiClock, HiX } from "react-icons/hi";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import AnimatedGridPattern from "@/components/magicui/animated-grid-pattern";
import Meteors from "@/components/magicui/meteors";
import { cn } from "@/lib/utils";

export default function Round2() {
  const router = useRouter();
  const [status, setStatus] = useState("incomplete");
  const [addOns, setAddOns] = useState<string[]>([]);
  const [newAddOn, setNewAddOn] = useState("");
  const [taskLink, setTaskLink] = useState("");
  const [gdLink, setGdLink] = useState("");
  const [taskLinkAdded, setTaskLinkAdded] = useState(false);
  const [gdLinkAdded, setGdLinkAdded] = useState(false);
  const [taskLinkValid, setTaskLinkValid] = useState<boolean | null>(null);
  const [gdLinkValid, setGdLinkValid] = useState<boolean | null>(null);
  const [taskAlloted, setTaskAlloted] = useState("");
  const [panel, setPanel] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewEntry, setIsNewEntry] = useState(true);

  // MODIFY the validateUrl function - Remove YouTube/Vimeo from creative assets
  const validateUrl = (url: string, type: 'github' | 'creative'): boolean => {
    if (!url.trim()) return false;
    
    try {
      const urlObj = new URL(url);
      
      if (type === 'github') {
        // Only GitHub links allowed
        return urlObj.hostname.includes('github.com');
      } else {
        // Creative assets - ONLY design/portfolio platforms (NO video platforms)
        const validDomains = [
          'drive.google.com',
          'docs.google.com',
          'canva.com',
          'figma.com',
          'behance.net',
          'dribbble.com',
          'dropbox.com',
          'onedrive.live.com',
          'notion.so',
          'notion.site',
        ];
        return validDomains.some(domain => urlObj.hostname.includes(domain));
      }
    } catch {
      return false;
    }
  };

  // MODIFY handleTaskLinkValidation
  const handleTaskLinkValidation = () => {
    const isValid = validateUrl(taskLink, 'github'); // Only GitHub
    setTaskLinkValid(isValid);

    if (isValid) {
      toast.success("Valid GitHub link detected!", {
        style: {
          background: "#1e293b",
          color: "#f1f5f9",
          border: "1px solid #10b981",
        },
        icon: "✅",
      });
      setTaskLinkAdded(true);
      setTimeout(() => setTaskLinkAdded(false), 3000);
    } else {
      toast.error("Please enter a valid GitHub repository link", {
        style: {
          background: "#1e293b",
          color: "#f1f5f9",
          border: "1px solid #ef4444",
        },
        icon: "⚠️",
      });
    }
  };

  // MODIFY handleGdLinkValidation
  const handleGdLinkValidation = () => {
    if (!gdLink.trim()) {
      toast.error("Please enter a link first", {
        style: {
          background: "#1e293b",
          color: "#f1f5f9",
          border: "1px solid #ef4444",
        },
        icon: "⚠️",
      });
      return;
    }

    const isValid = validateUrl(gdLink, 'creative'); // Creative platforms
    setGdLinkValid(isValid);

    if (isValid) {
      toast.success("Valid creative assets link!", {
        style: {
          background: "#1e293b",
          color: "#f1f5f9",
          border: "1px solid #10b981",
        },
        icon: "✅",
      });
      setGdLinkAdded(true);
      setTimeout(() => setGdLinkAdded(false), 3000);
    } else {
      toast.error("Please enter a valid Canva, Drive, Figma, or portfolio link", {
        style: {
          background: "#1e293b",
          color: "#f1f5f9",
          border: "1px solid #ef4444",
        },
        icon: "⚠️",
      });
    }
  };

  // MODIFY fetchUser to validate existing links
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

      if (user.round == 2) {
        router.push("/exam/round2");
        return;
      }

      if (!user.hasGivenExam || user.round < 2) {
        router.push("/dashboard");
        return;
      }

      setPanel(
        user.panel !== null && user.panel !== undefined ? user.panel : null
      );

      const round2Res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/round2`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (round2Res.ok) {
        const round2Data = await round2Res.json();
        if (round2Data.entry) {
          const storedLinks: string = round2Data.entry.taskLink || "";
          const [firstLine, secondLine] = storedLinks.split(/\r?\n/, 2);
          setTaskLink(firstLine || "");
          setGdLink(secondLine || "");
          setTaskAlloted(round2Data.entry.taskAlloted || "");
          setStatus(round2Data.entry.status || "incomplete");
          setAddOns(round2Data.entry.addOns || []);
          setIsNewEntry(false);
          
          // Validate existing links with correct types
          if (firstLine) {
            setTaskLinkValid(validateUrl(firstLine, 'github'));
          }
          if (secondLine) {
            setGdLinkValid(validateUrl(secondLine, 'creative'));
          }
        } else {
          setIsNewEntry(true);
        }
      }
    } catch (e) {
      toast.error("Failed to fetch user data, please refresh.", {
        style: {
          background: "#1e293b",
          color: "#f1f5f9",
          border: "1px solid #ef4444",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleAddMore = () => {
    if (newAddOn.trim()) {
      setAddOns([...addOns, newAddOn.trim()]);
      setNewAddOn("");
      toast.success("Add-on added successfully", {
        style: {
          background: "#1e293b",
          color: "#f1f5f9",
          border: "1px solid #10b981",
        },
        icon: "✅",
      });
    }
  };

  const handleRemoveAddOn = (index: number) => {
    setAddOns(addOns.filter((_, i) => i !== index));
    toast.success("Add-on removed", {
      style: {
        background: "#1e293b",
        color: "#f1f5f9",
        border: "1px solid #6b7280",
      },
    });
  };

  // MODIFY handleSubmit validation
  const handleSubmit = async () => {
    // Validate GitHub link
    if (!taskLink.trim()) {
      toast.error("Please enter a GitHub repository link", {
        style: {
          background: "#1e293b",
          color: "#f1f5f9",
          border: "1px solid #ef4444",
        },
        icon: "⚠️",
      });
      return;
    }

    if (!validateUrl(taskLink, 'github')) {
      toast.error("Please enter a valid GitHub repository link (github.com only)", {
        style: {
          background: "#1e293b",
          color: "#f1f5f9",
          border: "1px solid #ef4444",
        },
        icon: "⚠️",
      });
      return;
    }

    if (!taskAlloted.trim()) {
      toast.error("Please describe your task", {
        style: {
          background: "#1e293b",
          color: "#f1f5f9",
          border: "1px solid #ef4444",
        },
        icon: "⚠️",
      });
      return;
    }

    // Validate creative assets link if provided
    if (gdLink.trim() && !validateUrl(gdLink, 'creative')) {
      toast.error("Please enter a valid creative assets link or leave it empty", {
        style: {
          background: "#1e293b",
          color: "#f1f5f9",
          border: "1px solid #ef4444",
        },
        icon: "⚠️",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const mainLink = taskLink.trim();
      const extraLink = gdLink.trim();
      const combinedLink = extraLink ? `${mainLink}\n${extraLink}` : mainLink;

      const requestBody: any = {
        taskLink: combinedLink,
        taskAlloted,
        status,
        addOns,
      };

      if (isNewEntry && panel !== null) {
        requestBody.panel = panel;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/round2`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to submit Round 2", {
          style: {
            background: "#1e293b",
            color: "#f1f5f9",
            border: "1px solid #ef4444",
          },
          icon: "❌",
        });
        return;
      }

      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } max-w-md w-full bg-slate-900/90 backdrop-blur-xl shadow-2xl rounded-xl pointer-events-auto flex ring-1 ring-white/10 border border-green-500/50`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-lg font-semibold text-white flex items-center gap-2">
                    Submission Successful! 🎉
                  </p>
                  <div className="mt-2 text-sm text-slate-300 space-y-1">
                    <p>✓ Task link saved</p>
                    <p>✓ Description submitted</p>
                    <p>
                      ✓ Status:{" "}
                      <span className="capitalize font-semibold text-green-400">
                        {status}
                      </span>
                    </p>
                    {addOns.length > 0 && (
                      <p>
                        ✓ {addOns.length} additional feature
                        {addOns.length !== 1 ? "s" : ""} added
                      </p>
                    )}
                    <p className="mt-3 text-xs text-slate-400 animate-pulse">
                      🔄 Redirecting to dashboard in 3 seconds...
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex border-l border-white/10">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-slate-400 hover:text-white focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        ),
        {
          duration: 5000,
          position: "top-center",
        }
      );

      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("An error occurred while submitting. Please try again.", {
        style: {
          background: "#1e293b",
          color: "#f1f5f9",
          border: "1px solid #ef4444",
        },
        icon: "🔥",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen w-full bg-slate-950 overflow-hidden relative">
        <AnimatedGridPattern
          numSquares={30}
          maxOpacity={0.4}
          duration={3}
          repeatDelay={1}
          className={cn(
            "[mask-image:radial-gradient(1000px_circle_at_center,white,transparent)]",
            "fixed inset-0 h-full w-full skew-y-3 z-0"
          )}
        />

        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="container mx-auto px-4 md:px-8 pt-12 pb-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-2"
            >
              Round 2
            </motion.div>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-2xl md:text-4xl font-bold text-white"
            >
              Tech Review
            </motion.h1>
            {panel !== null && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="mt-4 inline-block"
              >
                <Badge className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 text-sm font-semibold hover:bg-white/20 transition-colors">
                  Panel: {panel}
                </Badge>
              </motion.div>
            )}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <Card className="dark bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl ring-1 ring-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white/90">
                    <FaGithub className="text-2xl text-blue-400" />
                    GitHub Repository Link
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Paste your GitHub repository link (github.com only)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Input
                        type="url"
                        value={taskLink}
                        onChange={(e) => {
                          setTaskLink(e.target.value);
                          setTaskLinkAdded(false);
                          setTaskLinkValid(null);
                        }}
                        placeholder="https://github.com/username/repository"
                        className={cn(
                          "bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:ring-blue-500/50 pr-10",
                          taskLinkValid === true && "border-green-500/50",
                          taskLinkValid === false && "border-red-500/50"
                        )}
                      />
                      {taskLinkValid !== null && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {taskLinkValid ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      onClick={handleTaskLinkValidation}
                      className="bg-blue-600/80 hover:bg-blue-600 backdrop-blur-md"
                    >
                      Validate
                    </Button>
                  </div>
                  {taskLinkValid === false && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Please enter a valid GitHub repository link (github.com only)
                    </p>
                  )}
                  {taskLinkValid === true && (
                    <p className="text-xs text-green-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Valid GitHub repository link detected
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <Card className="dark bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl ring-1 ring-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white/90">
                    <FaPhotoVideo className="text-2xl text-purple-400" />
                    Creative Assets Link (Optional)
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Graphic Design or Video Editing work
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Input
                        type="url"
                        value={gdLink}
                        onChange={(e) => {
                          setGdLink(e.target.value);
                          setGdLinkAdded(false);
                          setGdLinkValid(null);
                        }}
                        placeholder="Canva, Drive, Figma, or Portfolio link"
                        className={cn(
                          "bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:ring-purple-500/50 pr-10",
                          gdLinkValid === true && "border-green-500/50",
                          gdLinkValid === false && "border-red-500/50"
                        )}
                      />
                      {gdLinkValid !== null && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {gdLinkValid ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      onClick={handleGdLinkValidation}
                      className="bg-purple-600/80 hover:bg-purple-600 backdrop-blur-md"
                    >
                      Validate
                    </Button>
                  </div>
                  {gdLinkValid === false && (
                    <p className="text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Please enter a valid Canva, Drive, Figma, or portfolio link
                    </p>
                  )}
                  {gdLinkValid === true && (
                    <p className="text-xs text-green-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Valid creative assets link
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="lg:col-span-2"
            >
              <Card className="dark bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl ring-1 ring-white/10">
                <CardHeader>
                  <CardTitle className="text-white/90">Task Description</CardTitle>
                  <CardDescription className="text-slate-400">
                    Summary of your contributions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={taskAlloted}
                    onChange={(e) => setTaskAlloted(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 min-h-[220px] resize-none focus:ring-blue-500/50"
                    placeholder="Describe your technical implementation..."
                  />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="dark bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl ring-1 ring-white/10 h-full">
                <CardHeader>
                  <CardTitle className="text-white/90">Task Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { value: "done", label: "Done", icon: HiCheck },
                    { value: "partially done", label: "Partially Done", icon: HiClock },
                    { value: "incomplete", label: "Incomplete", icon: HiExclamation },
                  ].map((option) => {
                    const Icon = option.icon;
                    const isSelected = status === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setStatus(option.value)}
                        className={`w-full p-4 rounded-xl flex items-center justify-between transition-all duration-300 border ${
                          isSelected
                            ? "bg-blue-600/40 border-blue-400/50 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                            : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/20"
                        }`}
                      >
                        <span className="font-semibold">{option.label}</span>
                        <Icon className={`text-xl ${isSelected ? "text-white" : "opacity-20"}`} />
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mb-8"
          >
            <Card className="dark bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl ring-1 ring-white/10">
              <CardHeader>
                <CardTitle className="text-white/90">Additional Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={newAddOn}
                    onChange={(e) => setNewAddOn(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddMore()}
                    placeholder="Bonus features implemented..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                  />
                  <Button
                    onClick={handleAddMore}
                    className="bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md px-6"
                  >
                    <HiPlus className="mr-2" /> Add
                  </Button>
                </div>

                <AnimatePresence>
                  {addOns.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {addOns.map((addOn, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                        >
                          <Badge className="bg-blue-500/20 border border-blue-500/30 text-blue-100 px-3 py-1.5 backdrop-blur-md flex items-center gap-2">
                            {addOn}
                            <button onClick={() => handleRemoveAddOn(index)} className="hover:text-red-400">
                              <HiX />
                            </button>
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="flex justify-center"
          >
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !taskLink.trim() || !taskAlloted.trim() || taskLinkValid === false}
              className="px-16 py-7 text-lg font-bold bg-white text-black hover:bg-slate-200 disabled:opacity-50 shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all duration-300 hover:scale-105 rounded-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                "Final Submission"
              )}
            </Button>
          </motion.div>
        </div>

        <style jsx>{`
          @keyframes blob {
            0%,
            100% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
          .animate-enter {
            animation: enter 0.3s ease-out;
          }
          .animate-leave {
            animation: leave 0.3s ease-in forwards;
          }
          @keyframes enter {
            0% {
              opacity: 0;
              transform: translateY(-10px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes leave {
            0% {
              opacity: 1;
              transform: translateY(0);
            }
            100% {
              opacity: 0;
              transform: translateY(-10px);
            }
          }
        `}</style>
      </div>
    </>
  );
}