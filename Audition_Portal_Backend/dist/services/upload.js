"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
require("dotenv").config();
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET,
});
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
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
    },
});
exports.upload = (0, multer_1.default)({ storage: storage });
// module.exports = upload;
