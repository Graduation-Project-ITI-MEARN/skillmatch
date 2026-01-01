import { NextFunction, Request, Response } from "express";
import Submission from "../models/Submission";
import User, { IUser } from "../models/User";
import { calculateSkillLevel } from "../utils/skillLevel";
import { catchError } from "../utils/catchAsync";
import { logActivity } from "../utils/activityLogger";
import mongoose from "mongoose";
import APIError from "../utils/APIError";
import { CATEGORIES } from "./metadataController";
import { sendNotification } from "../utils/notification";

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
 * @access  Private (Admin or Self)
 */
const getUserById = catchError(
   async (req: Request, res: Response, next: NextFunction) => {
      const requestedId = req.params.id;
      // req.user is populated by the auth middleware
      const authenticatedUser = req.user; // Contains id and role

      if (
         authenticatedUser &&
         authenticatedUser._id.toString() === requestedId
      ) {
         // User is requesting their own profile
         const user = await User.findById(requestedId).select("-password"); // Exclude sensitive info
         if (!user) {
            return next(new APIError(404, "User not found"));
         }

         res.status(200).json({
            success: true,
            data: user,
         });
      }

      const user = await User.findById(requestedId).select("-password"); // Exclude sensitive info
      if (!user) {
         return next(new APIError(404, "User not found"));
      }

      res.status(200).json({
         success: true,
         data: user,
      });
   }
);

/**
 * @desc    get user profile information
 * @route   GET /api/users/profile
 * @access  Private (Auth required)
 */

const getProfile = catchError(async (req: Request, res: Response) => {
   // Ensure req.user is populated by your auth middleware
   if (!req.user) {
      return res.status(401).json({
         success: false,
         message: "Unauthorized",
      });
   }

   const user = await User.findById(req.user._id).select("-password");

   res.status(200).json({
      success: true,
      data: user,
   });
});

/**
 * @desc    Update user profile information
 * @route   PATCH /api/users/profile
 * @access  Private (Auth required)
 */
const updateProfile = catchError(async (req: Request, res: Response) => {
   // Ensure req.user is populated by your auth middleware
   if (!req.user) {
      return res.status(401).json({
         success: false,
         message: "Unauthorized",
      });
   }

   const userId = req.user._id;
   const {
      name,
      city,
      bio,
      github,
      linkedin,
      otherLinks, // Array of { name, url }
      categoriesOfInterest, // Array of strings
      website, // For companies
   } = req.body;

   const updateFields: Partial<IUser> = { name, city, bio };

   if (req.user.type === "candidate" || req.user.type === "challenger") {
      if (github !== undefined) updateFields.github = github;
      if (linkedin !== undefined) updateFields.linkedin = linkedin;
      if (otherLinks !== undefined) updateFields.otherLinks = otherLinks;
      // Validate categoriesOfInterest
      if (categoriesOfInterest !== undefined) {
         if (
            !Array.isArray(categoriesOfInterest) ||
            !categoriesOfInterest.every((cat) => CATEGORIES.includes(cat))
         ) {
            return res.status(400).json({
               success: false,
               message: "Invalid categories of interest",
            });
         }
         updateFields.categoriesOfInterest = categoriesOfInterest;
      }
   } else if (req.user.type === "company") {
      if (website !== undefined) updateFields.website = website;
   }

   // Filter out undefined values to prevent overwriting with null/undefined
   const filteredUpdateFields = Object.fromEntries(
      Object.entries(updateFields).filter(([, value]) => value !== undefined)
   );

   const updatedUser = await User.findByIdAndUpdate(
      userId,
      filteredUpdateFields,
      {
         new: true, // Return the updated document
         runValidators: true, // Run schema validators on update
      }
   ).select("-password"); // Exclude password from the response

   if (!updatedUser) {
      return res
         .status(404)
         .json({ success: false, message: "User not found" });
   }

   // Log Activity
   await logActivity(
      userId,
      "user_profile_update",
      `User ${updatedUser.name} updated their profile information.`,
      "success",
      userId
   );

   res.status(200).json({
      success: true,
      data: updatedUser,
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

const updateVerificationStatus = catchError(
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

      await sendNotification(
         userToUpdate._id,
         "You've been verified!",
         `Your verification status has been updated to ${status}.`,
         "success"
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
   updateVerificationStatus,
   updateProfile,
   getProfile,
};
