import { Request, Response } from "express";
import User from "../models/User";
import { catchError } from "../utils/catchAsync";
import { logActivity } from "../utils/activityLogger";

/**
 * @desc    Get all users (Advanced Results)
 * @route   GET /api/users
 * @access  Private (Admin)
 */
const getAllUsers = catchError(async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: (res as any).advancedResults,
  });
});

/**
 * @desc    Get all candidates
 * @route   GET /api/users/candidates
 * @access  Private (Admin/Company)
 */
const getAllCandidates = catchError(async (req: Request, res: Response) => {
  const users = await User.find({ role: "candidate" });

  res.status(200).json({
    success: true,
    data: users,
  });
});

/**
 * @desc    Get all companies
 * @route   GET /api/users/companies
 * @access  Private
 */
const getAllCompanies = catchError(async (req: Request, res: Response) => {
  const users = await User.find({ role: "company" });

  res.status(200).json({
    success: true,
    data: users,
  });
});

/**
 * @desc    Get all challengers
 * @route   GET /api/users/challengers
 * @access  Private
 */
const getAllChallengers = catchError(async (req: Request, res: Response) => {
  const users = await User.find({ role: "challenger" });

  res.status(200).json({
    success: true,
    data: users,
  });
});

/**
 * @desc    Get single user by ID
 * @route   GET /api/users/:id
 * @access  Private
 */
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

/**
 * @desc    Update user details
 * @route   PUT /api/users/:id
 * @access  Private
 */
const updateUser = catchError(async (req: Request, res: Response) => {
  const userToUpdate = await User.findById(req.params.id);

  if (!userToUpdate) {
    return res.status(404).json({ message: "User not found" });
  }

  // Prevent changing role via this endpoint for security
  if (req.body.role) {
    delete req.body.role;
  }

  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  // ✅ Log Activity: User updated profile
  // FIX: Added check to ensure req.user exists before logging
  if (req.user) {
    await logActivity(
      req.user._id,
      "user_update",
      `Updated profile details for user: ${updatedUser?.name}`,
      updatedUser?._id
    );
  }

  res.status(200).json({
    success: true,
    data: updatedUser,
  });
});

export {
  getAllUsers,
  getAllCandidates,
  getAllCompanies,
  getAllChallengers,
  getUserById,
  updateUser,
};
