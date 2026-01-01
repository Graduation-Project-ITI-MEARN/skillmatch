import {
   createChallenge,
   getPublishedChallenges,
   getMyChallenges,
   getAllChallenges,
   updateChallenge,
   deleteChallenge,
   getChallengeById,
   getUserAcceptedChallenges,
   getAvailableChallenges,
} from "../controllers/challengeController";
import auth from "../middlewares/authMiddleware";
import express from "express";
import { requireSubscription } from "../middlewares/requirePayment";
import { restrictTo } from "../middlewares/restrictTo";
import validate from "../middlewares/validate";
import { createChallengeDTO, updateChallengeDTO } from "../DTO/challenge";
import { requireVerification } from "../middlewares/requireVerification";

const router = express.Router();

// ==========================
// PUBLIC ROUTES
// ==========================

// Get all published challenges (Feed)
router.get("/", getPublishedChallenges);

router.get("/user-accepted/:userId", getUserAcceptedChallenges);

// ==========================
// ADMIN ROUTES
// ==========================
router.get("/all", getAllChallenges);

// ==========================
// PROTECTED ROUTES (Authenticated Users)
// ==========================

router.get(
   "/available",
   auth,
   restrictTo(["candidate"]),
   getAvailableChallenges
);

// Get challenges created by the logged-in user
router.get("/mine", auth, getMyChallenges);

// Get challenge details by ID
router.get("/:id", getChallengeById);

// Create a new challenge (Company & Challenger only)
router.post(
   "/",
   auth,
   validate(createChallengeDTO),
   restrictTo(["company", "challenger"]),
   requireVerification(["company", "challenger"]),
   requireSubscription,
   createChallenge
);

// Update an existing challenge (Creator only)
router.put(
   "/:id",
   auth,
   validate(updateChallengeDTO),
   restrictTo(["company", "challenger"]),
   requireVerification(["company", "challenger"]),
   updateChallenge
);

// Delete a challenge (Creator only)
router.delete(
   "/:id",
   auth,
   restrictTo(["company", "challenger"]),
   requireVerification(["company", "challenger"]),
   deleteChallenge
);

export default router;
