import express from "express";
import { searchTalent } from "../controllers/talentController";
import { advancedResults } from "../middlewares/advancedResults";
import User from "../models/User";
import { restrictTo } from "../middlewares/restrictTo";
import auth from "../middlewares/authMiddleware";

const talentRouter = express.Router();

talentRouter.get(
   "/talent",
   auth,
   restrictTo(["company", "admin"]),
   // map minScore → totalScore
   (req, _res, next) => {
      if (req.query.minScore) {
         req.query.totalScore = { gte: req.query.minScore } as any;
         delete req.query.minScore;
      }
      next();
   },
   advancedResults(User, null, { type: "candidate" }),
   searchTalent
);

export default talentRouter;
