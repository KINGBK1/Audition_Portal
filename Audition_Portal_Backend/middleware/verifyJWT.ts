import jwt, { Secret, JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
require("dotenv").config();

const getTokenFromCookies = (req: Request): string | undefined => {
  return req.cookies?.token;
};

export const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  const token = getTokenFromCookies(req);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Missing token" });
  }

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET as Secret,
    (err, decoded) => {
      if (err || !decoded) {
        console.error("JWT verification error:", err);
        return res.status(403).json({ message: "Forbidden: Invalid token" });
      }

      // Save decoded user in req.user
req.user = (decoded as any).user;
      next();
    }
  );
};

// Middleware to verify ADMIN role
export const verifyAdmin = (req: Request, res: Response, next: NextFunction) => {
  const token = getTokenFromCookies(req);
  if (!token) return res.status(401).json({ message: "Unauthorized: Missing token" });

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as Secret) as JwtPayload;

    if (!decoded || (decoded as any).user?.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }

    (req as Request & { user?: any }).user = (decoded as any).user;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Forbidden: Invalid token" });
  }
};

// Middleware to verify MEMBER role
export const verifyMember = (req: Request, res: Response, next: NextFunction) => {
  const token = getTokenFromCookies(req);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Missing token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as Secret) as JwtPayload;

    if (!decoded || (decoded as any).user?.role !== "ADMIN") {
      res.clearCookie("token");
      return res.status(403).json({ message: "Forbidden: Members only." });
    }

req.user = (decoded as any).user;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Forbidden: Invalid token" });
  }
};
