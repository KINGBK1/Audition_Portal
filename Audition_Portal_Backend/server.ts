import express from "express";
import cors from "cors";
import passport from "./passport/passport";
import session from "express-session";
import { PrismaClient } from "@prisma/client";
import type { User } from "@prisma/client";
import registerRouter from "./routes/register";
import authRouter from "./routes/auth";
import quizRouter from "./routes/quiz";
import picRouter from "./routes/picUpload";
import cookieParser from "cookie-parser";
import { verifyAdmin, verifyJWT } from "./middleware/verifyJWT";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import round2Router from "./routes/round2";
require('dotenv').config();
const app = express();

// interface AuthenticatedRequest extends Request {
//   user?: User;
// }

console.log("Prisma DB URL:", process.env.DATABASE_URL);


const prisma = new PrismaClient();

app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
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
    const userWithId = (req as Request & { user?: User }).user;
    
    if (!userWithId?.id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userWithId.id },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
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

app.get("/");
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
        const userId = (req.user as any)?.id as User["id"];

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
          secure: false,
        });

        res.json(updatedUser);
      } else {
        res.status(401).json({ error: "User not authenticated" });
      }
    } catch (error) {
      console.error("Error updating user info:", error);
      res.status(500).json({ error: "Failed to update user info" });
    }
  }
);

// app.get("/profile", (req, res) => {
//   if (req.isAuthenticated() && req.user) {
//     res.render("profile", { user: req.user });
//   } else {
//     res.redirect("/login");
//   }
// });

app.get("/admin/profile", verifyAdmin, (req, res) => {
  res.redirect(process.env.FRONTEND_HOME_URL + "/admin/profile");
});

// app.set("view engine", "pug");
app.use("/pic", picRouter);
app.use("/auth", authRouter);
app.use("/admin/login", registerRouter);
app.use("/api/quiz", quizRouter);
app.use("/api/round2", round2Router);

import adminRoundOneRouter from "./routes/adminRoundOne.route"

app.use("/api/admin/r1",adminRoundOneRouter)


app.listen(8080, () => {
  connectToDatabase();
  console.log("Server is running on port 8080");
});


