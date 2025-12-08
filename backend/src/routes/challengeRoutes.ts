// C:\iti\skillmatch\backend\src\routes\challengeRoutes.ts

import express from "express";
import {
    createChallenge,
    getPublishedChallenges, // تم الاستيراد لحل ReferenceError
    getMyChallenges, // تم الاستيراد لحل ReferenceError
    getAllChallenges, // تم الاستيراد لحل ReferenceError
} from "../controllers/challengeController"; 
import auth from "../middlewares/authMiddleware";
import { restrictTo } from "../middlewares/restrictTo"; // نفترض أن هذا هو الاستيراد الصحيح

const router = express.Router();

// Public Route: Anyone can see published challenges
// المسار: GET /api/challenges
router.get("/", getPublishedChallenges);

// Protected Route: Only 'company' and 'challenger' can create.
// المسار: POST /api/challenges
router.post("/", auth, restrictTo(["company", "challenger"]), createChallenge);

// Protected Route: Get challenges created by the current user.
// المسار: GET /api/challenges/mine
router.get("/mine", auth, getMyChallenges);

// Protected Route: Only admin can see all challenges (including drafts/private).
// المسار: GET /api/challenges/all
router.get("/all", auth, restrictTo(["admin"]), getAllChallenges); // تم تعديله إلى مصفوفة ["admin"]

export default router;