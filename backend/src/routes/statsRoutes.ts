import express from "express";
import {
  getAdminStats,
  getCompanyStats,
  getCandidateStats,
  getChallengerStats,
  getLeaderboard, // <-- New Import
} from "../controllers/statsController";
import { restrictTo } from "../middlewares/restrictTo";
import auth from "../middlewares/authMiddleware";

const statsRouter = express.Router();

// GET /api/stats/admin - Admin only
statsRouter.get("/admin", auth, restrictTo(["admin"]), getAdminStats);

// GET /api/stats/company - Company only
statsRouter.get("/company", auth, restrictTo(["company"]), getCompanyStats);

// GET /api/stats/candidate - Candidate only
statsRouter.get(
  "/candidate",
  auth,
  restrictTo(["candidate"]),
  getCandidateStats
);

// GET /api/stats/challenger - Challenger OR Company
// Updated to allow 'challenger' role as per task requirements
statsRouter.get(
  "/challenger",
  auth,
  restrictTo(["company", "challenger"]),
  getChallengerStats
);

// GET /api/stats/leaderboard - Public/Authenticated
statsRouter.get("/leaderboard", auth, getLeaderboard);

export default statsRouter;
