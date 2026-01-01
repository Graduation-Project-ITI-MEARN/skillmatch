import { Request, Response } from "express";
import Challenge from "../models/Challenge";
import Submission from "../models/Submission";
import { isValidCategory, areValidSkills } from "./metadataController";
import { catchError } from "../utils/catchAsync";
import { logActivity } from "../utils/activityLogger";
import APIError from "../utils/APIError";
import User from "../models/User";

/**
 * @desc    Create a new challenge
 * @route   POST /api/challenges
 * @access  Private (Company, Challenger)
 */
// controllers/challengeController.ts

/**
 * @desc    Create a new challenge
 * @route   POST /api/challenges
 * @access  Private (Company with active subscription)
 */
const createChallenge = catchError(async (req: Request, res: Response) => {
   const user = req.user;

   if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
   }

   // Companies must have active subscription
   if (user.type === "company") {
      const hasActiveSubscription =
         user.subscriptionStatus === "active" &&
         user.subscriptionExpiry &&
         user.subscriptionExpiry > new Date();

      if (!hasActiveSubscription) {
         return res.status(403).json({
            success: false,
            message: "Active subscription required to create challenges",
            code: "SUBSCRIPTION_REQUIRED",
         });
      }
   }

   const { category, tags, aiConfig } = req.body;

   // Validate category
   if (!category) {
      return res.status(400).json({
         success: false,
         message: "Category is required",
      });
   }

   if (!isValidCategory(category)) {
      return res.status(400).json({
         success: false,
         message:
            "Invalid category. Please select a valid category from the list.",
      });
   }

   // Validate skills if provided
   if (tags && Array.isArray(tags) && tags.length > 0) {
      if (!areValidSkills(tags)) {
         return res.status(400).json({
            success: false,
            message:
               "One or more skills are invalid. Please select valid skills from the list.",
         });
      }
   }

   // Validate AI configuration
   if (aiConfig?.pricingTier === "custom" && !aiConfig.selectedModel) {
      return res.status(400).json({
         success: false,
         message: "Selected model is required for custom pricing tier",
      });
   }

   const challenge = await Challenge.create({
      ...req.body,
      creatorId: user._id,
   });

   await logActivity(
      user._id,
      "challenge_created",
      `Created challenge: ${(challenge as any).title} with AI tier: ${
         aiConfig?.pricingTier || "free"
      }`,
      "success",
      (challenge as any)._id
   );

   res.status(201).json({ success: true, data: challenge });
});
/**
 * @desc    Get all published challenges (Public Feed)
 * @route   GET /api/challenges
 * @access  Public
 */
const getPublishedChallenges = catchError(
   async (req: Request, res: Response) => {
      const filter: any = { status: "published" };

      // Filter by category if provided
      if (req.query.category) {
         const categoryStr = req.query.category as string;
         if (!isValidCategory(categoryStr)) {
            return res.status(400).json({
               success: false,
               message: "Invalid category filter",
            });
         }
         filter.category = categoryStr;
      }

      // Filter by difficulty if provided
      if (req.query.difficulty) filter.difficulty = req.query.difficulty;

      const challenges = await Challenge.find(filter).populate(
         "creatorId",
         "name type city"
      );

      res.status(200).json({
         success: true,
         count: challenges.length,
         data: challenges,
      });
   }
);

/**
 * @desc    Get challenges created by the logged-in user
 * @route   GET /api/challenges/mine
 * @access  Private
 */

const getMyChallenges = catchError(async (req: Request, res: Response) => {
   const user = req.user;

   if (!user) {
      return res.status(401).json({ message: "Not authorized" });
   }

   // 1. Find all challenges created by the logged-in user
   const challenges = await Challenge.find({ creatorId: user._id }).populate(
      "creatorId",
      "name type"
   );

   if (challenges.length === 0) {
      // If no challenges are found, return an empty array immediately
      return res.status(200).json({
         success: true,
         count: 0,
         data: [],
      });
   }

   // Extract IDs of all challenges found
   const challengeIds = challenges.map((c) => c._id);

   // 2. Aggregate submission data for these challenges
   const submissionsAggregations = await Submission.aggregate([
      {
         $match: {
            challengeId: { $in: challengeIds }, // Match submissions belonging to the user's challenges
            aiScore: { $exists: true, $ne: null }, // Only consider submissions with an AI score
         },
      },
      {
         $group: {
            _id: "$challengeId", // Group results by challengeId
            submissionsCount: { $sum: 1 }, // Count total submissions for each challenge
            avgAiScore: { $avg: "$aiScore" }, // Calculate average AI score
            topScore: { $max: "$aiScore" }, // Find the maximum AI score
            // Collect unique candidate IDs for participants
            participants: { $addToSet: "$candidateId" },
         },
      },
      {
         // Lookup participant details (name, email) from the User model
         $lookup: {
            from: User.collection.name, // Gets the actual collection name for the User model (e.g., 'users')
            localField: "participants",
            foreignField: "_id",
            as: "participantDetails",
         },
      },
      {
         // Project the final structure for each challenge's aggregated data
         $project: {
            submissionsCount: 1,
            avgAiScore: { $round: ["$avgAiScore", 2] }, // Round average score to 2 decimal places
            topScore: 1,
            // Map participant details to a more concise format
            participants: {
               $map: {
                  input: "$participantDetails",
                  as: "p",
                  in: {
                     _id: "$$p._id",
                     name: "$$p.name",
                     email: "$$p.email",
                     // You can add other candidate fields here if needed
                  },
               },
            },
         },
      },
   ]);

   // Convert the aggregation results into a map for efficient lookup by challengeId
   const challengeStatsMap = new Map();
   submissionsAggregations.forEach((stat) => {
      challengeStatsMap.set(stat._id.toString(), stat);
   });

   // 3. Merge the aggregated submission data into the challenge documents
   const challengesWithStats = challenges.map((challenge) => {
      const stats = challengeStatsMap.get(challenge._id.toString());

      return {
         ...challenge.toObject(), // Convert Mongoose document to a plain JavaScript object
         submissionsCount: stats?.submissionsCount || 0,
         avgAiScore: stats?.avgAiScore || 0,
         topScore: stats?.topScore || 0,
         participants: stats?.participants || [], // Will be an array of { _id, name, email }
      };
   });

   res.status(200).json({
      success: true,
      count: challengesWithStats.length,
      data: challengesWithStats,
   });
});

/**
 * @desc    Get all challenges (Admin only) - AGGREGATION VERSION
 * @route   GET /api/challenges/all
 * @access  Private (Admin)
 */
const getAllChallenges = catchError(async (req: Request, res: Response) => {
   const challenges = await Challenge.aggregate([
      // 1. Join with Submissions
      {
         $lookup: {
            from: "submissions", // Must match MongoDB collection name (lowercase plural)
            localField: "_id",
            foreignField: "challengeId",
            as: "submissionsData",
         },
      },
      // 2. Join with Users
      {
         $lookup: {
            from: "users",
            localField: "creatorId",
            foreignField: "_id",
            as: "creatorData",
         },
      },
      // 3. Unwind Creator (Flatten array to object)
      {
         $unwind: {
            path: "$creatorData",
            preserveNullAndEmptyArrays: true,
         },
      },
      // 4. Project (Select & Calculate Fields)
      {
         $project: {
            _id: 1,
            title: 1,
            description: 1,
            difficulty: 1,
            category: 1,
            status: 1,
            type: 1,
            prizeAmount: 1,
            tags: 1,
            createdAt: 1,
            updatedAt: 1,

            // Reconstruct the creator object
            creatorId: {
               _id: "$creatorData._id",
               name: "$creatorData.name",
               email: "$creatorData.email",
               type: "$creatorData.type",
            },

            // --- CALCULATED METRICS ---
            participantsCount: { $size: "$submissionsData" },
            averageAiScore: {
               $cond: {
                  if: { $eq: [{ $size: "$submissionsData" }, 0] },
                  then: 0,
                  else: { $round: [{ $avg: "$submissionsData.aiScore" }, 0] },
               },
            },
         },
      },
      // 5. Sort by newest
      { $sort: { createdAt: -1 } },
   ]);

   res.status(200).json({
      success: true,
      count: challenges.length,
      data: challenges, // Directly return the array
   });
});

/**
 * @desc    Update a challenge with safety checks
 * @route   PUT /api/challenges/:id
 * @access  Private (Creator Only)
 */
const updateChallenge = catchError(async (req: Request, res: Response) => {
   const user = req.user;

   if (!user) {
      return res.status(401).json({ message: "Not authorized" });
   }

   const { id } = req.params;

   const challenge = await Challenge.findById(id);

   if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
   }

   // Check Ownership
   if (challenge.creatorId.toString() !== user._id.toString()) {
      return res
         .status(403)
         .json({ message: "Not authorized to update this challenge" });
   }

   // Check for active submissions
   const submissionCount = await Submission.countDocuments({
      challengeId: id,
   });

   // If submissions exist, prevent editing of core fields
   if (submissionCount > 0) {
      const lockedFields = [
         "title",
         "description",
         "difficulty",
         "category",
         "type",
      ];

      const requestedUpdates = Object.keys(req.body);

      const isTryingToEditLocked = requestedUpdates.some((field) =>
         lockedFields.includes(field)
      );

      if (isTryingToEditLocked) {
         return res.status(400).json({
            message:
               'Cannot edit core fields (title, description, etc.) because candidates have already submitted work. You can only change the status to "closed".',
         });
      }
   }

   const updatedChallenge = await Challenge.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
   });

   res.status(200).json({ success: true, data: updatedChallenge });
});

/**
 * @desc    Delete a challenge safely
 * @route   DELETE /api/challenges/:id
 * @access  Private (Creator Only)
 */
const deleteChallenge = catchError(async (req: Request, res: Response) => {
   const user = req.user;

   if (!user) {
      return res.status(401).json({ message: "Not authorized" });
   }

   const { id } = req.params;

   const challenge = await Challenge.findById(id);

   if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
   }

   // Check Ownership
   if (challenge.creatorId.toString() !== user._id.toString()) {
      return res
         .status(403)
         .json({ message: "Not authorized to delete this challenge" });
   }

   // Check for active submissions
   const submissionCount = await Submission.countDocuments({
      challengeId: id,
   });

   if (submissionCount > 0) {
      return res.status(400).json({
         message:
            'Cannot delete challenge with active submissions. Please change status to "closed" instead.',
      });
   }

   await challenge.deleteOne();

   res.status(200).json({
      success: true,
      message: "Challenge deleted successfully",
   });
});

const getChallengeById = catchError(async (req: Request, res: Response) => {
   const { id } = req.params;

   const challenge = await Challenge.findById(id);
   if (!challenge) throw new APIError(404, `Challenge with id ${id} not found`);

   res.status(200).json({ status: "success", data: challenge });
});

export {
   createChallenge,
   getPublishedChallenges,
   getMyChallenges,
   getAllChallenges,
   updateChallenge,
   deleteChallenge,
   getChallengeById,
};
