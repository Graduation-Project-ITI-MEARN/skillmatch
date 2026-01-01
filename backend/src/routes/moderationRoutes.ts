import {
<<<<<<< HEAD
   createReport,
   getModerationStats,
   getReports,
   resolveReport,
} from "../controllers/moderationController";
import {
   createReportSchema,
   resolveReportSchema,
=======
  createReport,
  getModerationStats,
  getReports,
  resolveReport,
} from "../controllers/moderationController";
import {
  createReportSchema,
  resolveReportSchema,
>>>>>>> 8d2630a (chore: added dtos for moderation/payment, validated routes, and updated postman)
} from "./../DTO/CreateReportDTO";

import Report from "../models/Report";
import { advancedResults } from "../middlewares/advancedResults";
import auth from "../middlewares/authMiddleware";
import express from "express";
import { restrictTo } from "../middlewares/restrictTo";
import validate from "../middlewares/validate";
<<<<<<< HEAD
import "../models/User";
import "../models/Challenge";
import "../models/Submission";
=======
>>>>>>> 8d2630a (chore: added dtos for moderation/payment, validated routes, and updated postman)

const moderationRouter = express.Router();

// ==============================================================================
// PROTECTED ROUTES (Authenticated Users)
// ==============================================================================

/**
 * POST /api/moderation/report
 */
moderationRouter.post(
<<<<<<< HEAD
   "/report",
   validate(createReportSchema),
   auth,
   createReport
=======
  "/report",
  validate(createReportSchema),
  auth,
  createReport
>>>>>>> 8d2630a (chore: added dtos for moderation/payment, validated routes, and updated postman)
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
<<<<<<< HEAD
   "/:id/resolve",
   validate(resolveReportSchema),
   auth,
   restrictTo(["admin"]),
   resolveReport
=======
  "/:id/resolve",
  validate(resolveReportSchema),
  auth,
  restrictTo(["admin"]),
  resolveReport
>>>>>>> 8d2630a (chore: added dtos for moderation/payment, validated routes, and updated postman)
);

export default moderationRouter;
