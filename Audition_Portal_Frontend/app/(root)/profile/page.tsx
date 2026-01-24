"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchUserData,
  selectAuthState,
  updateUserInfo,
  verifyToken,
} from "@/lib/store/features/auth/authSlice";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import Loader from "@/components/Loader";
import AnimatedGridPattern from "@/components/magicui/animated-grid-pattern";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ShieldCheck, User, ChevronRight, AlertTriangle, X } from "lucide-react";

export default function Profile() {
  const dispatch = useAppDispatch();
  const { userInfo, status } = useAppSelector(selectAuthState);
  const { push } = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    contact: "",
    gender: "",
    specialization: "",
  });
  const [contactError, setContactError] = useState<string | null>(null);
  const [genderError, setGenderError] = useState<string | null>(null);
  const [specializationError, setSpecializationError] = useState<string | null>(null);
  const [showWarningModal, setShowWarningModal] = useState(false);

  // LOGIC: Derived state based on Redux userInfo
  const isComplete =
    Boolean(userInfo?.contact) &&
    Boolean(userInfo?.gender) &&
    Boolean(userInfo?.specialization);

  // Check if form has unsaved changes
  const hasUnsavedChanges = 
    formData.contact !== (userInfo?.contact || "") ||
    formData.gender !== (userInfo?.gender || "") ||
    formData.specialization !== (userInfo?.specialization || "");

  useEffect(() => {
    dispatch(verifyToken())
      .unwrap()
      .then(() => {
        dispatch(fetchUserData())
          .unwrap()
          .then((data) => {
            const user = data ?? {};
            setFormData({
              contact: user.contact || "",
              gender: user.gender || "",
              specialization: user.specialization || "",
            });
          })
          .finally(() => setIsLoading(false));
      })
      .catch((err) => {
        console.error("verifyToken failed:", err);
        setIsLoading(false);
        push("/");
      });
  }, [dispatch, push]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (id === "contact" && contactError) {
      setContactError(null);
    }
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (id === "gender" && genderError) {
      setGenderError(null);
    }
    if (id === "specialization" && specializationError) {
      setSpecializationError(null);
    }
  };

  const isValidMobileNumber = (number: string) => {
    // Check if it's exactly 10 digits
    if (!/^\d{10}$/.test(number)) {
      return false;
    }

    // Check if it starts with valid Indian mobile prefixes (6, 7, 8, 9)
    const firstDigit = number.charAt(0);
    if (!['6', '7', '8', '9'].includes(firstDigit)) {
      return false;
    }

    // Check if it's not all the same digit (e.g., 1111111111)
    if (/^(\d)\1{9}$/.test(number)) {
      return false;
    }

    // Check if it's not a sequential pattern (e.g., 1234567890)
    const isSequential = number.split('').every((digit, index) => {
      if (index === 0) return true;
      return parseInt(digit) === (parseInt(number[index - 1]) + 1) % 10;
    });
    if (isSequential) {
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setContactError(null);
    setGenderError(null);
    setSpecializationError(null);

    let hasError = false;

    // Enhanced contact number validation
    if (!formData.contact || formData.contact.trim() === "") {
      setContactError("Contact number is required.");
      hasError = true;
    } else if (!/^\d{10}$/.test(formData.contact)) {
      setContactError("Phone number must be exactly 10 digits.");
      hasError = true;
    } else if (!['6', '7', '8', '9'].includes(formData.contact.charAt(0))) {
      setContactError("Invalid phone number");
      hasError = true;
    } else if (/^(\d)\1{9}$/.test(formData.contact)) {
      setContactError("Invalid phone number. Cannot be all same digits.");
      hasError = true;
    } else if (formData.contact.split('').every((digit, index) => {
      if (index === 0) return true;
      return parseInt(digit) === (parseInt(formData.contact[index - 1]) + 1) % 10;
    })) {
      setContactError("Invalid phone number. Cannot be sequential digits.");
      hasError = true;
    }

    // Validate gender
    if (!formData.gender || formData.gender.trim() === "") {
      setGenderError("Gender is required.");
      hasError = true;
    }

    // Validate specialization
    if (!formData.specialization || formData.specialization.trim() === "") {
      setSpecializationError("Department is required.");
      hasError = true;
    }

    if (hasError) {
      toast({
        className: "dark",
        variant: "destructive",
        description: "Please fill in all required fields correctly.",
      });
      return;
    }

    try {
      // 1. Attempt to update
      await dispatch(updateUserInfo(formData)).unwrap();

      // 2. Refresh local store so buttons update instantly
      await dispatch(fetchUserData()).unwrap();

      toast({
        className: "dark",
        variant: "default",
        description: "User data updated successfully",
      });
    } catch (error: any) {
      console.error("Full Update error:", error);
      console.error("Error payload:", error?.payload);
      console.error("Error message:", error?.message);
      console.error("Error code:", error?.code);

      // Enhanced duplicate detection - check multiple possible error formats
      const errorMessage = error?.message?.toLowerCase() || "";
      const payloadMessage = error?.payload?.message?.toLowerCase() || "";
      const errorString = JSON.stringify(error).toLowerCase();

      const isDuplicate =
        error?.payload?.status === 400 ||
        error?.status === 400 ||
        error?.code === "P2002" ||
        errorMessage.includes("already") ||
        errorMessage.includes("duplicate") ||
        errorMessage.includes("exists") ||
        errorMessage.includes("unique") ||
        payloadMessage.includes("already") ||
        payloadMessage.includes("duplicate") ||
        payloadMessage.includes("exists") ||
        payloadMessage.includes("unique") ||
        errorString.includes("already") ||
        errorString.includes("duplicate") ||
        errorString.includes("contact");

      if (isDuplicate) {
        // ✅ Update inline error text below the contact field
        setContactError("This contact number is already registered.");

        // ✅ Trigger the specific toast message
        toast({
          className: "dark",
          variant: "destructive",
          title: "Duplicate Entry",
          description: "This contact number already exists in our records.",
        });
      } else {
        // General error handling
        toast({
          className: "dark",
          variant: "destructive",
          description: "Failed to update user data. Please try again.",
        });
      }
    }
  };

  const navigateToDashBoard = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If profile is incomplete or has unsaved changes, show warning
    if (!isComplete || hasUnsavedChanges) {
      setShowWarningModal(true);
    } else {
      push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#02010a] text-slate-200 font-mono relative flex items-center justify-center overflow-hidden py-4">
      {/* THEME BACKGROUND ORBS */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            top: ["10%", "40%", "10%"],
            left: ["10%", "30%", "10%"],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute w-[40vw] h-[40vw] bg-blue-600/10 blur-[120px] rounded-full"
        />
        <motion.div
          animate={{
            bottom: ["10%", "30%", "10%"],
            right: ["10%", "40%", "10%"],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute w-[40vw] h-[40vw] blur-[120px] rounded-full"
        />
      </div>

      {isLoading || status === "loading" ? (
        <Loader />
      ) : (
        <div className="relative z-10 w-full max-w-xl px-6 py-4">
          {/* PROFILE CARD */}
          <div className="group relative border border-white/10 bg-white/5 backdrop-blur-2xl p-6 md:p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all hover:border-blue-500/30">
            {/* Top Identity Line */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 via-blue-300 to-blue-700 shadow-[0_0_15px_#3b82f6]" />

            {/* Avatar Header */}
            <div className="flex flex-col items-center mb-4">
              <div className="relative mb-2">
                <div className="absolute inset-0 bg-blue-500 blur-[20px] opacity-20 rounded-full " />
                <Avatar className="w-20 h-20 border-2 border-blue-500/50 p-1 bg-black shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                  <AvatarImage
                    src={userInfo?.picture}
                    alt="Profile"
                    className="rounded-full"
                  />
                  <AvatarFallback className="bg-slate-900 text-blue-400">
                    <User className="w-8 h-8" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 bg-blue-600 p-1.5 rounded-none border border-black shadow-lg">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-blue-400 tracking-[0.3em] text-[10px] uppercase font-black mb-1 opacity-80">
                  Access Level: User
                </p>
                <h2 className="text-3xl font-mono font-bold tracking-tight text-white uppercase">
                  PROFILE
                </h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* READ ONLY FIELDS */}
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label className="text-[13px] uppercase tracking-wider text-slate-400 font-semibold">
                    Name
                  </Label>
                  <Input
                    className="bg-black/40 border-slate-800 text-slate-100 h-10 text-[14px] rounded-none cursor-not-allowed font-bold"
                    value={userInfo?.username || ""}
                    disabled
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[13px] uppercase tracking-wider text-slate-400 font-semibold">
                    Email
                  </Label>
                  <Input
                    className="bg-black/40 border-slate-800 text-slate-100 h-10 text-[14px] rounded-none cursor-not-allowed font-bold"
                    value={userInfo?.email || ""}
                    disabled
                  />
                </div>
              </div>

              {/* EDITABLE FIELDS */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label
                    htmlFor="contact"
                    className="text-[13px] uppercase tracking-wider text-blue-400 font-black"
                  >
                    Contact NO <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="contact"
                    className={cn(
                      "bg-black/60 border-slate-700 hover:border-blue-800 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:outline-none h-11 rounded-none transition-all placeholder:text-slate-600 text-white font-mono font-bold text-[15px]",
                      userInfo?.contact && "cursor-not-allowed opacity-75"
                    )}
                    disabled={Boolean(userInfo?.contact)}
                    value={
                      userInfo?.contact ? userInfo.contact : formData.contact
                    }
                    onChange={handleInputChange}
                    placeholder="Enter 10-digit number"
                    required
                  />
                  {contactError && (
                    <span className="text-red-500 text-[11px] uppercase font-black tracking-tighter">
                      {contactError}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[13px] uppercase tracking-wider text-blue-400 font-black">
                      Gender <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      disabled={Boolean(userInfo?.gender)}
                      value={
                        userInfo?.gender ? userInfo.gender : formData.gender
                      }
                      onValueChange={(val: string) =>
                        handleSelectChange("gender", val)
                      }
                      required
                    >
                      <SelectTrigger className={cn(
                        "bg-black/60 border-slate-700 h-11 rounded-none font-bold text-white text-[14px]",
                        userInfo?.gender && "cursor-not-allowed opacity-75"
                      )}>
                        <SelectValue placeholder="SELECT" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0a0f] border-slate-800 text-slate-300 rounded-none">
                        <SelectItem
                          value="Male"
                          className="font-bold text-[14px]"
                        >
                          MALE
                        </SelectItem>
                        <SelectItem
                          value="Female"
                          className="font-bold text-[14px]"
                        >
                          FEMALE
                        </SelectItem>
                        <SelectItem
                          value="Other"
                          className="font-bold text-[14px]"
                        >
                          OTHER
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {genderError && (
                      <span className="text-red-500 text-[11px] uppercase font-black tracking-tighter">
                        {genderError}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[13px] uppercase tracking-wider text-blue-400 font-black">
                      DEPARTMENT <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      disabled={Boolean(userInfo?.specialization)}
                      value={
                        userInfo?.specialization
                          ? userInfo.specialization
                          : formData.specialization
                      }
                      onValueChange={(val: string) =>
                        handleSelectChange("specialization", val)
                      }
                      required
                    >
                      <SelectTrigger className={cn(
                        "bg-black/60 border-slate-700 h-11 rounded-none font-bold text-white text-[14px]",
                        userInfo?.specialization && "cursor-not-allowed opacity-75"
                      )}>
                        <SelectValue placeholder="BRANCH" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0a0f] border-slate-800 text-slate-300 rounded-none h-64">
                        {[
                          "Computer Science",
                          "Maths and Computing",
                          "Electronics",
                          "Electrical",
                          "Mechanical",
                          "Chemical",
                          "Metallurgy",
                          "Civil",
                          "Biotechnology",
                        ].map((branch) => (
                          <SelectItem
                            key={branch}
                            value={branch}
                            className="font-bold text-[14px]"
                          >
                            {branch.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {specializationError && (
                      <span className="text-red-500 text-[11px] uppercase font-black tracking-tighter">
                        {specializationError}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* BUTTONS */}
              <div className="flex flex-col gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={Boolean(isComplete)}
                  className={cn(
                    "w-full h-11 rounded-none font-black uppercase tracking-[0.2em] transition-all text-[13px]",
                    isComplete
                      ? "bg-emerald-900/20 text-emerald-400 border border-emerald-500/50 cursor-not-allowed"
                      : "bg-blue-800 text-white hover:bg-blue-600 transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                  )}
                >
                  {isComplete ? (
                    <span className="flex items-center gap-2">
                      PROFILE COMPLETED ✓
                    </span>
                  ) : (
                    "COMPLETE YOUR PROFILE"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={navigateToDashBoard}
                  className="group w-full h-11 border-slate-700 hover:border-white rounded-none font-black uppercase tracking-[0.15em] text-slate-400 hover:text-white bg-transparent transition-all text-[13px]"
                >
                  GO TO DASHBOARD{" "}
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WARNING MODAL */}
      {showWarningModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full border border-amber-500/30 bg-[#0a0a0f]/95 backdrop-blur-xl p-6 md:p-8 shadow-2xl relative"
          >
            {/* Top Warning Line */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-500 via-orange-400 to-amber-600 shadow-[0_0_15px_#f59e0b]" />

            {/* Close Button */}
            <button
              onClick={() => setShowWarningModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6 pt-4">
              {/* Warning Icon */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 blur-xl bg-amber-500/20 rounded-full" />
                  <AlertTriangle className="w-16 h-16 text-amber-500 relative z-10" />
                </div>
              </div>

              {/* Title and Message */}
              <div className="space-y-3 text-center">
                <p className="text-amber-500 tracking-[0.3em] text-[10px] uppercase font-black">
                  ATTENTION REQUIRED
                </p>
                <h3 className="text-2xl font-bold uppercase tracking-wider text-white">
                  Unsaved Changes
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed uppercase tracking-wider font-medium">
                  {!isComplete 
                    ? "Your profile is incomplete. Please complete and save your profile before proceeding to the dashboard."
                    : "You have unsaved changes. Please save your profile before continuing."
                  }
                </p>
              </div>

              {/* Divider */}
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-[1px] bg-slate-800" />
                <div className="w-2 h-2 border border-amber-700 rotate-45" />
                <div className="w-12 h-[1px] bg-slate-800" />
              </div>

              {/* Action Button */}
              <div>
                <Button
                  onClick={() => setShowWarningModal(false)}
                  className="w-full h-12 bg-amber-600 hover:bg-amber-500 text-white rounded-none font-black uppercase tracking-[0.2em] text-[13px] shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                >
                  OK, I&apos;LL SAVE FIRST
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* BACKGROUND GRID PATTERN */}
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
  );
}