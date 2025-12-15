import {
  createReport,
  getModerationStats,
  getReports,
  resolveReport,
} from "../controllers/moderationController";
import {
  createReportSchema,
  resolveReportSchema,
} from "./../DTO/CreateReportDTO";

import Report from "../models/Report";
import { advancedResults } from "../middlewares/advancedResults";
import auth from "../middlewares/authMiddleware";
import express from "express";
import { restrictTo } from "../middlewares/restrictTo";
import validate from "../middlewares/validate";

const moderationRouter = express.Router();

// ==============================================================================
// PROTECTED ROUTES (Authenticated Users)
// ==============================================================================

/**
 * POST /api/moderation/report
 */
moderationRouter.post(
  "/report",
  validate(createReportSchema),
  auth,
  createReport
);

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
moderationRouter.get("/stats", auth, restrictTo(["admin"]), getModerationStats);

/**
 * PUT /api/moderation/:id/resolve
 */
moderationRouter.put(
  "/:id/resolve",
  validate(resolveReportSchema),
  auth,
  restrictTo(["admin"]),
  resolveReport
);

export default moderationRouter;
