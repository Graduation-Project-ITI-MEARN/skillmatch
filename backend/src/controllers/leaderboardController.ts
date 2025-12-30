import { Request, Response } from "express";
import Submission, { ISubmission } from "../models/Submission"; // Import ISubmission
import User, { IUser } from "../models/User"; // Import IUser
import { IChallenge } from "../models/Challenge"; // Import IChallenge
import { catchError } from "../utils/catchAsync"; // Assuming you have this wrapper
import { CATEGORIES } from "./metadataController";

// Helper function to check if a user's profile is considered "complete"
// This logic should match what you expect for leaderboard eligibility
const isProfileComplete = (user: IUser): boolean => {
   // Basic requirements for all user types on leaderboard
   if (!user.city || !user.bio) {
      return false;
   }

   // Specific requirements based on user type
   if (user.type === "candidate" || user.type === "challenger") {
      // Candidates/Challengers need at least one category of interest
      return (
         (user.categoriesOfInterest && user.categoriesOfInterest.length > 0) ||
         false
      );
   } else if (user.type === "company") {
      // Companies need a website
      return !!user.website;
   }
   // Default to false for users with undefined types or types not meant for leaderboard (e.g., admin)
   return false;
};

// Main Leaderboard Controller
export const getGlobalLeaderboard = catchError(
   async (req: Request, res: Response) => {
      const { category } = req.query;

      // --- Common Aggregation Stages for Filtering and User Details ---
      // These stages will be used for both 'all' and specific category leaderboards
      const commonStages = [
         {
            // Lookup user details from the 'users' collection
            $lookup: {
               from: "users", // The name of the users collection in MongoDB
               localField: "_id", // Refers to candidateId after the $group stage
               foreignField: "_id",
               as: "userDetails",
            },
         },
         { $unwind: "$userDetails" }, // Deconstructs the userDetails array

         // Match stage to filter out users with incomplete profiles
         {
            $match: {
               $expr: {
                  $and: [
                     { $ne: ["$userDetails.city", null] }, // Check if city exists
                     { $ne: ["$userDetails.bio", null] }, // Check if bio exists
                     // Conditional check for candidates/challengers
                     {
                        $cond: {
                           if: {
                              $or: [
                                 { $eq: ["$userDetails.type", "candidate"] },
                                 { $eq: ["$userDetails.type", "challenger"] },
                              ],
                           },
                           then: {
                              $gt: [
                                 {
                                    $size: {
                                       $ifNull: [
                                          "$userDetails.categoriesOfInterest",
                                          [],
                                       ],
                                    },
                                 },
                                 0,
                              ],
                           }, // Candidates need categories
                           else: true, // Companies check handled below, default true if not candidate/challenger
                        },
                     },
                     // Conditional check for companies
                     {
                        $cond: {
                           if: { $eq: ["$userDetails.type", "company"] },
                           then: { $ne: ["$userDetails.website", null] }, // Companies need website
                           else: true, // Candidates check handled above, default true if not company
                        },
                     },
                  ],
               },
            },
         },
         // Project only the necessary fields for the leaderboard display
         {
            $project: {
               _id: 0,
               name: "$userDetails.name",
               score: "$totalScore",
               challengesCompleted: "$count",
               type: "$userDetails.type", // Include type for potential future display/filtering on frontend
               // Add other profile fields if you want them visible on the leaderboard
               // city: "$userDetails.city",
               // bio: "$userDetails.bio",
               // github: "$userDetails.github",
               // linkedin: "$userDetails.linkedin",
               // website: "$userDetails.website",
            },
         },
      ];

      if (!category || category === "all" || category === "All") {
         // --- Leaderboard for ALL categories ---
         const allCategoryLeaderboard = await Submission.aggregate([
            {
               // Only consider submissions that are accepted and have a score
               $match: {
                  status: "accepted",
                  aiScore: { $exists: true, $ne: null },
               },
            },
            {
               // Group by candidateId to calculate total score and challenges completed
               $group: {
                  _id: "$candidateId",
                  totalScore: { $sum: "$aiScore" },
                  count: { $sum: 1 }, // Count of accepted submissions
               },
            },
            { $sort: { totalScore: -1 } }, // Sort by total score descending
            ...commonStages, // Apply common stages for user details and profile completion
         ]);

         const finalLeaderboard = allCategoryLeaderboard.map((user, index) => ({
            rank: index + 1,
            ...user,
         }));

         return res.status(200).json({ success: true, data: finalLeaderboard });
      } else {
         // --- Leaderboard for a SPECIFIC category ---
         // Ensure the requested category is valid
         if (!CATEGORIES.includes(category.toString())) {
            return res
               .status(400)
               .json({ success: false, message: "Invalid category provided." });
         }

         const specificCategoryLeaderboard = await Submission.aggregate([
            {
               // Only consider submissions that are accepted and have a score
               $match: {
                  status: "accepted",
                  aiScore: { $exists: true, $ne: null },
               },
            },
            {
               // Lookup challenge details to filter by category
               $lookup: {
                  from: "challenges", // The name of the challenges collection in MongoDB
                  localField: "challengeId",
                  foreignField: "_id",
                  as: "challengeDetails",
               },
            },
            { $unwind: "$challengeDetails" }, // Deconstructs the challengeDetails array
            { $match: { "challengeDetails.category": category } }, // Filter by the requested category
            {
               // Group by candidateId to calculate total score and challenges completed for this category
               $group: {
                  _id: "$candidateId",
                  totalScore: { $sum: "$aiScore" },
                  count: { $sum: 1 }, // Count of accepted submissions in this category
               },
            },
            { $sort: { totalScore: -1 } }, // Sort by total score descending
            ...commonStages, // Apply common stages for user details and profile completion
            {
               // Finally, project the category for the specific leaderboard response
               $project: {
                  _id: 0,
                  name: "$name", // From previous projection
                  score: "$score", // From previous projection
                  challengesCompleted: "$challengesCompleted", // From previous projection
                  type: "$type",
                  category: { $literal: category }, // Add the specific category back
               },
            },
         ]);

         const finalLeaderboard = specificCategoryLeaderboard.map(
            (user, index) => ({
               rank: index + 1,
               ...user,
            })
         );

         res.status(200).json({ success: true, data: finalLeaderboard });
      }
   }
);
