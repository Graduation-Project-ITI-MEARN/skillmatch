import {
   createSubmission,
   getAllSubmissions,
   getMySubmissions,
   getSubmissionById,
   getSubmissionsByChallenge,
   startChallenge,
   updateSubmissionStatus,
} from "../controllers/submissionController";

import Submission from "../models/Submission";
import { advancedResults } from "../middlewares/advancedResults";
import auth from "../middlewares/authMiddleware";
import { createSubmissionDTO } from "../DTO/submission";
import express from "express";
import { restrictTo } from "../middlewares/restrictTo";
import validate from "../middlewares/validate";
import { requireVerification } from "../middlewares/requireVerification";

const router = express.Router();

// --- ADMIN ALL submissions ---
router.get(
   "/",
   auth,
   restrictTo(["admin"]),
   advancedResults(Submission),
   getAllSubmissions
);

// --- CANDIDATE submissions ---
router.get(
   "/mine",
   auth,
   restrictTo(["candidate"]),
   advancedResults(Submission),
   getMySubmissions
);

// --- USER start challenge ---
router.post(
   "/start",
   auth,
   restrictTo(["candidate"]),
   requireVerification(["candidate"]),
   startChallenge
);

// --- USER create submission ---
router.post(
   "/",
   auth,
   validate(createSubmissionDTO),
   restrictTo(["candidate"]),
   requireVerification(["candidate"]),
   createSubmission
);

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

router.put(
   "/:id/status",
   auth,
   restrictTo(["admin"]),
   requireVerification(["candidate"]),
   updateSubmissionStatus
);

export default router;
