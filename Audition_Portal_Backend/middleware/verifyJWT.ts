import jwt, { Secret, JwtPayload, VerifyErrors } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config();

const getTokenFromRequest = (req: Request): string | undefined => {
  // Log cookie presence for debugging
  console.log("Cookies received:", req.cookies);
  console.log("Token cookie:", req.cookies?.token ? "present" : "missing");
  
  return req.cookies?.token;
};

export const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    console.log("No token found in request");
    return res.status(401).json({ message: "Unauthorized: Missing token" });
  }

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET as Secret,
    (err: VerifyErrors | null, decoded: string | JwtPayload | undefined) => {
      if (err || !decoded) {
        console.error("JWT verification error:", err);
        return res.status(403).json({ message: "Forbidden: Invalid token" });
      }

      req.user = (decoded as any).user;
      console.log("Token verified for user:", req.user?.email);
      next();
    }
  );
};

export const verifyAdmin = (req: Request, res: Response, next: NextFunction) => {
  const token = getTokenFromRequest(req);
  if (!token) {
    console.log("Admin check: No token");
    return res.status(401).json({ message: "Unauthorized: Missing token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as Secret) as JwtPayload;

    if (!decoded || (decoded as any).user?.role !== "ADMIN") {
      console.log("Admin check failed: not admin");
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }

    req.user = (decoded as any).user;
    console.log("Admin verified:", req.user?.email);
    next();
  } catch (error) {
    console.error("Admin verification error:", error);
    return res.status(403).json({ message: "Forbidden: Invalid token" });
  }
};

export const verifyMember = (req: Request, res: Response, next: NextFunction) => {
  const token = getTokenFromRequest(req);

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