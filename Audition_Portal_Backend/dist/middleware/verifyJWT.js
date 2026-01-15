"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyMember = exports.verifyAdmin = exports.verifyJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const getTokenFromCookies = (req) => {
    return req.cookies?.token;
};
const verifyJWT = (req, res, next) => {
    const token = getTokenFromCookies(req);
    if (!token) {
        return res.status(401).json({ message: "Unauthorized: Missing token" });
    }
    jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err || !decoded) {
            console.error("JWT verification error:", err);
            return res.status(403).json({ message: "Forbidden: Invalid token" });
        }
        // Save decoded user in req.user
        req.user = decoded.user;
        next();
    });
};
exports.verifyJWT = verifyJWT;
// Middleware to verify ADMIN role
const verifyAdmin = (req, res, next) => {
    const token = getTokenFromCookies(req);
    if (!token)
        return res.status(401).json({ message: "Unauthorized: Missing token" });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!decoded || decoded.user?.role !== "ADMIN") {
            return res.status(403).json({ message: "Forbidden: Admins only" });
        }
        req.user = decoded.user;
        next();
    }
    catch (error) {
        return res.status(403).json({ message: "Forbidden: Invalid token" });
    }
};
exports.verifyAdmin = verifyAdmin;
// Middleware to verify MEMBER role
const verifyMember = (req, res, next) => {
    const token = getTokenFromCookies(req);
    if (!token) {
        return res.status(401).json({ message: "Unauthorized: Missing token" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!decoded || decoded.user?.role !== "ADMIN") {
            res.clearCookie("token");
            return res.status(403).json({ message: "Forbidden: Members only." });
        }
        req.user = decoded.user;
        next();
    }
    catch (error) {
        return res.status(403).json({ message: "Forbidden: Invalid token" });
    }
};
exports.verifyMember = verifyMember;
