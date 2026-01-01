import {
   getAISkills,
   getAllCandidates,
   getAllChallengers,
   getAllCompanies,
   getAllUsers,
   getProfile,
   getUserById,
   updateProfile,
   updateVerificationStatus,
   verifyUser, // Imported the new controller
} from "../controllers/userController";

import User from "../models/User";
import { advancedResults } from "../middlewares/advancedResults";
import auth from "../middlewares/authMiddleware";
import express from "express";
import { restrictTo } from "../middlewares/restrictTo";

const router = express.Router();

router.get(
   "/",
   auth,
   restrictTo(["admin"]),
   advancedResults(User),
   getAllUsers
);

router.get("/candidates", auth, restrictTo(["admin"]), getAllCandidates);
router.get("/companies", auth, restrictTo(["admin"]), getAllCompanies);
router.get("/challengers", auth, restrictTo(["admin"]), getAllChallengers);
router.get("/profile/ai-skills", getAISkills);

// New Verification Route
router.post("/verify", auth, verifyUser);

router.get("/profile", auth, getProfile);
router.get("/profile/ai-skills", getAISkills);

router.patch("/profile", auth, updateProfile);

router.patch("/:userId/subscription", auth, async (req, res) => {
   const { subscriptionStatus, subscriptionExpiry, subscriptionPlan } =
      req.body;

   const user = await User.findByIdAndUpdate(
      req.params.userId,
      {
         subscriptionStatus,
         subscriptionExpiry: new Date(subscriptionExpiry),
         subscriptionPlan,
      },
      { new: true }
   );

   res.json({ success: true, data: user });
});

router.put(
   "/:id/verify",
   auth,
   restrictTo(["admin"]),
   updateVerificationStatus
);

router.get("/:id", getUserById);

export default router;
