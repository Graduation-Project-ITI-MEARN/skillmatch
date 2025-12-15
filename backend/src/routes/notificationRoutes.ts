import {
  getMyNotifications,
  markAllAsRead,
  markAsRead,
} from "../controllers/notificationController";

import auth from "../middlewares/authMiddleware";
import express from "express";
import { markReadParamsSchema } from "../DTO/notificationDTO";
import validate from "../middlewares/validate";

const router = express.Router();

router.use(auth);

router.get("/", getMyNotifications);

router.put("/read-all", markAllAsRead);

router.put("/:id/read", validate(markReadParamsSchema), markAsRead);

export default router;
