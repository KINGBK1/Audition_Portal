import express, { Request, Response, Router } from "express";
import passport from "../passport/passport";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { verifyJWT } from "../middleware/verifyJWT";

const router = Router();
require("dotenv").config();

// GOOGLE AUTH ENTRY POINT
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

// GOOGLE AUTH CALLBACK - WITH DETAILED LOGGING
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/", session: false }),
  (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      
      console.log("=== AUTH CALLBACK START ===");
      console.log("User authenticated:", user?.email);
      console.log("User role:", user?.role);
      console.log("NODE_ENV:", process.env.NODE_ENV);
      console.log("FRONTEND_URL:", process.env.FRONTEND_URL);
      
      const token = jwt.sign(
        { user: req.user },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: "1d" }
      );

      const isProduction = process.env.NODE_ENV === "production";
      
      // Cookie configuration
      const cookieOptions = {
        httpOnly: true,
        sameSite: isProduction ? ("none" as const) : ("lax" as const),
        secure: isProduction,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        path: "/", // IMPORTANT: Add this
      };
      
      console.log("Cookie options:", cookieOptions);
      
      // Set cookie
      res.cookie("token", token, cookieOptions);
      
      console.log("Cookie set successfully");

      // Determine redirect URL
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      const redirectPath = user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard";
      const redirectUrl = `${frontendUrl}${redirectPath}`;
      
      console.log("Redirecting to:", redirectUrl);
      console.log("=== AUTH CALLBACK END ===");
      
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("Auth callback error:", error);
      res.redirect(process.env.FRONTEND_URL || "http://localhost:3000");
    }
  }
);

// LOGOUT
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Logout failed" });
    }
    
    const isProduction = process.env.NODE_ENV === "production";
    
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: isProduction ? ("none" as const) : ("lax" as const),
      secure: isProduction,
      path: "/",
    });

    res.json({ success: true, message: "Logged out successfully" });
  });
});

// VERIFY JWT
router.get("/verify", verifyJWT, (req: Request, res: Response) => {
  const user = (req as Request & { user?: any }).user;
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  return res.status(200).json(user);
});

export default router;