import express from "express";
import auth from "../middlewares/authMiddleware";
import { restrictTo } from "../middlewares/restrictTo";
import { advancedResults } from "../middlewares/advancedResults";
import User from "../models/User";

import {
  getAllUsers,
  getAllCandidates,
  getAllCompanies,
  getAllChallengers,
  getUserById,
} from "../controllers/userController";

const router = express.Router();

router.get("/", auth, restrictTo(["admin"]), advancedResults(User), getAllUsers);

router.get("/candidates", auth, restrictTo(["admin"]), getAllCandidates);
router.get("/companies", auth, restrictTo(["admin"]), getAllCompanies);
router.get("/challengers", auth, restrictTo(["admin"]), getAllChallengers);

router.get("/:id", auth, restrictTo(["admin"]), getUserById);

export default router;
