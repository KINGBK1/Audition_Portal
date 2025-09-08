// import { Request, Response } from 'express';
// import { PrismaClient } from '@prisma/client';
// import jwt from 'jsonwebtoken';
// import bcrypt from "bcrypt";
// require("dotenv").config();

// const prisma = new PrismaClient();

// export const handleNewMember = async (req: Request, res: Response): Promise<Response> => {
//   const { user, pwd, email } = req.body;
//   if (!user || !pwd)
//     return res.status(402).json({ message: "username or password missing." });
//   if (pwd !== process.env.ADMIN_PASSWORD) return res.status(401).json({ message: "Wrong password!" });

//   try {
//     const existingUser = await prisma.user.findUnique({ where: { email: req.body.email } });
//     if (existingUser) {
//       const cookie = Buffer.from(`${pwd}`).toString('base64');
//       res.cookie("token", cookie, { httpOnly: true });
//       return res.status(200).json({ message: "User logged-in" });
//     }
//     console.log("Email: ", email);
//     if (email === process.env.ADMIN_EMAIL) {
//       const createdAdmin = await prisma.user.create({
//         data: {
//           username: user as string,
//           email: email as string,
//           googleId: "",
//           role: "ADMIN",
//         },
//       });
//       console.log("Created Admin: ", createdAdmin);
//       const cookie = Buffer.from(`${pwd}`).toString('base64');
//       res.cookie("token", cookie, { httpOnly: true });
//       return res.status(200).json({ message: "Admin registered successfully", user: createdAdmin });
//     } else {
//       const createdUser = await prisma.user.create({
//         data: {
//           username: user as string,
//           email: email as string,
//           googleId: "",
//           role: "USER",
//         },
//       });
//       const cookie = Buffer.from(`${pwd}`).toString('base64');
//       res.cookie("token", cookie, { httpOnly: true });
//       return res.status(200).json({ message: "User registered successfully", user: createdUser });
//     }

//   } catch (err: any) {
//     return res.status(500).json({ message: err.message });
//   }
// };