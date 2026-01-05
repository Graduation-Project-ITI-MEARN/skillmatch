import { Request, Response } from "express";
import Challenge, { IChallenge } from "../models/Challenge";
import Submission from "../models/Submission";
import { isValidCategory, areValidSkills } from "./metadataController";
import { catchError } from "../utils/catchAsync";
import { logActivity } from "../utils/activityLogger";
import APIError from "../utils/APIError";
import User from "../models/User";
import mongoose from "mongoose";

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

   const { category, skills, aiConfig } = req.body;

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
   if (skills && Array.isArray(skills) && skills.length > 0) {
      if (!areValidSkills(skills)) {
         return res.status(400).json({
            success: false,
            message:
               "One or more skills are invalid. Please select valid skills from the list.",
         });
      }
   }

   const challenge = await Challenge.create({
      ...req.body,
      creatorId: user._id,
   });

   // Validate skills if provided
   if (skills && Array.isArray(skills) && skills.length > 0) {
      if (!areValidSkills(skills)) {
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

// Define an interface for the populated creator (User/Company)
// This assumes your creator model has _id, name, type, and optionally city
interface PopulatedCreator {
   _id: mongoose.Types.ObjectId; // Make sure _id is present for populated documents
   name: string;
   type: string;
   city?: string; // City can be optional
}

// Correct way to define PopulatedChallenge:
// It takes all properties of IChallenge, but specifically overrides the type of 'creatorId'
type PopulatedChallenge = Omit<IChallenge, "creatorId"> & {
   creatorId: PopulatedCreator;
};

const getUserAcceptedChallenges = catchError(
   async (req: Request, res: Response) => {
      const { userId } = req.params;

      const submissions = await Submission.find({
         candidateId: userId,
         aiScore: { $gte: Number(process.env.MIN_AI_SCORE) || 80 },
      }).populate<{ challengeId: PopulatedChallenge }>({
         // <--- Keep this explicit type for populate
         path: "challengeId",
         populate: {
            path: "creatorId",
            select: "name type city", // Ensure 'city' is selected here if it exists on the creator model
         },
      });

      const formattedSubmissions = submissions
         .map((sub) => {
            // Type guard: Check if challengeId was successfully populated and is an object
            // `sub.challengeId instanceof mongoose.Types.ObjectId` check is crucial for unpopulated cases
            if (
               !sub.challengeId ||
               typeof sub.challengeId === "string" ||
               sub.challengeId instanceof mongoose.Types.ObjectId
            ) {
               console.warn(
                  `Skipping submission ${sub._id}: Challenge ID not populated or invalid.`
               );
               return null; // Return null, to be filtered out later
            }

            // The `populate` method's generic type parameter already ensures `sub.challengeId` is `PopulatedChallenge`
            const challenge = sub.challengeId;

            // Type guard: Check if creatorId within the challenge was successfully populated
            if (
               !challenge.creatorId ||
               typeof challenge.creatorId === "string" ||
               challenge.creatorId instanceof mongoose.Types.ObjectId
            ) {
               console.warn(
                  `Skipping submission ${sub._id} (Challenge: ${challenge._id}): Creator ID not populated or invalid.`
               );
               return null; // Return null, to be filtered out later
            }

            const creator = challenge.creatorId; // TypeScript now knows creator is PopulatedCreator

            return {
               _id: sub._id, // Submission ID (good for React keys)
               challengeId: challenge._id.toString(), // Actual Challenge ID (convert to string if it's ObjectId)
               title: challenge.title, // Challenge Name
               category: challenge.category,
               creatorName: creator.name, // Creator Name
               creatorCity: creator.city || null, // Creator City (handle cases where it might not exist)
               aiScore: sub.aiScore, // AI Score from the submission
               submissionDate: sub.createdAt, // Submission Date (from submission's createdAt)
            };
         })
         .filter(Boolean); // Filter out any 'null' entries (submissions that failed to populate)

      res.status(200).json({
         success: true,
         count: formattedSubmissions.length,
         data: formattedSubmissions,
      });
   }
);

// export { getUserAcceptedChallenges };

/**
 * @desc    Get all published challenges a candidate hasn't started yet
 * @route   GET /api/challenges/available
 * @access  Private (Candidate)
 */
const getAvailableChallenges = catchError(
   async (req: Request, res: Response) => {
      const user = req.user;

      // Ensure the user is logged in and is a candidate
      if (!user || user.type !== "candidate") {
         return res.status(403).json({
            success: false,
            message:
               "Access denied. Only candidates can view available challenges.",
         });
      }

      // 1. Find all challenge IDs that the current candidate has already submitted to
      // We use .distinct() to get an array of unique challenge IDs.
      const startedChallengeIds = await Submission.find({
         candidateId: user._id,
      }).distinct("challengeId");

      // 2. Find all published challenges that are NOT in the `startedChallengeIds` list.
      // The `$nin` operator selects documents where the field value is not in the specified array.
      const availableChallenges = await Challenge.find({
         status: "published", // Only consider challenges that are published
         _id: { $nin: startedChallengeIds }, // Exclude challenges the candidate has already started
      }).populate("creatorId", "name type city"); // Optionally populate creator details

      res.status(200).json({
         success: true,
         count: availableChallenges.length,
         data: availableChallenges,
      });
   }
);

export {
   createChallenge,
   getPublishedChallenges,
   getMyChallenges,
   getAllChallenges,
   updateChallenge,
   deleteChallenge,
   getChallengeById,
   getUserAcceptedChallenges,
   getAvailableChallenges, // <--- Don't forget to export the new function
};
