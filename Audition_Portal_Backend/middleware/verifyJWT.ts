import jwt, { Secret, JwtPayload, VerifyErrors } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config();

const getTokenFromRequest = (req: Request): string | undefined => {
  console.log("---- getTokenFromRequest ----");
  console.log("Request origin:", req.headers.origin);
  console.log("Authorization header:", req.headers.authorization);
  console.log("Cookies object:", req.cookies);
  console.log("Cookie token:", req.cookies?.token ? "PRESENT" : "MISSING");

  // Check Authorization header first (for cross-origin requests)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    console.log("Token found in Authorization header");
    return authHeader.substring(7);
  }

  // Fallback to cookie (for same-origin requests)
  if (req.cookies?.token) {
    console.log("Token found in cookies");
    return req.cookies.token;
  }

  console.log("No token found in headers or cookies");
  return undefined;
};

export const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  console.log("==== verifyJWT ====");
  console.log("Request path:", req.path);
  console.log("Request method:", req.method);

  const token = getTokenFromRequest(req);

  if (!token) {
    console.log("verifyJWT FAILED → Missing token");
    return res.status(401).json({ message: "Unauthorized: Missing token" });
  }

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET as Secret,
    (err: VerifyErrors | null, decoded: string | JwtPayload | undefined) => {
      if (err || !decoded) {
        console.error("verifyJWT FAILED → Invalid token");
        console.error("JWT error:", err);
        return res.status(403).json({ message: "Forbidden: Invalid token" });
      }

      console.log("verifyJWT SUCCESS");
      console.log("Decoded payload:", decoded);

      // CRITICAL FIX: Set req.user correctly
      const payload = decoded as any;
      req.user = payload.user; // The user object is nested inside the payload
      console.log("Attached req.user:", req.user);

      next();
    }
  );
};

export const verifyAdmin = (req: Request, res: Response, next: NextFunction) => {
  console.log("==== verifyAdmin ====");
  console.log("Request path:", req.path);

  const token = getTokenFromRequest(req);
  if (!token) {
    console.log("verifyAdmin FAILED → Missing token");
    return res.status(401).json({ message: "Unauthorized: Missing token" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as Secret
    ) as JwtPayload;

    console.log("Decoded payload:", decoded);

    // CRITICAL FIX: Check role from nested user object
    const payload = decoded as any;
    if (!payload || !payload.user || payload.user.role !== "ADMIN") {
      console.log("verifyAdmin FAILED → Not ADMIN");
      console.log("User role:", payload?.user?.role);
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }

    req.user = payload.user;
    console.log("verifyAdmin SUCCESS →", req.user);

    next();
  } catch (error) {
    console.error("verifyAdmin ERROR → JWT verify threw");
    console.error(error);
    return res.status(403).json({ message: "Forbidden: Invalid token" });
  }
};

export const verifyMember = (req: Request, res: Response, next: NextFunction) => {
  console.log("==== verifyMember ====");
  console.log("Request path:", req.path);

  const token = getTokenFromRequest(req);

  if (!token) {
    console.log("verifyMember FAILED → Missing token");
    return res.status(401).json({ message: "Unauthorized: Missing token" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as Secret
    ) as JwtPayload;

    console.log("Decoded payload:", decoded);

    // CRITICAL FIX: Check role from nested user object
    const payload = decoded as any;
    if (!payload || !payload.user || payload.user.role !== "MEMBER") {
      console.log("verifyMember FAILED → Not MEMBER");
      console.log("User role:", payload?.user?.role);

      console.log("Clearing token cookie");
      res.clearCookie("token");

      return res.status(403).json({ message: "Forbidden: Members only." });
    }

    req.user = payload.user;
    console.log("verifyMember SUCCESS →", req.user);

    next();
  } catch (error) {
    console.error("verifyMember ERROR → JWT verify threw");
    console.error(error);
    return res.status(403).json({ message: "Forbidden: Invalid token" });
  }
};