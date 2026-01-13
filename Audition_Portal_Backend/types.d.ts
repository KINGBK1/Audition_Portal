import { User as PrismaUser, Role as PrismaRole } from "@prisma/client";
import * as express from "express";

declare global {
  namespace Express {
    // This connects Express's User type directly to your Prisma User model,
    // which already includes your custom Role enum.
    interface User extends PrismaUser {}

    interface Request {
      user?: PrismaUser;

      // Fixes the Passport logout() overloads
      logout(
        options: { keepSessionInfo?: boolean },
        done: (err: any) => void
      ): void;
      logout(done: (err: any) => void): void;

      // Fixes the express-session property error
      session: any;
    }
  }
}
