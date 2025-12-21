import {
   getAdminStats,
   getCandidateStats,
   getChallengerStats,
   getCompanyStats,
   getDailyStats,
   getHiringAnalytics,
   getJobPerformance,
   getPlatformAnalytics,
   getTopChallenges,
   getUserDistribution,
} from "../controllers/statsController";

import auth from "../middlewares/authMiddleware";
import express from "express";
import { restrictTo } from "../middlewares/restrictTo";

const statsRouter = express.Router();

// GET /api/stats/admin - Admin only
statsRouter.get("/admin", auth, restrictTo(["admin"]), getAdminStats);

// GET /api/stats/company - Company / Challenger only
statsRouter.get("/company", auth, restrictTo(["company"]), getCompanyStats);

// GET /api/stats/candidate - Candidate only
statsRouter.get(
   "/candidate",
   auth,
   restrictTo(["candidate"]),
   getCandidateStats
);

// GET /api/stats/challenger - Company / Challenger only
statsRouter.get(
   "/challenger",
   auth,
   restrictTo(["company"]),
   getChallengerStats
);

statsRouter.get(
   "/distribution",
   auth,
   restrictTo(["admin"]),
   getUserDistribution
);
statsRouter.get("/daily", auth, restrictTo(["admin"]), getDailyStats);

statsRouter.get(
   "/top-challenges",
   auth,
   restrictTo(["admin"]),
   getTopChallenges
);

statsRouter.get(
   "/hiring-analytics",
   auth,
   restrictTo(["company", "challenger"]),
   getHiringAnalytics
);

statsRouter.get(
   "/platform-analytics",
   auth,
   restrictTo(["admin"]),
   getPlatformAnalytics
);

statsRouter.get(
   "/job-performance",
   auth,
   restrictTo(["company", "challenger"]),
   getJobPerformance
);

export default statsRouter;
