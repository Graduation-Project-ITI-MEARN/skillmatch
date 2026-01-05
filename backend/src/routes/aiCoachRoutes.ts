// src/routes/aiCoachRoutes.ts
import express from "express";
import {
   getCareerDashboard,
   candidateCoachChat,
   companyCoachChat,
   generateChallenge,
} from "../controllers/aiCoachController";
import auth from "../middlewares/authMiddleware";
import { restrictTo } from "../middlewares/restrictTo";

const coachRouter = express.Router();

// ==========================================
// Candidate Routes
// ==========================================

/**
 * Get Career Dashboard (No chat needed)
 * Returns: career insights, recommended challenges, learning resources
 */
coachRouter.get(
   "/dashboard",
   auth,
   restrictTo(["candidate"]),
   getCareerDashboard
);

/**
 * Chat with AI Coach (Career topics only)
 * Moderated for professional content
 */
coachRouter.post("/chat", auth, restrictTo(["candidate"]), candidateCoachChat);

// ==========================================
// Company Routes
// ==========================================

/**
 * Company Hiring Assistant Chat
 * Helps with hiring strategy, challenge ideas
 */
coachRouter.post(
   "/company-chat",
   auth,
   restrictTo(["company", "admin"]),
   companyCoachChat
);

/**
 * Auto-generate Challenge from Requirements
 * AI creates complete challenge based on job description
 */
coachRouter.post(
   "/generate-challenge",
   auth,
   restrictTo(["company", "admin"]),
   generateChallenge
);

export default coachRouter;
