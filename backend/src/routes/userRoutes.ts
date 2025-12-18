import {
  getAISkills,
  getAllCandidates,
  getAllChallengers,
  getAllCompanies,
  getAllUsers,
  getUserById,
} from "../controllers/userController";

import User from "../models/User";
import { advancedResults } from "../middlewares/advancedResults";
import auth from "../middlewares/authMiddleware";
import express from "express";
import { restrictTo } from "../middlewares/restrictTo";

const router = express.Router();

router.get(
  "/",
  auth,
  restrictTo(["admin"]),
  advancedResults(User),
  getAllUsers
);

router.get("/candidates", auth, restrictTo(["admin"]), getAllCandidates);
router.get("/companies", auth, restrictTo(["admin"]), getAllCompanies);
router.get("/challengers", auth, restrictTo(["admin"]), getAllChallengers);
router.get("/profile/ai-skills", auth, getAISkills);

router.get("/:id", auth, restrictTo(["admin"]), getUserById);

export default router;
