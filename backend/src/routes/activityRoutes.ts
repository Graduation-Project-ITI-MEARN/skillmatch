import express from "express";
import { getRecentActivity } from "../controllers/activityController";
import auth from "../middlewares/authMiddleware";

const router = express.Router();

router.use(auth);

router.get("/", getRecentActivity);

export default router;
