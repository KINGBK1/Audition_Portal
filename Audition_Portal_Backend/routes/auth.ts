import express, { Request, Response, Router } from "express";
import passport from "../passport/passport";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { verifyJWT } from "../middleware/verifyJWT";

const router = Router();
require("dotenv").config();

/* =========================
   GOOGLE AUTH ENTRY POINT
========================= */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

/* =========================
   GOOGLE AUTH CALLBACK
========================= */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/",
    session: false,
  }),
  (req: Request, res: Response) => {
    try {
      const user = req.user as any;

      /* =========================
         JWT CREATION
      ========================= */
      const token = jwt.sign(
        { user },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: "1d" }
      );

      /* =========================
         COOKIE OPTIONS
      ========================= */
      const cookieOptions = {
        httpOnly: true,
        sameSite: "none" as const,
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
      };

      /* =========================
         SET COOKIE
      ========================= */
      res.cookie("token", token, cookieOptions);

      /* =========================
         REDIRECT LOGIC
      ========================= */
      const frontendUrl = process.env.FRONTEND_HOME_URL;
      
      // Check if profile is complete
      const isProfileComplete = user.contact && user.gender && user.specialization;
      
      let redirectPath;
      if (user.role === "ADMIN") {
        redirectPath = "/admin/dashboard";
      } else if (!isProfileComplete) {
        redirectPath = "/profile"; // Redirect to profile if incomplete
      } else {
        redirectPath = "/dashboard";
      }
      
      const redirectUrl = `${frontendUrl}${redirectPath}`;

      res.redirect(redirectUrl);
    } catch (error) {
      res.redirect(process.env.FRONTEND_HOME_URL || "/");
    }
  }
);

/* =========================
   LOGOUT
========================= */
router.get("/logout", (req: Request, res: Response) => {
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

/* =========================
   VERIFY JWT
========================= */
router.get("/verify", verifyJWT, (req: Request, res: Response) => {
  const user = (req as Request & { user?: any }).user;

  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  return res.status(200).json(user);
});

export default router;
