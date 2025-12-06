import express from "express";
import auth from "../middlewares/authMiddleware";
import { restrictTo } from "../middlewares/restrictTo";
import { advancedResults } from "../middlewares/advancedResults";
import Challenge from "../models/Challenge";

import {
  createChallenge,
  getPublishedChallenges,
  getMyChallenges,
  getAllChallenges,
} from "../controllers/challengeController";

const router = express.Router();

// --- ADMIN: all challenges ---
router.get(
  "/all",
  auth,
  restrictTo(["admin"]),
  advancedResults(Challenge, {
    path: "creatorId",
    select: "name email type",
  }),
  getAllChallenges
);

// --- USER: my challenges ---
router.get(
  "/mine",
  auth,
  (req: any, res, next) =>
    advancedResults(
      Challenge,
      { path: "creatorId", select: "name type" },
      { creatorId: req.user._id }
    )(req, res, next),
  getMyChallenges
);

// --- PUBLIC: published challenges ---
router.get(
  "/",
  advancedResults(
    Challenge,
    { path: "creatorId", select: "name type" },
    { status: "published" }
  ),
  getPublishedChallenges
);

// --- CREATE challenge ---
router.post("/", auth, restrictTo(["company", "challenger"]), createChallenge);

export default router;
