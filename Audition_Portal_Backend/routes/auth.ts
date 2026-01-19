import express, { Request, Response, Router } from "express";
import passport from "../passport/passport";
import jwt from "jsonwebtoken";
import { verifyJWT } from "../middleware/verifyJWT";

const router = Router();
require("dotenv").config();

router.get(
  "/google",
  (req, res, next) => {
    console.log("=== GOOGLE AUTH ENTRY ===");
    console.log("Request origin:", req.headers.origin);
    console.log("Request host:", req.headers.host);
    console.log("NODE_ENV:", process.env.NODE_ENV);
    next();
  },
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  (req, res, next) => {
    console.log("=== GOOGLE CALLBACK HIT ===");
    console.log("Request origin:", req.headers.origin);
    console.log("Request referer:", req.headers.referer);
    next();
  },
  passport.authenticate("google", {
    failureRedirect: "/",
    session: false,
  }),
  (req: Request, res: Response) => {
    try {
      console.log("=== AUTH CALLBACK HANDLER START ===");

      const user = req.user as any;
      console.log("User object from passport:", user);

      // CRITICAL FIX: Sign token with user object nested
      const token = jwt.sign(
        { 
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            username: user.username
          }
        },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: "1d" }
      );

      const isProduction = process.env.NODE_ENV === "production";

      // Cookie options for cross-origin
      const cookieOptions = {
        httpOnly: true,
        sameSite: "none" as const,
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
        domain: isProduction ? ".vercel.app" : undefined,
      };

      console.log("Cookie options being used:", cookieOptions);
      console.log("User role:", user.role);

      res.cookie("token", token, cookieOptions);
      console.log("Set-Cookie header:", res.getHeader("Set-Cookie"));

      // Redirect with token in URL as fallback
      const frontendUrl = process.env.FRONTEND_HOME_URL;
      const redirectPath = user.role === "ADMIN" ? "/admin/dashboard" : "/dashboard";
      const redirectUrl = `${frontendUrl}${redirectPath}?token=${encodeURIComponent(token)}`;

      console.log("Redirect URL:", redirectUrl);
      console.log("=== AUTH CALLBACK HANDLER END ===");

      res.redirect(redirectUrl);
    } catch (error) {
      console.error("AUTH CALLBACK ERROR:", error);
      res.redirect(process.env.FRONTEND_HOME_URL || "/");
    }
  }
);

router.get("/logout", (req: Request, res: Response) => {
  console.log("=== LOGOUT REQUEST ===");
  console.log("Cookies before logout:", req.cookies);

  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ success: false, message: "Logout failed" });
    }

    const isProduction = process.env.NODE_ENV === "production";

    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "none" as const,
      secure: true,
      path: "/",
      domain: isProduction ? ".vercel.app" : undefined,
    });

    console.log("Token cookie cleared");
    console.log("Set-Cookie header after clear:", res.getHeader("Set-Cookie"));

    res.json({ success: true, message: "Logged out successfully" });
  });
});

router.get("/verify", (req, res, next) => {
  console.log("=== VERIFY ROUTE HIT ===");
  console.log("Request headers:", req.headers);
  console.log("Cookies on verify request:", req.cookies);
  
  // Handle token from URL (fallback from OAuth redirect)
  const urlToken = req.query.token as string;
  if (urlToken && !req.cookies.token) {
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("token", urlToken, {
      httpOnly: true,
      sameSite: "none" as const,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
      domain: isProduction ? ".vercel.app" : undefined,
    });
    req.cookies.token = urlToken;
  }
  
  next();
}, verifyJWT, (req: Request, res: Response) => {
  const user = (req as Request & { user?: any }).user;

  console.log("verify route user:", user);

  if (!user) {
    console.log("VERIFY FAILED → No user on request");
    return res.status(401).json({ message: "Unauthorized" });
  }

  console.log("VERIFY SUCCESS → Returning user");
  return res.status(200).json(user);
});

export default router;