import express, { Request, Response, NextFunction } from "express";
import passport from "../passport/passport";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const app = express();

/**
 * Google Auth Entry
 */
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

/**
 * Google Auth Callback
 */
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req: Request, res: Response) => {
    if (!req.user) {
      return res.redirect("/login");
    }

    type AuthUser = {
      id: number; // Changed from string to number
      role: string;
      email: string;
    };

    const user = req.user as AuthUser;

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production", // Add this for production
    });

    if (user.role === "ADMIN") {
      res.redirect(`${process.env.FRONTEND_URL}/admin/profile`);
    } else {
      res.redirect(`${process.env.FRONTEND_URL}/profile`);
    }
  }
);

/**
 * Login Redirect
 */
app.use("/login", (_req: Request, res: Response) => {
  res.redirect("/profile");
});

/**
 * Logout
 */
app.get(
  "/logout",
  (req: Request, res: Response, next: NextFunction) => {
    req.logout((err: any) => {
      if (err) return next(err);

      if (req.session) {
        req.session.destroy((err: unknown) => {
          if (err) return next(err);
          res.redirect(process.env.FRONTEND_HOME_URL || "/login");
        });
      } else {
        res.redirect(process.env.FRONTEND_HOME_URL || "/login");
      }
    });
  }
);

export default app;
