import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { CookieOptions } from "express";
import dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();

// Helper to create cookie options
const cookieOptions:CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // HTTPS only in prod
  sameSite: "lax", // change to "none" if cross-origin in prod
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
};

const generateToken = (email: string, role: string) => {
  return jwt.sign({ email, role }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
};

// Register or login a user
export const handleNewMember = async (req: Request, res: Response) => {
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
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

// Promote a user to ADMIN and set cookie
export const makeAdmin = async (req: Request, res: Response) => {
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
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};
