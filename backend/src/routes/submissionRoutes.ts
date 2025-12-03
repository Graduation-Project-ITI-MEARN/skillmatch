import express from "express";
import {
   createSubmission,
   getSubmissionsByChallenge,
   getSubmissionById,
   getAllSubmissions,
} from "../controllers/submissionController";
import { restrictTo } from "../middlewares/restrictTo";
import auth from "../middlewares/authMiddleware";

const router = express.Router();

/**
 * @route   GET /api/submissions
 * @desc    Get all submissions
 * @access  Protected - Admin only
 */

router.get("/", auth, restrictTo(["admin"]), getAllSubmissions);

/**
 * @route   POST /api/submissions
 * @desc    Create a new submission
 * @access  Protected - Candidate only
 */
router.post("/", auth, restrictTo(["candidate"]), createSubmission);

/**
 * @route   GET /api/submissions/challenge/:id
 * @desc    Get all submissions for a specific challenge
 * @access  Protected - Company/Challenger/Admin
 */
router.get(
   "/challenge/:id",
   auth,
   restrictTo(["company", "challenger", "admin"]),
   getSubmissionsByChallenge
);

/**
 * @route   GET /api/submissions/:id
 * @desc    Get a single submission by ID
 * @access  Protected
 */
router.get("/:id", auth, getSubmissionById);

export default router;
