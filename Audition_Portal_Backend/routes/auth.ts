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

// GOOGLE AUTH CALLBACK
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/", session: false }),
  (req: Request, res: Response) => {
    const user = req.user as any;
    
    const token = jwt.sign(
      { user: req.user },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "1d" }
    );

    const isProduction = process.env.NODE_ENV === "production";
    
    // Set cookie with correct settings for production
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction, // Must be true for sameSite: "none"
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      domain: isProduction ? undefined : undefined, // Let browser handle it
    });

    const role = user.role;
    
    // Redirect with token in URL as primary method for cross-origin
    const redirectUrl = role === "ADMIN" 
      ? process.env.FRONTEND_ADMIN_REDIRECT_URL || "/admin/profile"
      : process.env.FRONTEND_REDIRECT_URL || "/profile";
    
    // Include token in URL for cross-origin scenario
    res.redirect(`${redirectUrl}?token=${token}`);
  }
);

// LOGOUT
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Logout failed" });
    }

    const isProduction = process.env.NODE_ENV === "production";
    
    // Clear the token cookie
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
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