import { Request, Response } from "express";

import User from "../models/User";
import { catchError } from "../utils/catchAsync";

const getAllUsers = catchError(async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: res.advancedResults,
  });
});

const getAllCandidates = catchError(async (req: Request, res: Response) => {
  const users = await User.find({ role: "candidate" });

  res.status(200).json({
    success: true,
    data: users,
  });
});

const getAllCompanies = catchError(async (req: Request, res: Response) => {
  const users = await User.find({ role: "company" });

  res.status(200).json({
    success: true,
    data: users,
  });
});

const getAllChallengers = catchError(async (req: Request, res: Response) => {
  const users = await User.find({ role: "challenger" });

  res.status(200).json({
    success: true,
    data: users,
  });
});

const getUserById = catchError(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

export {
  getAllUsers,
  getAllCandidates,
  getAllCompanies,
  getAllChallengers,
  getUserById,
};
