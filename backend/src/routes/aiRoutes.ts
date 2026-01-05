// src/routes/aiRoutes.ts
import express from "express";
import {
   getAvailableModels,
   evaluateSubmission,
   getEvaluationCostEstimate,
   batchEvaluateSubmissions,
   compareModels,
   aiCoachChat,
   getRecommendations,
   getSkillAnalysis,
   getHiringInsights,
   getPublicSkillAnalysis,
} from "../controllers/aiController";
import auth from "../middlewares/authMiddleware";
import { restrictTo } from "../middlewares/restrictTo";

const aiRouter = express.Router();

// ==========================================
// Candidate Routes
// ==========================================

// Get personalized challenge recommendations
aiRouter.get(
   "/recommendations",
   auth,
   restrictTo(["candidate"]),
   getRecommendations
);

// Get skill gap analysis
aiRouter.get(
   "/skills-analysis",
   auth,
   restrictTo(["candidate"]),
   getSkillAnalysis
);

// Get public skill gap analysis
aiRouter.get(
   "/public-skills-analysis/:userId", // Define a public endpoint with a userId parameter
   getPublicSkillAnalysis // Use a new controller function for public access
);

// AI Career Coach chat
aiRouter.post("/coach/chat", auth, aiCoachChat);

// ==========================================
// Company/Recruiter Routes
// ==========================================

// Get available AI models and pricing
aiRouter.get("/models", auth, getAvailableModels);

// Estimate evaluation cost before creating challenge
aiRouter.post(
   "/estimate-cost",
   auth,
   restrictTo(["company", "admin"]),
   getEvaluationCostEstimate
);

// Batch evaluate all submissions for a challenge
aiRouter.post(
   "/batch-evaluate",
   auth,
   restrictTo(["company", "admin"]),
   batchEvaluateSubmissions
);

// ==========================================
// Evaluation Routes (Used by System)
// ==========================================

// Evaluate a single submission
// Can be triggered by candidate or company
aiRouter.post("/evaluate-submission", auth, evaluateSubmission);

// ==========================================
// Company Routes
// ==========================================

// Get hiring insights from submissions
aiRouter.get(
   "/hiring-insights",
   auth,
   restrictTo(["company", "admin"]),
   getHiringInsights
);

// ==========================================
// Admin/Testing Routes
// ==========================================

// Compare multiple AI models on same submission
aiRouter.post("/compare-models", auth, restrictTo(["admin"]), compareModels);

export default aiRouter;
