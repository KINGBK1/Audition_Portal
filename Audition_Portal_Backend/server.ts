import express from "express";
import cors from "cors";
import passport from "./passport/passport";
import session from "express-session";
import { PrismaClient, Prisma, User as PrismaUser } from "@prisma/client";
import registerRouter from "./routes/register";
import authRouter from "./routes/auth";
import quizRouter from "./routes/quiz";
import picRouter from "./routes/picUpload";
import cookieParser from "cookie-parser";
import { verifyAdmin, verifyJWT } from "./middleware/verifyJWT";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import round2Router from "./routes/round2";
import adminRoundOneRouter from "./routes/adminRoundOne.route";
import adminRoundTwoRouter from "./routes/adminRoundTwo.route";
import dotenv from "dotenv";
dotenv.config();

const app = express();

console.log("Prisma DB URL:", process.env.DATABASE_URL);

const prisma = new PrismaClient();

app.use(cookieParser());

const isProduction = process.env.NODE_ENV === "production";

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      console.log("Request from origin:", origin);
      
      const allowedOrigins = [
        process.env.FRONTEND_HOME_URL,
        "https://audition-portal-gamma.vercel.app",
        "http://localhost:3000",
        "http://localhost:3001",
      ].filter(Boolean);
      
      // Allow no origin (for server-to-server requests, Postman, etc.)
      if (!origin) {
        console.log("No origin - allowing");
        return callback(null, true);
      }
      
      // Check if origin is allowed
      const isAllowed = 
        allowedOrigins.some(allowed => origin === allowed) ||
        origin.includes("vercel.app") ||
        origin.includes("localhost");
      
      if (isAllowed) {
        console.log("Origin allowed:", origin);
        callback(null, true);
      } else {
        console.log("Origin BLOCKED:", origin);
        callback(new Error(`CORS: Origin ${origin} not allowed`));
      }
    },
    credentials: true, // CRITICAL - allows cookies
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { 
      secure: isProduction, // Secure in production
      sameSite: isProduction ? "none" : "lax", // "none" for cross-origin in production
      httpOnly: true,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

async function connectToDatabase() {
  try {
    await prisma.$connect();
    console.log("Connected to the database");
  } catch (err) {
    console.error(err);
  }
}

app.get("/api/user", verifyJWT, async (req: Request, res: Response) => {
  try {
    const user = req.user as PrismaUser | undefined;

    if (!user || !user.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(userData);
  } catch (error) {
    console.error("Failed to fetch user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/verify-admin", verifyAdmin, (req, res) => {
  res.json({
    message: "Token is valid",
    user: (req as unknown as Request & { user: any }).user,
  });
});

app.get("/", (req, res) => {
  res.send("API is running.");
});

app.get("/api/verify-token", verifyJWT, (req, res) => {
  res.json({
    message: "Token is valid",
    user: (req as unknown as Request & { user: any }).user,
  });
});

app.put(
  "/api/update-user-info",
  verifyJWT,
  async (req: Request, res: Response) => {
    const { contact, gender, specialization } = req.body;

    try {
      if (req?.user) {
        const { id: userId } = req.user as PrismaUser;

        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            contact,
            gender,
            specialization,
          },
        });

        const newToken = jwt.sign(
          { user: updatedUser },
          process.env.ACCESS_TOKEN_SECRET as string,
          { expiresIn: "1d" }
        );
        
        // FIXED: Cookie settings for production
        res.cookie("token", newToken, {
          httpOnly: true,
          sameSite: isProduction ? "none" : "lax",
          secure: isProduction, // Must be true in production
          maxAge: 24 * 60 * 60 * 1000, // 1 day
          path: "/",
          domain: isProduction ? ".vercel.app" : undefined,
        });

        res.json(updatedUser);
      } else {
        res.status(401).json({ error: "User not authenticated" });
      }
    } catch (error) {
      console.error("Error updating user info:", error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return res
            .status(404)
            .json({ error: "User not found or session invalid." });
        }
        if (error.code === "P2002") {
          return res
            .status(400)
            .json({
              error: "Validation failed: A user with this data already exists.",
            });
        }
        return res
          .status(400)
          .json({ error: "Invalid data provided for update." });
      }

      res
        .status(500)
        .json({
          error: "Failed to update user info due to an internal server issue.",
        });
    }
  }
);

app.get("/admin/profile", verifyAdmin, (req, res) => {
  res.redirect(process.env.FRONTEND_HOME_URL + "/admin/profile");
});

app.use("/pic", picRouter);
app.use("/auth", authRouter);
app.use("/admin/login", registerRouter);
app.use("/api/quiz", quizRouter);
app.use("/api/round2", round2Router);

app.use("/api/admin/r1", adminRoundOneRouter);
app.use("/api/admin/r2", adminRoundTwoRouter);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  connectToDatabase();
  console.log("Server is running on port", PORT);
});