import { Request, Response } from "express";

import Submission from "../models/Submission";
import User from "../models/User";
import { calculateSkillLevel } from "../utils/skillLevel";
import { catchError } from "../utils/catchAsync";
import { logActivity } from "../utils/activityLogger";
import mongoose from "mongoose";

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
  const users = await User.find({ type: "candidate" });

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
  const users = await User.find({ type: "company" });

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
  const users = await User.find({ type: "challenger" });

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

/**
 * @desc    Get AI-calculated skills for the current user
 * @route   GET /api/users/profile/ai-skills
 * @access  Private
 */
const getAISkills = catchError(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const results = await Submission.aggregate([
    {
      $match: {
        candidateId: new mongoose.Types.ObjectId(user._id),
        status: "accepted",
      },
    },
    {
      $lookup: {
        from: "challenges", // Match the collection name exactly as in MongoDB
        localField: "challengeId",
        foreignField: "_id",
        as: "challenge",
      },
    },
    { $unwind: "$challenge" },
    {
      $group: {
        _id: "$challenge.category",
        challengeCount: { $sum: 1 },
        avgScore: { $avg: "$aiScore" },
      },
    },
    {
      $project: {
        _id: 0,
        skill: "$_id",
        challengeCount: 1,
        score: { $round: ["$avgScore", 0] },
      },
    },
  ]);

  const skills = results.map((skill) => ({
    ...skill,
    level: calculateSkillLevel(skill.score, skill.challengeCount),
  }));

  res.status(200).json({
    success: true,
    data: skills,
  });

  // Debug: log submissions to verify
  const testResults = await Submission.find({
    candidateId: user._id,
    status: "accepted",
  });
  console.log("Found submissions:", testResults);
});

export {
  getAllUsers,
  getAllCandidates,
  getAllCompanies,
  getAllChallengers,
  getUserById,
  updateUser,
  getAISkills,
};
