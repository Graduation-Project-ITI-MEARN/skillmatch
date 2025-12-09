import express from "express";
import {
  getMyNotifications,
  markAllAsRead,
  markAsRead,
} from "../controllers/notificationController";
import auth from "../middlewares/authMiddleware";

const router = express.Router();

router.use(auth);

router.get("/", getMyNotifications);

router.put("/read-all", markAllAsRead);

router.put("/:id/read", markAsRead);

export default router;
