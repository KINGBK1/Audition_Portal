import { Router } from "express";
import { upload } from "../services/upload";
import { Request, Response } from "express";
const router = Router();

router.post(
  "/upload",
  upload.single("image"),
  (req: Request, res: Response) => {
    // Cast req to 'any' or extend Request to access .file
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    res.json({
      message: "File uploaded successfully",
      url: file.path, // 'path' exists on Express.Multer.File
    });
  }
);

export default router;
