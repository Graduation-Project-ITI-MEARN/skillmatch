import express from "express";
import {
   getAllUsers,
   getAllCandidates,
   getAllCompanies,
   getAllChallengers,
   getUserById,
} from "../controllers/userController";

import auth from "../middlewares/authMiddleware";
import { restrictTo } from "../middlewares/restrictTo";

const router = express.Router();

router.get("/", auth, restrictTo(["admin"]), getAllUsers);
router.get("/candidates", auth, restrictTo(["admin"]), getAllCandidates);
router.get("/companies", auth, restrictTo(["admin"]), getAllCompanies);
router.get("/challengers", auth, restrictTo(["admin"]), getAllChallengers);
router.get("/:id", auth, restrictTo(["admin"]), getUserById);

export default router;
