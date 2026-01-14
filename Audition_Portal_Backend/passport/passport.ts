import passport from "passport";
import { PrismaClient, Role } from "@prisma/client";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from "dotenv";
import { verifyEmail } from "../controllers/verifyEmail";
import {
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";

dotenv.config();

const prisma = new PrismaClient();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      //change this to your callback URL
      callbackURL:"/auth/google/callback",
      // callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/api/auth/google/callback",
      // scope: ["profile", "email"],
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        //  Validate profile.emails and photos exist
        if (!profile.emails || profile.emails.length === 0) {
          return done(null, false, { message: "Email not found in Google profile." });
        }

        if (!profile.photos || profile.photos.length === 0) {
          return done(null, false, { message: "Photo not found in Google profile." });
        }

        const userEmail = profile.emails[0].value;
        const pictureUrl = profile.photos[0].value;

        //  1. Validate email domain
        if (!verifyEmail(userEmail)) {
          console.log("Attempted login with:", userEmail, "Valid:", verifyEmail(userEmail));
          
          return done(null, false, {
            message: "You are not a first-year student at NIT Durgapur.",
          });
        }

        //  2. Fetch or create user
        let user = await prisma.user.findUnique({ where: { email: userEmail } });

        const isAdmin = userEmail === process.env.ADMIN_EMAIL;

        if (user) {
          if (isAdmin && user.role !== Role.ADMIN) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { role: Role.ADMIN },
            });
          }
        } else {
          user = await prisma.user.create({
            data: {
              googleId: profile.id,
              username: profile.displayName,
              picture: pictureUrl,
              email: userEmail,
              role: isAdmin ? Role.ADMIN : Role.USER,
            },
          });
        }

        return done(null, user); // Type-safe user return
      } catch (err) {
        console.error("GoogleStrategy Error:", err);
        return done(err as Error); // Explicitly return null if error
      }
    }
  )
);

// Serialization with explicit types
passport.serializeUser((user: any, done: (err: any, id?: any) => void) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: any, done: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});


export default passport