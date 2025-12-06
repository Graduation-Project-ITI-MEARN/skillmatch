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

const router = express.Router();

// ==============================================================================
// PUBLIC ROUTES
// ==============================================================================

// Get all published challenges (Feed)
router.get("/", getPublishedChallenges);

// ==============================================================================
// PROTECTED ROUTES (Authenticated Users)
// ==============================================================================

// Get challenges created by the current user
router.get("/mine", auth, getMyChallenges);

// Create a new challenge (Company & Challenger only)
router.post("/", auth, restrictTo(["company", "challenger"]), createChallenge);

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

export default router;
