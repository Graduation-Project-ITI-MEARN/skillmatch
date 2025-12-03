import express from "express";
import {
  createSubmission,
  getSubmissionsByChallenge,
  getSubmissionById,
  updateAIScore,
} from "../controllers/submissionController";
import auth, { restrictTo } from "../middlewares/authMiddleware";

const router = express.Router();

/**
 * @route   POST /api/submissions
 * @desc    Create a new submission
 * @access  Protected - Candidate only
 */
router.post("/", auth, restrictTo("candidate"), createSubmission);

/**
 * @route   GET /api/submissions/challenge/:id
 * @desc    Get all submissions for a specific challenge
 * @access  Protected - Company/Challenger/Admin
 */
router.get(
  "/challenge/:id",
  auth,
  restrictTo("company", "challenger", "admin"),
  getSubmissionsByChallenge
);

/**
 * @route   GET /api/submissions/:id
 * @desc    Get a single submission by ID
 * @access  Protected
 */
router.get("/:id", auth, getSubmissionById);

/**
 * @route   PATCH /api/submissions/:id/score
 * @desc    Update AI score for a submission
 * @access  Protected - Admin only
 */
router.patch("/:id/score", auth, restrictTo("admin"), updateAIScore);

export default router;
