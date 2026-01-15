"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const client_1 = require("@prisma/client");
const passport_google_oauth20_1 = require("passport-google-oauth20");
const dotenv_1 = __importDefault(require("dotenv"));
const verifyEmail_1 = require("../controllers/verifyEmail");
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    //change this to your callback URL
    callbackURL: process.env.NODE_ENV === "production"
        ? "https://audition-portal-jj3t.onrender.com/auth/google/callback"
        : "/auth/google/callback",
    passReqToCallback: true,
}, async (req, accessToken, refreshToken, profile, done) => {
    try {
        //  Validate profile.emails and photos exist
        if (!profile.emails || profile.emails.length === 0) {
            return done(null, false, {
                message: "Email not found in Google profile.",
            });
        }
        if (!profile.photos || profile.photos.length === 0) {
            return done(null, false, {
                message: "Photo not found in Google profile.",
            });
        }
        const userEmail = profile.emails[0].value;
        const pictureUrl = profile.photos[0].value;
        //  1. Validate email domain
        if (!(0, verifyEmail_1.verifyEmail)(userEmail)) {
            console.log("Attempted login with:", userEmail, "Valid:", (0, verifyEmail_1.verifyEmail)(userEmail));
            return done(null, false, {
                message: "You are not a first-year student at NIT Durgapur.",
            });
        }
        //  2. Fetch or create user
        let user = await prisma.user.findUnique({
            where: { email: userEmail },
        });
        const isAdmin = userEmail === process.env.ADMIN_EMAIL;
        if (user) {
            if (isAdmin && user.role !== client_1.Role.ADMIN) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { role: client_1.Role.ADMIN },
                });
            }
        }
        else {
            user = await prisma.user.create({
                data: {
                    googleId: profile.id,
                    username: profile.displayName,
                    picture: pictureUrl,
                    email: userEmail,
                    role: isAdmin ? client_1.Role.ADMIN : client_1.Role.USER,
                },
            });
        }
        return done(null, user); // Type-safe user return
    }
    catch (err) {
        console.error("GoogleStrategy Error:", err);
        return done(err); // Explicitly return null if error
    }
}));
// Serialization with explicit types
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id },
        });
        done(null, user);
    }
    catch (err) {
        done(err, null);
    }
});
exports.default = passport_1.default;
