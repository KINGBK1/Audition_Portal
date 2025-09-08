import express, { Request, Response, Router } from "express";
import passport from "../passport/passport";
import jwt from "jsonwebtoken";
import { Role } from "../types";
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

    res.cookie("token", token, { httpOnly: true });

    const role = (req.user as any).role;
    if (role === "ADMIN") {
      res.redirect(process.env.FRONTEND_ADMIN_REDIRECT_URL || "/admin/profile");
    } else {
      res.redirect(process.env.FRONTEND_REDIRECT_URL || "/profile");
    }
  }
);

// LOGOUT
router.get("/logout", (req: Request, res: Response) => {
  res.clearCookie("token");

  const reqWithSession = req as typeof req & { session?: any };
  if (reqWithSession.session) {
    reqWithSession.session.destroy(() => {
      res.redirect(process.env.FRONTEND_HOME_URL || "/login");
    });
  } else {
    res.redirect(process.env.FRONTEND_HOME_URL || "/login");
  }
});

// VERIFY JWT
router.get("/verify", verifyJWT, (req: Request, res: Response) => {
  const user = (req as Request & { user?: any }).user;
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  return res.status(200).json(user);
});

export default router;
