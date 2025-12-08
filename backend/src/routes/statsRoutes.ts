// src/routes/statsRoutes.ts
import express from "express";
import {
  getAdminStats,
  getCompanyStats,
  getCandidateStats,
  getChallengerStats,
} from "../controllers/statsController";
import { restrictTo } from "../middlewares/restrictTo";


const router = express.Router();

// GET /api/stats/admin - Admin only
router.get("/admin", restrictTo(["admin"]), getAdminStats);

// GET /api/stats/company - Company / Challenger only
router.get("/company", restrictTo(["company", "challenger"]), getCompanyStats);

// GET /api/stats/candidate - Candidate only
router.get("/candidate", restrictTo(["candidate"]), getCandidateStats);

// GET /api/stats/challenger - Company / Challenger only
router.get("/challenger", restrictTo(["company", "challenger"]), getChallengerStats);

export default router;
