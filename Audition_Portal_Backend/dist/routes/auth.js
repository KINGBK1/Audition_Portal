"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("../passport/passport"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyJWT_1 = require("../middleware/verifyJWT");
const router = (0, express_1.Router)();
require("dotenv").config();
// GOOGLE AUTH ENTRY POINT
router.get("/google", passport_1.default.authenticate("google", {
    scope: ["profile", "email"],
    session: false, // ✅ No session
}));
// GOOGLE AUTH CALLBACK
router.get("/google/callback", passport_1.default.authenticate("google", { failureRedirect: "/", session: false }), (req, res) => {
    const token = jsonwebtoken_1.default.sign({ user: req.user }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
    // const isProduction = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
        httpOnly: true,
        // sameSite: isProduction ? "none" : "lax",
        // secure: isProduction,
        sameSite: "none",
        secure: true,
    });
    const role = req.user.role;
    if (role === "ADMIN") {
        res.redirect(process.env.FRONTEND_ADMIN_REDIRECT_URL || "/admin/profile");
    }
    else {
        res.redirect(process.env.FRONTEND_REDIRECT_URL || "/profile");
    }
});
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
router.get("/verify", verifyJWT_1.verifyJWT, (req, res) => {
    const user = req.user;
    if (!user)
        return res.status(401).json({ message: "Unauthorized" });
    return res.status(200).json(user);
});
exports.default = router;
