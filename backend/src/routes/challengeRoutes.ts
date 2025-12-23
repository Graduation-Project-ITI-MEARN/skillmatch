import express from "express";
import {
  createChallenge,
  getPublishedChallenges,
  getMyChallenges,
  getAllChallenges,
  updateChallenge,
  deleteChallenge,
  getChallengeById,
} from "../controllers/challengeController";
import auth from "../middlewares/authMiddleware";
import { restrictTo } from "../middlewares/restrictTo";
import validate from "../middlewares/validate";
import { createChallengeDTO, updateChallengeDTO } from "../DTO/challenge";

const router = express.Router();

// ==========================
// PUBLIC ROUTES
// ==========================

// Get all published challenges (Feed)
router.get("/", getPublishedChallenges);

// Get challenge details by ID
router.get("/:id", getChallengeById);

// ==========================
// PROTECTED ROUTES (Authenticated Users)
// ==========================

// Get challenges created by the logged-in user
router.get("/mine", auth, getMyChallenges);

// Create a new challenge (Company & Challenger only)
router.post(
   "/",
   auth,
   validate(createChallengeDTO),
   restrictTo(["company", "challenger"]),
   createChallenge
);

// Update an existing challenge (Creator only)
router.put(
   "/:id",
   auth,
   validate(updateChallengeDTO),
   restrictTo(["company", "challenger"]),
   updateChallenge
);

// Delete a challenge (Creator only)
router.delete("/:id", auth, restrictTo(["company", "challenger"]), deleteChallenge);

// ==========================
// ADMIN ROUTES
// ==========================

// Get all challenges including drafts and archived (Admin only)
router.get("/all", auth, restrictTo(["admin"]), getAllChallenges);

export default router;
