import express from "express";
import {
   createChallenge,
   getAllChallenges,
   getMyChallenges,
   getPublishedChallenges,
} from "../controllers/challengeController";
import auth from "../middlewares/authMiddleware";
import { restrictTo } from "../middlewares/restrictTo";

const router = express.Router();

// Public Route: Anyone can see published challenges
router.get("/", getPublishedChallenges);

// Protected Route: Only 'company' and 'challenger' can create.
router.post("/", auth, restrictTo(["company", "challenger"]), createChallenge);

router.get("/mine", auth, getMyChallenges);

router.get("/all", auth, restrictTo(["admin"]), getAllChallenges);

export default router;
