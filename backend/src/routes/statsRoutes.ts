// src/routes/statsRoutes.ts
import express from "express";
import {
   getAdminStats,
   getCompanyStats,
   getCandidateStats,
   getChallengerStats,
   getUserDistribution,
   getDailyStats,
   getTopChallenges,
} from "../controllers/statsController";
import { restrictTo } from "../middlewares/restrictTo";
import auth from "../middlewares/authMiddleware";

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

export default statsRouter;
