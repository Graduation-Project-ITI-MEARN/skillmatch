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
   if (req.user) {
      await logActivity(
         req.user._id,
         "user_update",
         `Updated profile details for user: ${updatedUser?.name}`,
         "success",
         updatedUser?._id
      );
   }

   res.status(200).json({
      success: true,
      data: updatedUser,
   });
});

/**
 * @desc    Submit verification request
 * @route   POST /api/users/verify
 * @access  Private
 */
const verifyUser = catchError(async (req: Request, res: Response) => {
   console.log("--- Inside verifyUser handler ---");
   console.log("req.body:", req.body); // Log the entire req.body
   console.log("req.headers:", req.headers); // Log headers to check Content-Type

   if (!req.user) {
      return res.status(401).json({
         success: false,
         message: "Unauthorized",
      });
   }

   const { nationalId, documentUrl } = req.body;

   if (!nationalId || !documentUrl) {
      console.error(
         "Validation failed: nationalId or documentUrl missing in req.body"
      );
      return res.status(400).json({
         success: false,
         message: "National ID and document URL are required",
      });
   }

   const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
         nationalId,
         verificationDocument: documentUrl,
         verificationStatus: "pending",
      },
      { new: true, runValidators: true }
   );

   // Log Activity
   await logActivity(
      req.user._id,
      "user_verification_submit",
      `User submitted identity verification documents`,
      "success",
      req.user._id
   );

   res.status(200).json({
      success: true,
      data: updatedUser,
   });
});

/**
 * @desc    Update verification status
 * @route   POST /api/users/:id/verify
 * @access  Private
 */

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
            from: "challenges",
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
});

export {
   getAllUsers,
   getAllCandidates,
   getAllCompanies,
   getAllChallengers,
   getUserById,
   updateUser,
   getAISkills,
   verifyUser,
};
