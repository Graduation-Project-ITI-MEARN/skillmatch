import {
  aiCoachChat,
  aiVideoEvaluation,
  getRecommendations,
  getSkillAnalysis,
} from "../controllers/aiController";

import auth from "../middlewares/authMiddleware";
import express from "express";
import { restrictTo } from "../middlewares/restrictTo";

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

aiRouter.post("/coach/chat", auth, aiCoachChat);
aiRouter.post("/evaluate", auth, aiVideoEvaluation);

export default aiRouter;
