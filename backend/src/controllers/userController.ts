import { NextFunction, Request, Response } from "express";

import Submission from "../models/Submission";
import User from "../models/User";
import { calculateSkillLevel } from "../utils/skillLevel";
import { catchError } from "../utils/catchAsync";
import { logActivity } from "../utils/activityLogger";
import mongoose from "mongoose";
import APIError from "../utils/APIError";

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
 * @desc    Submit verification documents
 * @route   POST /api/users/verify
 * @access  Private (Authenticated User)
 */
const verifyUser = catchError(
   async (req: Request, res: Response, next: NextFunction) => {
      // req.user is already typed as IUser due to your global.d.ts
      // However, it might only contain _id, role, type from the JWT payload.
      // To access other fields like nationalId or taxIdCard, we need to fetch the full user.
      if (!req.user || !req.user._id) {
         return next(new APIError(401, "Not authorized"));
      }

      const { idNumber, documentUrls } = req.body;

      if (
         !idNumber ||
         !documentUrls ||
         !Array.isArray(documentUrls) ||
         documentUrls.length === 0
      ) {
         return next(
            new APIError(
               400,
               "ID Number and at least one document URL are required"
            )
         );
      }

      // --- FETCH THE FULL USER OBJECT FROM THE DATABASE ---
      const authenticatedUser = await User.findById(req.user._id);

      if (!authenticatedUser) {
         return next(new APIError(404, "Authenticated user not found."));
      }

      const updateFields: any = {
         verificationDocuments: documentUrls,
         verificationStatus: "pending",
      };

      // Conditional logic for nationalId vs. taxIdCard based on the FULL user object
      if (authenticatedUser.type === "company") {
         updateFields.taxIdCard = idNumber;
         // If the user was previously a candidate/challenger and now is a company, clear nationalId
         if (authenticatedUser.nationalId) {
            updateFields.nationalId = undefined; // Set to undefined to clear from DB
         }
      } else if (
         authenticatedUser.type === "candidate" ||
         authenticatedUser.type === "challenger"
      ) {
         updateFields.nationalId = idNumber;
         // If the user was previously a company and now is candidate/challenger, clear taxIdCard
         if (authenticatedUser.taxIdCard) {
            updateFields.taxIdCard = undefined; // Set to undefined to clear from DB
         }
      } else {
         // If user.type is not defined or is unexpected, we cannot proceed with specific ID
         return next(
            new APIError(
               400,
               "User type is required and must be 'candidate', 'challenger', or 'company' for verification submission."
            )
         );
      }

      const updatedUser = await User.findByIdAndUpdate(
         authenticatedUser._id, // Use the ID from the fetched user
         updateFields,
         { new: true, runValidators: true }
      );

      if (!updatedUser) {
         // This case should ideally not be hit if authenticatedUser was found
         return next(new APIError(404, "User not found during update."));
      }

      // Log Activity
      await logActivity(
         authenticatedUser._id, // Use ID from fetched user
         "user_verification_submit",
         `User submitted identity verification documents`,
         "success",
         authenticatedUser._id
      );

      res.status(200).json({
         success: true,
         data: updatedUser,
      });
   }
);

// Add this to src/controllers/userController.ts

/**
 * @desc    Admin action to update a user's verification status
 * @route   PATCH /api/users/:id/verify-status
 * @access  Private (Admin only)
 */
export const updateVerificationStatus = catchError(
   async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user || req.user.role !== "admin") {
         return next(
            new APIError(403, "Not authorized to perform this action")
         );
      }

      const { id } = req.params;
      const { status } = req.body; // status: 'verified' | 'rejected'

      if (!status || !["verified", "rejected"].includes(status)) {
         return next(
            new APIError(400, "Invalid verification status provided.")
         );
      }

      const userToUpdate = await User.findById(id);

      if (!userToUpdate) {
         return next(new APIError(404, "User not found."));
      }

      userToUpdate.verificationStatus = status;
      userToUpdate.isVerified = status === "verified"; // Set isVerified based on status

      await userToUpdate.save();

      // TODO: Send notification to the user (e.g., via email, in-app notification, socket.io)
      await logActivity(
         req.user._id, // Admin's ID
         "user_verification_status_update",
         `User ${userToUpdate._id}'s verification status changed to '${status}' by admin.`,
         "success",
         userToUpdate._id // Target user's ID
      );

      res.status(200).json({
         success: true,
         message: `User ${
            userToUpdate.name || userToUpdate.email
         } verification status updated to ${status}.`,
         data: userToUpdate,
      });
   }
);

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
