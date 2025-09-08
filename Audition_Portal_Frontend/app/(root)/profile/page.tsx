// src/app/profile/page.tsx  (or src/pages/profile.tsx)

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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { MagicCard, MagicContainer } from "@/components/magicui/magic-container";
import { cn } from "@/lib/utils";

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

//   useEffect(() => {
//   console.log("Redux userInfo:", userInfo);
// }, [userInfo]);


  // If user already has all three fields, “isComplete” becomes truthy
  const isComplete =
    Boolean(userInfo?.contact) &&
    Boolean(userInfo?.gender) &&
    Boolean(userInfo?.specialization);

  useEffect(() => {
    // 1) Verify the JWT cookie (calls GET /auth/verify)
    dispatch(verifyToken())
      .unwrap()
      .then(() => {
        // 2) If token is valid, fetch full user data (calls GET /api/user)
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
        // If token is invalid or missing, push to login (root)
        push("/");
      });
  }, [dispatch, push]);

  // Input handlers
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

  const     handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidMobileNumber(formData.contact)) {
      setContactError("Invalid mobile number. It should be 10 digits.");
      return;
    }

    try {
      await dispatch(updateUserInfo(formData)).unwrap();
      toast({
        className: "dark",
        variant: "default",
        description: "User data updated successfully",
      });
      // Optionally, you could refresh user data or disable the form:
      // dispatch(fetchUserData())
    } catch (error) {
      console.error("Error updating user info:", error);
      toast({
        className: "dark",
        variant: "destructive",
        description: "Failed to update user data",
      });
    }
  };

  const navigateToDashBoard = (e: React.FormEvent) => {
    e.preventDefault();
    push("/dashboard");
  };

  return (
    <div>
      {isLoading || status === "loading" ? (
        // Show loader while verifying token & fetching user data
        <Loader />
      ) : (
        <div>
          <MagicContainer className="relative z-10 dark w-[350px] flex items-center justify-center">
            <MagicCard className="dark scale-110 w-[350px]">
              <div className="flex items-start justify-center">
                <Avatar className="relative top-[-40px] scale-150">
                  <AvatarImage src={userInfo?.picture} alt="Profile Pic" />
                  <AvatarFallback>Pic</AvatarFallback>
                </Avatar>
              </div>
              <Card className="dark">
                <CardHeader>
                  <CardTitle>Complete Your Profile</CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent>
                    <div className="grid w-full items-center gap-4">
                      {/* Name (read-only) */}
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={userInfo?.username || ""}
                          disabled
                          placeholder="Name"
                        />
                      </div>

                      {/* Email (read-only) */}
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          value={userInfo?.email || ""}
                          disabled
                          placeholder="Email"
                        />
                      </div>

                      {/* Contact No. */}
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="contact">Contact No.</Label>
                        <Input
                          id="contact"
                          disabled={Boolean(userInfo?.contact)}
                          value={
                            userInfo?.contact ? userInfo.contact : formData.contact
                          }
                          onChange={handleInputChange}
                          placeholder="Enter your contact number"
                          required
                        />
                        {contactError && (
                          <span className="text-red-500 text-sm">{contactError}</span>
                        )}
                      </div>

                      {/* Gender */}
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="gender">Gender</Label>
                        <Select
                          disabled={Boolean(userInfo?.gender)}
                          value={userInfo?.gender ? userInfo.gender : formData.gender}
                          onValueChange={(val: string) => handleSelectChange("gender", val)}
                          required
                        >
                          <SelectTrigger id="gender">
                            <SelectValue placeholder="Select Gender" />
                          </SelectTrigger>
                          <SelectContent className="dark" position="popper">
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Specialization */}
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="specialization">Specialization</Label>
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
                          <SelectTrigger id="specialization">
                            <SelectValue placeholder="Select Specialization" />
                          </SelectTrigger>
                          <SelectContent className="dark" position="popper">
                            <SelectItem value="Computer Science">
                              Computer Science
                            </SelectItem>
                            <SelectItem value="Maths and Computing">
                              Maths and Computing
                            </SelectItem>
                            <SelectItem value="Electronics">Electronics</SelectItem>
                            <SelectItem value="Electrical">Electrical</SelectItem>
                            <SelectItem value="Mechanical">Mechanical</SelectItem>
                            <SelectItem value="Chemical">Chemical</SelectItem>
                            <SelectItem value="Metallurgy">Metallurgy</SelectItem>
                            <SelectItem value="Civil">Civil</SelectItem>
                            <SelectItem value="Biotechnology">
                              Biotechnology
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between">
                    {/* "Go to Dashboard" only enabled if all fields are already complete */}
                    <Button
                      variant="outline"
                      onClick={navigateToDashBoard}
                      disabled={!isComplete}
                    >
                      Go to Dashboard
                    </Button>

                    {/* "Save" only enabled if userInfo is not already complete */}
                    <Button type="submit" disabled={Boolean(isComplete)}>
                      Save
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </MagicCard>
          </MagicContainer>

          <AnimatedGridPattern
            numSquares={30}
            maxOpacity={0.5}
            duration={3}
            repeatDelay={2}
            className={cn(
              "[mask-image:radial-gradient(1024px_circle_at_center,white,transparent)]",
              " h-[94%] overflow-hidden skew-y-3"
            )}
          />
        </div>
      )}
    </div>
  );
}
