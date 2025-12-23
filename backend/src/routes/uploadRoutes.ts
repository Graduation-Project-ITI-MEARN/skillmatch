import auth from "../middlewares/authMiddleware";
import express from "express";
import { uploadDocument } from "../middlewares/upload";
import { uploadFile } from "../controllers/uploadController";
import validate from "../middlewares/validate";
import { videoLinkSchema } from "../DTO/VideoLinkDTO";

const router = express.Router();

// Route: /api/upload/file
// 1. Check Auth -> 2. Process File -> 3. Return Response
router.post(
   "/file",
   // validate(videoLinkSchema),
   auth,
   uploadDocument.single("file"),
   uploadFile
);

export default router;
