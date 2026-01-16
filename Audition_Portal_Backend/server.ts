import express from "express";
import cors from "cors";
import passport from "./passport/passport";
import session from "express-session";
import { PrismaClient, Prisma, User as PrismaUser } from "@prisma/client"; // Added 'Prisma' for error handling
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

// Dynamic CORS configuration
const allowedOrigins = [
  "http://localhost:3001",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean); // Remove any undefined values

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Allow all Vercel preview deployments and localhost
      if (
        origin.includes("vercel.app") ||
        origin.includes("localhost") ||
        allowedOrigins.includes(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set secure to true if using HTTPS
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
    // Cast req.user to your PrismaUser model specifically
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

// Added a basic response for the root path
app.get("/", (req, res) => {
  res.send("API is running.");
});

app.get("/api/verify-token", verifyJWT, (req, res) => {
  // If the token is valid, the verifyJWT middleware will allow this function to run
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
      // Get user ID from authenticated request
      if (req?.user) {
        // Use destructuring and type assertion for clarity
        const { id: userId } = req.user as PrismaUser;

        // Update user in database using Prisma
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
        res.cookie("token", newToken, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });

        res.json(updatedUser);
      } else {
        res.status(401).json({ error: "User not authenticated" });
      }
    } catch (error) {
      console.error("Error updating user info:", error);

      // --- IMPROVED ERROR HANDLING ---
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // P2025: Record to update was not found
        if (error.code === "P2025") {
          return res
            .status(404)
            .json({ error: "User not found or session invalid." });
        }
        // P2002: Unique constraint failure (e.g., trying to set contact to an already existing number)
        if (error.code === "P2002") {
          return res
            .status(400)
            .json({
              error: "Validation failed: A user with this data already exists.",
            });
        }
        // General Prisma validation error (e.g., wrong type)
        return res
          .status(400)
          .json({ error: "Invalid data provided for update." });
      }

      // 500 for all other, unexpected errors
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

