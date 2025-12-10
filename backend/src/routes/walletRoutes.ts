import {
  getTransactions,
  getWalletDetails,
} from "../controllers/walletController";

import Transaction from "../models/Transaction";
import { advancedResults } from "../middlewares/advancedResults";
import auth from "../middlewares/authMiddleware";
import express from "express";

const walletRouter = express.Router();

walletRouter.get("/details", auth, getWalletDetails);

walletRouter.get(
  "/transactions",
  auth,
  (req: any, res, next) => {
    if (req.user && req.user._id) {
      return advancedResults(Transaction, null, { user: req.user._id })(
        req,
        res,
        next
      );
    }

    // Fallback: return all transactions if no user info
    return advancedResults(Transaction)(req, res, next);
  },
  getTransactions
);

export default walletRouter;
