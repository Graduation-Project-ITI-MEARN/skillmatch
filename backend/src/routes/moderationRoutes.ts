import express from "express";
import {
  createReport,
  getReports,
  resolveReport,
  getModerationStats,
} from "../controllers/moderationController";
import auth from "../middlewares/authMiddleware";
import { restrictTo } from "../middlewares/restrictTo";

import Report from "../models/Report";
import { advancedResults } from "../middlewares/advancedResults";

const moderationRouter = express.Router();

// ==============================================================================
// PROTECTED ROUTES (Authenticated Users)
// ==============================================================================

/**
 * POST /api/moderation/report
 */
moderationRouter.post("/report", auth, createReport);

// ==============================================================================
// ADMIN ROUTES
// ==============================================================================

/**
 * GET /api/moderation
 */
moderationRouter.get(
  "/",
  auth,
  restrictTo(["admin"]),
  advancedResults(Report, [
    { path: "reporterId", select: "name email type" },
    { path: "targetId" },
  ]),
  getReports
);

/**
 * GET /api/moderation/stats
 */
moderationRouter.get(
  "/stats",
  auth,
  restrictTo(["admin"]),
  getModerationStats
);

/**
 * PUT /api/moderation/:id/resolve
 */
moderationRouter.put("/:id/resolve", auth, restrictTo(["admin"]), resolveReport);

export default moderationRouter;