import express from "express";
import {
  createChallenge,
  getPublishedChallenges,
  getMyChallenges,
  getAllChallenges,
} from "../controllers/challengeController";

import auth, { restrictTo } from "../middlewares/authMiddleware";

const router = express.Router();

// Public Route: Anyone can see published challenges
router.get("/", getPublishedChallenges);

// Protected Route: Only 'company' and 'challenger' can create.
router.post("/", auth, restrictTo("company", "challenger"), createChallenge);

router.get("/mine", auth, getMyChallenges);

router.get("/all", auth, restrictTo("admin"), getAllChallenges);

export default router;
