import { Request, Response } from "express";
import User from "../models/User";
import Challenge from "../models/Challenge";
import Submission from "../models/Submission";
import { catchError } from "../utils/catchAsync";

// ==================== Admin Stats ====================
export const getAdminStats = async (req: Request, res: Response) => {
   const [totalUsers, totalChallenges, totalSubmissions, totalRevenue] =
      await Promise.all([
         User.countDocuments() || 0,
         Challenge.countDocuments() || 0,
         Submission.countDocuments() || 0,
         0,
      ]);

   res.status(200).json({
      totalUsers,
      totalChallenges,
      totalSubmissions,
      totalRevenue,
   });
};

// ==================== Company Stats ====================
export const getCompanyStats = async (req: any, res: Response) => {
   const companyId = req.user._id;

   const [totalChallenges, totalSubmissions, avgScore] = await Promise.all([
      Challenge.countDocuments({ creatorId: companyId }) || 0,
      Submission.countDocuments({ challengeCreator: companyId }) || 0,
      Submission.aggregate([
         { $match: { challengeCreator: companyId } },
         { $group: { _id: null, avgScore: { $avg: "$score" } } },
      ]).then((r) => r[0]?.avgScore || 0),
   ]);

   const totalHires = 0;

   res.status(200).json({
      totalChallenges,
      totalSubmissions,
      avgScore,
      totalHires,
   });
};

// ==================== Candidate Stats ====================
export const getCandidateStats = async (req: any, res: Response) => {
   const candidateId = req.user._id;

   const [mySubmissions, challengesWon, globalRank, totalRevenue] =
      await Promise.all([
         Submission.countDocuments({ userId: candidateId }) || 0,
         0,
         0,
         0,
      ]);

   res.status(200).json({
      mySubmissions,
      challengesWon,
      globalRank,
      totalRevenue,
   });
};

// ==================== Challenger Stats ====================
export const getChallengerStats = async (req: any, res: Response) => {
   const challengerId = req.user._id;

   const [totalChallenges, totalSubmissions, avgScore, totalPrizes] =
      await Promise.all([
         Challenge.countDocuments({ creatorId: challengerId }) || 0,
         Submission.countDocuments({ challengeCreator: challengerId }) || 0,
         Submission.aggregate([
            { $match: { challengeCreator: challengerId } },
            { $group: { _id: null, avgScore: { $avg: "$score" } } },
         ]).then((r) => r[0]?.avgScore || 0),
         0,
      ]);

   res.status(200).json({
      totalChallenges,
      totalSubmissions,
      avgScore,
      totalPrizes,
   });
};

// ==================== Dashboard Widgets (Admin) ====================

/**
 * @desc    Get user distribution by role (Candidate vs Company vs Challenger)
 * @route   GET /api/stats/distribution
 */
export const getUserDistribution = catchError(
   async (req: Request, res: Response) => {
      const stats = await User.aggregate([
         {
            $group: {
               _id: "$type",
               count: { $sum: 1 },
            },
         },
      ]);

      const formatted = stats
         .filter((s) => s._id !== null)
         .map((s) => ({ type: s._id, count: s.count }));

      res.status(200).json({
         success: true,
         data: formatted,
      });
   }
);

/**
 * @desc    Get counts for today only (New Signups, etc.)
 * @route   GET /api/stats/daily
 */
export const getDailyStats = catchError(async (req: Request, res: Response) => {
   const startOfDay = new Date();
   startOfDay.setHours(0, 0, 0, 0);

   const [newUsers, newChallenges, submissions] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: startOfDay } }),
      Challenge.countDocuments({ createdAt: { $gte: startOfDay } }),
      Submission.countDocuments({ createdAt: { $gte: startOfDay } }),
   ]);

   res.status(200).json({
      success: true,
      data: {
         newUsers,
         newChallenges,
         submissions,
         revenue: 0, // Add revenue logic here later
      },
   });
});

/**
 * @desc    Get top 3 challenges by participant count, avg AI score, and revenue
 * @route   GET /api/stats/top-challenges
 */
export const getTopChallenges = catchError(
   async (req: Request, res: Response) => {
      const topChallenges = await Challenge.aggregate([
         {
            $lookup: {
               from: "submissions",
               localField: "_id",
               foreignField: "challengeId",
               as: "submissionData",
            },
         },
         {
            $project: {
               title: 1,
               // Count how many items in the submissionData array
               participants: { $size: "$submissionData" },

               // Calculate Average of 'aiScore' from ISubmission
               // If no submissions, default to 0 to avoid null
               quality: {
                  $ifNull: [
                     { $round: [{ $avg: "$submissionData.aiScore" }, 0] },
                     0,
                  ],
               },
            },
         },
         // Sort by highest participation
         { $sort: { participants: -1 } },
         // Get top 3
         { $limit: 3 },
      ]);

      res.status(200).json({ success: true, data: topChallenges });
   }
);
