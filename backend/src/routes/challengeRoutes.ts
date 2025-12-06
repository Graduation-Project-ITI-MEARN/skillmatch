import express from "express";
import {
  createChallenge,
  getAllChallenges,
  getMyChallenges,
  getPublishedChallenges,
  updateChallenge,
  deleteChallenge,
} from "../controllers/challengeController";
import auth from "../middlewares/authMiddleware";
import { restrictTo } from "../middlewares/restrictTo";
import { advancedResults } from "../middlewares/advancedResults";
import Challenge from "../models/Challenge";

const router = express.Router();


// Update an existing challenge (Safe Update)
router.put(
  "/:id",
  auth,
  restrictTo(["company", "challenger"]),
  updateChallenge
);

// Delete a challenge (Safe Delete)
router.delete(
  "/:id",
  auth,
  restrictTo(["company", "challenger"]),
  deleteChallenge
);

// ==============================================================================
// ADMIN ROUTES
// ==============================================================================

// Get all challenges including drafts and archived (Admin only)
router.get("/all", auth, restrictTo(["admin"]), getAllChallenges);
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
