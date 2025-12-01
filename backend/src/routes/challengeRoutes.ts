import express from "express";
import {
  createChallenge,
  getChallenges,
} from "../controllers/challengeController";
import auth, { restrictTo } from "../middlewares/authMiddleware";

const router = express.Router();

// Public Route: Anyone can see published challenges
router.get("/", getChallenges);

// Protected Route: Only 'company' and 'challenger' can create.
router.post("/", auth, restrictTo("company", "challenger"), createChallenge);

export default router;
