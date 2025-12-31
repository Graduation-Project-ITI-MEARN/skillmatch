import {
  createChallenge,
  deleteChallenge,
  getAllChallenges,
  getChallengeById,
  getMyChallenges,
  getPublishedChallenges,
  updateChallenge,
} from "../controllers/challengeController";
import { createChallengeDTO, updateChallengeDTO } from "../DTO/challenge";

import auth from "../middlewares/authMiddleware";
import express from "express";
import { requireSubscription } from "../middlewares/requirePayment";
import { restrictTo } from "../middlewares/restrictTo";
import validate from "../middlewares/validate";

const router = express.Router();

// ==========================
// PUBLIC ROUTES
// ==========================

// Get all published challenges (Feed)
router.get("/", getPublishedChallenges);

// ==========================
// PROTECTED ROUTES (Authenticated Users)
// ==========================

// Get challenges created by the logged-in user
router.get("/mine", auth, getMyChallenges);

// Get challenge details by ID
router.get("/:id", getChallengeById);

// Create a new challenge (Company & Challenger only)
router.post(
  "/",
  auth,
  restrictTo(["company", "challenger"]),
  requireSubscription,
  validate(createChallengeDTO),
  createChallenge
);

// Update an existing challenge (Creator only)
router.put(
  "/:id",
  auth,
  restrictTo(["company", "challenger"]),
  validate(updateChallengeDTO),
  updateChallenge
);

// Delete a challenge (Creator only)
router.delete(
  "/:id",
  auth,
  restrictTo(["company", "challenger"]),
  deleteChallenge
);

// ==========================
// ADMIN ROUTES
// ==========================

// Get all challenges including drafts and archived (Admin only)
router.get("/all", auth, restrictTo(["admin"]), getAllChallenges);

export default router;
