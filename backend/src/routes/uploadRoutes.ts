import auth from "../middlewares/authMiddleware";
import express from "express";
import { uploadDocument } from "../middlewares/upload";
import { uploadFile } from "../controllers/uploadController";
<<<<<<< HEAD
=======
import validate from "../middlewares/validate";
import { videoLinkSchema } from "../DTO/VideoLinkDTO";
>>>>>>> 8d2630a (chore: added dtos for moderation/payment, validated routes, and updated postman)

const router = express.Router();

// Route: /api/upload/file
// 1. Check Auth -> 2. Process File -> 3. Return Response
router.post(
<<<<<<< HEAD
   "/file",
   // validate(videoLinkSchema),
   auth,
   uploadDocument.single("file"),
   uploadFile
=======
  "/file",
  validate(videoLinkSchema),
  auth,
  uploadDocument.single("file"),
  uploadFile
>>>>>>> 8d2630a (chore: added dtos for moderation/payment, validated routes, and updated postman)
);

export default router;
