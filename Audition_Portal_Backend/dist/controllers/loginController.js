"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("../passport/passport"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv").config();
const app = (0, express_1.default)();
app.get("/auth/google", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
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
app.get("/auth/google/callback", passport_1.default.authenticate("google", { failureRedirect: "/login" }), (req, res) => {
    const user = req.user;
    const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role, email: user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
    res.cookie("token", token, { httpOnly: true, sameSite: "lax" });
    if (user.role === "ADMIN") {
        console.log(user.role);
        res.redirect(process.env.FRONTEND_URL + "/admin/profile");
    }
    else {
        res.redirect(process.env.FRONTEND_URL + "/profile");
    }
});
app.use("/login", (req, res) => {
    // res.render('login');
    res.redirect("/profile");
});
app.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.session.destroy((err) => {
            if (err) {
                return next(err);
            }
            res.redirect(process.env.FRONTEND_HOME_URL || "/login");
        });
    });
});
