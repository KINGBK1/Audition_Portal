'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import LandingPage from "@/components/LandingPage";
import { useAppDispatch } from "@/lib/hooks";
import { verifyToken } from "@/lib/store/features/auth/authSlice";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [showLanding, setShowLanding] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

useEffect(() => {
  const checkAuth = async () => {
    try {
      //Verify token
      const verified = await dispatch(verifyToken()).unwrap();

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const user = await res.json();

      // Redirect logic
      if (verified.role === "ADMIN") {
        router.push("/admin/profile");
        return;
      }

      // round-based redirect
      if (user.round >= 2) {
        console.log(user.round);
        router.replace("/exam/round2");
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("Auth failed:", err);
      setLoading(false);
      setShowLanding(true);
    }
  };

  checkAuth();
}, [dispatch, router]);


  function Signin() {
    const oauthUrl = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_URL;
    if (oauthUrl) {
      setLoading(true);
      setShowLanding(false);
      window.location.href = oauthUrl;
    } else {
      console.error("OAuth URL is not defined");
    }
  }

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-900">
        <Loader />
      </div>
    );
  }

  if (showLanding) {
    return <LandingPage onSignIn={Signin} />;
  }

  return null;
}