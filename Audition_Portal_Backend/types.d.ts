import { User as PrismaUser } from "@prisma/client";
import { Request } from "express";
import "multer";

export interface AuthenticatedRequest extends Request {
  user?: PrismaUser;
}
declare global {
  namespace Express {
    // Passport uses Express.User internally
    interface User extends PrismaUser {}

    interface Request {
      user?: PrismaUser;
      file?: Express.Multer.File;
      files?:
        | Express.Multer.File[]
        | { [fieldname: string]: Express.Multer.File[] }; // Adds multiple file support

      logout(
        options: { keepSessionInfo?: boolean },
        done: (err: any) => void
      ): void;
      logout(done: (err: any) => void): void;

      session: any;
    }
  }
}
