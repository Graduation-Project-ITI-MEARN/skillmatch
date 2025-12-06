import express from "express";
import auth from "../middlewares/authMiddleware";
import { restrictTo } from "../middlewares/restrictTo";
import { advancedResults } from "../middlewares/advancedResults";
import Submission from "../models/Submission";

import {
  createSubmission,
  getSubmissionsByChallenge,
  getSubmissionById,
  getAllSubmissions,
} from "../controllers/submissionController";

const router = express.Router();

// --- ADMIN ALL submissions ---
router.get(
  "/",
  auth,
  restrictTo(["admin"]),
  advancedResults(Submission),
  getAllSubmissions
);

// --- USER create submission ---
router.post("/", auth, restrictTo(["candidate"]), createSubmission);

// --- COMPANY/CHALLENGER submissions for a specific challenge ---
router.get(
  "/challenge/:id",
  auth,
  restrictTo(["company", "challenger", "admin"]),
  (req, res, next) =>
    advancedResults(
      Submission,
      null,
      { challengeId: req.params.id } // fixed filter
    )(req, res, next),
  getSubmissionsByChallenge
);

// --- Get single submission ---
router.get("/:id", auth, getSubmissionById);

export default router;
