import auth from "../middlewares/authMiddleware";
import express from "express";
import { uploadDocument } from "../middlewares/upload";
import { uploadFile } from "../controllers/uploadController";

const router = express.Router();

// Route: /api/upload/file
// 1. Check Auth -> 2. Process File -> 3. Return Response
// Route: /api/upload/file
router.post(
   "/file",
   // validate(videoLinkSchema),
   auth,
   uploadDocument.single("file"),
   uploadFile
);

export default router;
