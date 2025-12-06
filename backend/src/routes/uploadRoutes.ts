import express from "express";
import { uploadFile } from "../controllers/uploadController";
import { uploadDocument } from "../middlewares/upload";
import auth from "../middlewares/authMiddleware";

const router = express.Router();

// Route: /api/upload/file
// 1. Check Auth -> 2. Process File -> 3. Return Response
router.post("/file", auth, uploadDocument.single("file"), uploadFile);

export default router;
