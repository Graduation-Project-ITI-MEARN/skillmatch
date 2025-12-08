// src/routes/statsRoutes.ts
import express from "express";
import {
   getAdminStats,
   getCompanyStats,
   getCandidateStats,
   getChallengerStats,
} from "../controllers/statsController";
import { restrictTo } from "../middlewares/restrictTo";

const statsRouter = express.Router();

// GET /api/stats/admin - Admin only
statsRouter.get("/admin", restrictTo(["admin"]), getAdminStats);

// GET /api/stats/company - Company / Challenger only
statsRouter.get(
   "/company",
   restrictTo(["company", "challenger"]),
   getCompanyStats
);

// GET /api/stats/candidate - Candidate only
statsRouter.get("/candidate", restrictTo(["candidate"]), getCandidateStats);

// GET /api/stats/challenger - Company / Challenger only
statsRouter.get(
   "/challenger",
   restrictTo(["company", "challenger"]),
   getChallengerStats
);

export default statsRouter;
