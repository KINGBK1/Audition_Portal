"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeAdmin = exports.handleNewMember = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
// Helper to create cookie options
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "lax", // change to "none" if cross-origin in prod
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
};
const generateToken = (email, role) => {
    return jsonwebtoken_1.default.sign({ email, role }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};
// Register or login a user
const handleNewMember = async (req, res) => {
    const { user, pwd, email } = req.body;
    if (!user || !pwd) {
        return res.status(402).json({ message: "Username or password missing." });
    }
    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            // Login existing user
            const token = generateToken(existingUser.email, existingUser.role);
            res.cookie("token", token, cookieOptions);
            return res
                .status(200)
                .json({ message: "User logged in", user: existingUser });
        }
        // Register new user (default role: USER)
        const createdUser = await prisma.user.create({
            data: {
                username: user,
                email: email,
                googleId: "",
                role: "USER",
            },
        });
        const token = generateToken(createdUser.email, createdUser.role);
        res.cookie("token", token, cookieOptions);
        return res
            .status(200)
            .json({ message: "User registered", user: createdUser });
    }
    catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
exports.handleNewMember = handleNewMember;
// Promote a user to ADMIN and set cookie
const makeAdmin = async (req, res) => {
    const { email } = req.body;
    try {
        const updated = await prisma.user.update({
            where: { email },
            data: { role: "ADMIN" },
        });
        // Generate new token for updated role
        const token = generateToken(updated.email, updated.role);
        res.cookie("token", token, cookieOptions);
        return res.status(200).json({
            message: "User promoted to admin",
            user: updated,
        });
    }
    catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
exports.makeAdmin = makeAdmin;
