import express from "express";
import {
   getRecommendations,
   getSkillAnalysis,
} from "../controllers/aiController";
import { restrictTo } from "../middlewares/restrictTo";
import auth from "../middlewares/authMiddleware";

const aiRouter = express.Router();

// GET /ai/recommendations (Candidate).
aiRouter.get(
   "/recommendations",
   auth,
   restrictTo(["candidate"]),
   getRecommendations
);

// GET /ai/skills-analysis (Candidate).
aiRouter.get(
   "/skills-analysis",
   auth,
   restrictTo(["candidate"]),
   getSkillAnalysis
);

export default aiRouter;
