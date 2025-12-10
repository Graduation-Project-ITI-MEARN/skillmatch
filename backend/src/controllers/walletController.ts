import { Request, Response } from "express";

import Transaction from "../models/Transaction";
import { catchError } from "../utils/catchAsync";

const getWalletDetails = catchError(async (req: Request, res: Response) => {
  if (!req.user || !req.user._id) {
    return res.status(400).json({
      success: false,
      message: "User not identified. You must be logged in.",
    });
  }

  const userId = req.user._id;

  const transactions = await Transaction.find({ user: userId });

  let totalDeposited = 0;
  let totalSpent = 0;
  let totalEarned = 0;
  let inEscrow = 0;

  transactions.forEach((tx) => {
    if (tx.type === "deposit" && tx.status === "completed") {
      totalDeposited += tx.amount;
    }
    if (tx.type === "payout" && tx.status === "completed") {
      totalSpent += tx.amount;
    }
    if (tx.type === "earn" && tx.status === "completed") {
      totalEarned += tx.amount;
    }
    if (tx.type === "escrow_hold" && tx.status === "pending") {
      inEscrow += tx.amount;
    }
  });

  const currentBalance = totalDeposited + totalEarned - totalSpent - inEscrow;

  res.status(200).json({
    success: true,
    data: {
      currentBalance,
      totalDeposited,
      totalSpent,
      totalEarned,
      inEscrow,
    },
  });
});

const getTransactions = catchError(async (req: Request, res: Response) => {
  res.status(200).json(res.advancedResults);
});

export { getWalletDetails, getTransactions };
