import dotenv from "dotenv";
dotenv.config();
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

interface CustomParams {
  folder: string;
  allowedFormats: string[];
  resource_type: string;
}

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "app",
    allowedFormats: [
      "jpg",
      "png",
      "jpeg",
      "ogg",
      "mp3",
      "wav",
      "txt",
      "zip",
      "cpp",
    ],
    resource_type: "auto",
  } as CustomParams,
});

export const upload = multer({ storage: storage });
// module.exports = upload;
