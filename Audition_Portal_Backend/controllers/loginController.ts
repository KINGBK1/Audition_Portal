import express from "express";
import passport from "../passport/passport";
import jwt from "jsonwebtoken";
import { User as PrismaUser } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// app.get(
//   "/auth/google/callback",
//   passport.authenticate("google", { failureRedirect: "/login" }),
//   function (req, res) {
//     // Successful authentication, redirect home.
//     const token = jwt.sign(
//       { user: req.user },
//       process.env.ACCESS_TOKEN_SECRET as string,
//       { expiresIn: "1d" }
//     );
//     res.cookie("token", token, { httpOnly: true });
//     res.redirect(`${process.env.FRONTEND_REDIRECT_URL}?token=${token}`);
//   }
// );



app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const user = req.user as any;

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "1d" }
    );


    res.cookie("token", token, { httpOnly: true, sameSite: "lax" });

    if (user.role === "ADMIN") {
      console.log(user.role);
      res.redirect(process.env.FRONTEND_URL + "/admin/profile");
    } else {
      res.redirect(process.env.FRONTEND_URL + "/profile");
    }
  }
);




app.use("/login", (req, res) => {
  // res.render('login');
  res.redirect("/profile");
});

app.get("/logout", (req, res, next) => {
  req.logout((err: any) => {
    if (err) {
      return next(err);
    }
    req.session.destroy((err: any) => {
      if (err) {
        return next(err);
      }
      res.redirect(process.env.FRONTEND_HOME_URL || "/login");
    });
  });
});


