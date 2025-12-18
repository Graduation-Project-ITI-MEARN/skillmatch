import express from "express";
import { getGlobalLeaderboard } from "../controllers/leaderboardController";
import { advancedResults } from "../middlewares/advancedResults";
import User from "../models/User";

const leaderboardRouter = express.Router();

leaderboardRouter.get(
  "/",
  (req, _res, next) => {
    req.query.sort = "-totalScore";
    req.query.limit = "10";
    next();
  },
  advancedResults(User, null, { type: "candidate" }),
  getGlobalLeaderboard
);

export default leaderboardRouter;
