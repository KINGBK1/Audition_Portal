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
import { ShieldCheck, User, ChevronRight } from "lucide-react";

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

  // LOGIC: Derived state based on Redux userInfo
  const isComplete =
    Boolean(userInfo?.contact) &&
    Boolean(userInfo?.gender) &&
    Boolean(userInfo?.specialization);

useEffect(() => {
  const loadProfile = async () => {
    setIsLoading(true);
    try {
      // AuthProvider already verified, just fetch user data
      const data = await dispatch(fetchUserData()).unwrap();
      setFormData({
        contact: data.contact || "",
        gender: data.gender || "",
        specialization: data.specialization || "",
      });
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  loadProfile();
}, [dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (id === "contact" && contactError) {
      setContactError(null);
    }
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const isValidMobileNumber = (number: string) => /^\d{10}$/.test(number);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidMobileNumber(formData.contact)) {
      setContactError("Invalid mobile number. It should be 10 digits.");
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
      console.error("Update error:", error);

      // Check for 400 Bad Request or Prisma Unique Constraint Error
      const isDuplicate =
        error?.status === 400 ||
        error?.code === "P2002" ||
        error?.message?.includes("400") ||
        error?.message?.toLowerCase().includes("unique");

      if (isDuplicate) {
        // Update inline error text
        setContactError("This contact number is already registered.");

        // Trigger the specific toast message you asked for
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
    push("/dashboard");
  };

  return (
    <div className="min-h-screen w-full bg-[#02010a] text-slate-200 font-mono relative flex items-center justify-center overflow-hidden">
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
          className="absolute w-[40vw] h-[40vw]  blur-[120px] rounded-full"
        />
      </div>

      {isLoading || status === "loading" ? (
        <Loader />
      ) : (
        <div className="relative z-10 w-full max-w-xl px-6 py-12">
          {/* PROFILE CARD */}
          <div className="group relative border border-white/10 bg-white/5 backdrop-blur-2xl p-8 md:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all hover:border-blue-500/30">
            {/* Top Identity Line */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 via-blue-300 to-blue-700 shadow-[0_0_15px_#3b82f6]" />

            {/* Avatar Header */}
            <div className="flex flex-col items-center mb-6">
              {" "}
              <div className="relative mb-3">
                <div className="absolute inset-0 bg-blue-500 blur-[20px] opacity-20 rounded-full " />
                <Avatar className="w-28 h-28 border-2 border-blue-500/50 p-1 bg-black shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                  <AvatarImage
                    src={userInfo?.picture}
                    alt="Profile"
                    className="rounded-full"
                  />
                  <AvatarFallback className="bg-slate-900 text-blue-400">
                    <User className="w-10 h-10" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-none border border-black shadow-lg">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-blue-400 tracking-[0.4em] text-[12px] uppercase font-black mb-2 opacity-80">
                  Access Level: User
                </p>
                <h2 className="text-4xl font-mono font-bold tracking-tight text-white uppercase">
                  PROFILE
                </h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* READ ONLY FIELDS */}
              <div className="space-y-3">
                {" "}
                <div className="space-y-1">
                  <Label className="text-[15px] uppercase tracking-wider text-slate-400 font-semibold">
                    Name
                  </Label>
                  <Input
                    className="bg-black/40 border-slate-800 text-slate-100 h-12 text-[15px] rounded-none cursor-not-allowed font-bold"
                    value={userInfo?.username || ""}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[15px] uppercase tracking-wider text-slate-400 font-semibold">
                    Email
                  </Label>
                  <Input
                    className="bg-black/40 border-slate-800 text-slate-100 h-12 text-[15px] rounded-none cursor-not-allowed font-bold"
                    value={userInfo?.email || ""}
                    disabled
                  />
                </div>
              </div>

              {/* EDITABLE FIELDS */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="contact"
                    className="text-[15px] uppercase tracking-wider text-blue-400 font-black"
                  >
                    Contact NO
                  </Label>
                  <Input
                    id="contact"
                    className="bg-black/60 border-slate-700 hover:border-blue-800 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:outline-none h-14 rounded-none transition-all placeholder:text-slate-600 text-white font-mono font-bold text-[18px]"
                    disabled={Boolean(userInfo?.contact)}
                    value={
                      userInfo?.contact ? userInfo.contact : formData.contact
                    }
                    onChange={handleInputChange}
                    placeholder="Enter 10-digit number"
                    required
                  />
                  {contactError && (
                    <span className="text-red-500 text-[12px] uppercase font-black tracking-tighter">
                      {contactError}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[15px] uppercase tracking-wider text-blue-400 font-black">
                      Gender
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
                      <SelectTrigger className="bg-black/60 border-slate-700 h-14 rounded-none font-bold text-white text-[15px]">
                        <SelectValue placeholder="SELECT" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0a0a0f] border-slate-800 text-slate-300 rounded-none">
                        <SelectItem
                          value="Male"
                          className="font-bold text-[16px]"
                        >
                          MALE
                        </SelectItem>
                        <SelectItem
                          value="Female"
                          className="font-bold text-[16px]"
                        >
                          FEMALE
                        </SelectItem>
                        <SelectItem
                          value="Other"
                          className="font-bold text-[16px]"
                        >
                          OTHER
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[15px] uppercase tracking-wider text-blue-400 font-black">
                      DEPARTMENT
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
                      <SelectTrigger className="bg-black/60 border-slate-700 h-14 rounded-none font-bold text-white text-[15px]">
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
                            className="font-bold text-[16px]"
                          >
                            {branch.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* BUTTONS */}
              <div className="flex flex-col gap-3 pt-2">
                {" "}
                <Button
                  type="submit"
                  disabled={Boolean(isComplete)}
                  className={cn(
                    "w-full h-14 rounded-none font-black uppercase tracking-[0.25em] transition-all text-[15px]",
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
                  disabled={!isComplete}
                  className="group w-full h-14 border-slate-700 hover:border-white rounded-none font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white bg-transparent transition-all text-[14px]"
                >
                  GO TO DASHBOARD{" "}
                  <ChevronRight className="ml-2 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </Button>
              </div>
            </form>
          </div>
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
