"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_1 = require("../services/upload");
const router = (0, express_1.Router)();
router.post("/upload", upload_1.upload.single("image"), (req, res) => {
    // Cast req to 'any' or extend Request to access .file
    const file = req.file;
    if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
    }
    res.json({
        message: "File uploaded successfully",
        url: file.path, // 'path' exists on Express.Multer.File
    });
});
exports.default = router;
