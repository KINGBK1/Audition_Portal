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
    session: false, // ✅ No session
  })
);

// GOOGLE AUTH CALLBACK
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/", session: false }),
  (req: Request, res: Response) => {
    const token = jwt.sign(
      { user: req.user },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "1d" }
    );

    // Set cookie as backup for same-origin requests
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    const role = (req.user as any).role;
    // Redirect with token in URL for cross-origin setup
    const redirectUrl = role === "ADMIN" 
      ? process.env.FRONTEND_ADMIN_REDIRECT_URL || "/admin/profile"
      : process.env.FRONTEND_REDIRECT_URL || "/profile";
    
    res.redirect(`${redirectUrl}?token=${token}`);
  }
);

// LOGOUT
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Logout failed" });
    }

    // Clear the token cookie
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "none",
      // secure: process.env.NODE_ENV === "production",
      secure: true,
    });

    // DON'T redirect - return JSON instead
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
