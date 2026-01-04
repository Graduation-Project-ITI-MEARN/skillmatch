import { Request, Response } from "express";

import Challenge from "../models/Challenge";
import Submission from "../models/Submission";
import User from "../models/User";
import { catchError } from "../utils/catchAsync";
import mongoose from "mongoose";

// ==================== Admin Stats ====================
const getAdminStats = async (req: Request, res: Response) => {
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
const getCompanyStats = async (req: any, res: Response) => {
   const companyId = req.user._id;

   const [totalChallenges, totalSubmissions, avgScore] = await Promise.all([
      Challenge.countDocuments({ creatorId: companyId }) || 0,
      Submission.countDocuments({ challengeCreator: companyId }) || 0,
      Submission.aggregate([
         { $match: { challengeCreator: companyId } },
         { $group: { _id: null, avgScore: { $avg: "$aiScore" } } },
      ]).then((r) => r[0]?.avgScore || 0),
   ]);

   const totalHires = 0;

   res.status(200).json({
      totalChallenges,
      totalSubmissions,
      avgScore: Math.round(avgScore),
      totalHires,
   });
};

/**
 * Helper function to calculate a candidate's total score for ranking purposes.
 * This logic should ideally match how the global leaderboard calculates a candidate's score.
 * We're assuming the total score is the sum of all AI scores from submitted challenges.
 */
async function calculateCandidateRankingScore(
   candidateId: mongoose.Types.ObjectId
): Promise<number> {
   const result = await Submission.aggregate([
      {
         $match: {
            candidateId: candidateId,
            aiScore: { $exists: true, $ne: null }, // Only submissions with an AI score
            status: { $ne: "started" }, // Only consider submitted challenges
         },
      },
      {
         $group: {
            _id: "$candidateId",
            totalScore: { $sum: "$aiScore" }, // Sum of all AI scores
         },
      },
   ]);

   return result.length > 0 ? result[0].totalScore : 0;
}

const getCandidateStats = catchError(async (req: Request, res: Response) => {
   const candidateId = req.user?._id;

   if (!candidateId) {
      throw new Error("User not authenticated");
   }

   const [
      uniqueChallenges,
      highestAiScoreDoc,
      averageAiScoreResult,
      challengesWonCount,
      currentCandidateScoreForRank,
   ] = await Promise.all([
      // 1. Amount of challenges with unique submissions from this candidate
      Submission.distinct("challengeId", { candidateId: candidateId }),

      // 2. Highest AI score from submitted challenges
      Submission.findOne({
         candidateId: candidateId,
         aiScore: { $exists: true, $ne: null }, // Ensure aiScore exists
         status: { $ne: "started" }, // Only submitted challenges
      })
         .sort({ aiScore: -1 })
         .select("aiScore")
         .lean(), // Use .lean() for performance when not modifying the document

      // 3. Average AI score from submitted challenges
      Submission.aggregate([
         {
            $match: {
               candidateId: candidateId,
               aiScore: { $exists: true, $ne: null },
               status: { $ne: "started" },
            },
         },
         {
            $group: {
               _id: null,
               avgScore: { $avg: "$aiScore" },
            },
         },
      ]),

      // 4. Number of challenges won (isWinner: true)
      Submission.countDocuments({
         candidateId: candidateId,
         isWinner: true,
      }),

      // 5. Calculate the current candidate's score for global ranking
      calculateCandidateRankingScore(candidateId),
   ]);

   const amountOfChallenges = uniqueChallenges.length;
   const highestAiScore = highestAiScoreDoc ? highestAiScoreDoc.aiScore : 0;
   const averageAiScore =
      averageAiScoreResult.length > 0 ? averageAiScoreResult[0].avgScore : 0;
   const challengesWon = challengesWonCount;

   // --- Calculate Global Rank ---
   let globalRank = 0;
   if (currentCandidateScoreForRank > 0) {
      // Count how many distinct candidates have a strictly higher ranking score
      const candidatesWithHigherScore = await Submission.aggregate([
         {
            $match: {
               aiScore: { $exists: true, $ne: null },
               status: { $ne: "started" },
            },
         },
         {
            $group: {
               _id: "$candidateId",
               totalScore: { $sum: "$aiScore" },
            },
         },
         {
            $match: {
               totalScore: { $gt: currentCandidateScoreForRank }, // Scores strictly greater than current candidate's
            },
         },
         {
            $group: {
               _id: null,
               count: { $sum: 1 }, // Count the number of such candidates
            },
         },
      ]);

      globalRank =
         (candidatesWithHigherScore.length > 0
            ? candidatesWithHigherScore[0].count
            : 0) + 1;
   }

   res.status(200).json({
      success: true,
      data: {
         amountOfChallenges,
         highestAiScore,
         averageAiScore,
         globalRank,
      },
   });
});

// ==================== Challenger Stats (Updated) ====================
const getChallengerStats = async (req: any, res: Response) => {
   const challengerId = req.user._id;

   // 1. حساب عدد التحديات ومتوسط الجوائز
   const challengeStats = await Challenge.aggregate([
      { $match: { creatorId: new mongoose.Types.ObjectId(challengerId) } },
      {
         $group: {
            _id: null,
            totalChallenges: { $sum: 1 },
            averagePrizeAmount: { $avg: { $ifNull: ["$prizeAmount", "$salary"] } }
         }
      }
   ]);

   // 2. حساب عدد التسليمات ومتوسط سكور الـ AI
   const submissionStats = await Submission.aggregate([
      { $match: { challengeCreator: new mongoose.Types.ObjectId(challengerId) } },
      {
         $group: {
            _id: null,
            totalSubmissions: { $sum: 1 },
            averageAiScore: { $avg: "$aiScore" }
         }
      }
   ]);

   res.status(200).json({
      success: true,
      data: {
         totalChallenges: challengeStats[0]?.totalChallenges || 0,
         totalSubmissions: submissionStats[0]?.totalSubmissions || 0,
         averageAiScore: Math.round(submissionStats[0]?.averageAiScore || 0),
         averagePrizeAmount: Math.round(challengeStats[0]?.averagePrizeAmount || 0)
      }
   });
};

// ==================== Leaderboard (Sidebar) ====================
const getLeaderboard = catchError(async (req: Request, res: Response) => {
   // 👇 FIX: Query by 'type' OR 'role' to find candidates properly
   const topCandidates = await User.find({
      $or: [{ type: "candidate" }, { role: "candidate" }],
   })
      .select("name email")
      .limit(3)
      .lean();

   const leaderboard = topCandidates.map((user) => ({
      name: user.name,
      score: Math.floor(Math.random() * 500) + 500, // Placeholder score until submissions are graded
      avatar: `https://ui-avatars.com/api/?name=${user.name}&background=random`,
   }));

   res.status(200).json({
      success: true,
      data: leaderboard,
   });
});

// ==================== Dashboard Widgets (Admin) ====================

const getUserDistribution = catchError(async (req: Request, res: Response) => {
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
});

const getDailyStats = catchError(async (req: Request, res: Response) => {
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
         revenue: 0,
      },
   });
});

const getTopChallenges = catchError(async (req: Request, res: Response) => {
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
            participants: { $size: "$submissionData" },
            quality: {
               $ifNull: [
                  { $round: [{ $avg: "$submissionData.aiScore" }, 0] },
                  0,
               ],
            },
         },
      },
      { $sort: { participants: -1 } },
      { $limit: 3 },
   ]);

   res.status(200).json({ success: true, data: topChallenges });
});

const getHiringAnalytics = catchError(async (req: any, res: Response) => {
   const ownerId = req.user._id;
   const challenges = await Challenge.find({
      creatorId: ownerId,
      status: "published",
   }).select("_id createdAt");

   const challengeIds = challenges.map((c) => c._id);
   const submissions = await Submission.find({
      challengeId: { $in: challengeIds },
   });

   const totalChallenges = challenges.length;
   const totalSubmissions = submissions.length;
   const accepted = submissions.filter((s) => s.status === "accepted");
   const conversion =
      totalSubmissions === 0 ? 0 : accepted.length / totalSubmissions;
   const applicationRate =
      totalChallenges === 0 ? 0 : totalSubmissions / totalChallenges;
   const avgScore =
      totalSubmissions === 0
         ? 0
         : submissions.reduce((sum, s) => sum + (s.aiScore || 0), 0) /
           totalSubmissions;

   const hireTimes: number[] = [];
   accepted.forEach((sub) => {
      const challenge = challenges.find(
         (c) => c._id.toString() === sub.challengeId.toString()
      );
      if (challenge) {
         const createdAt = challenge.createdAt as unknown as Date;
         hireTimes.push(
            new Date(sub.updatedAt).getTime() - new Date(createdAt).getTime()
         );
      }
   });

   const avgTimeToHire =
      hireTimes.length === 0
         ? 0
         : hireTimes.reduce((a, b) => a + b, 0) / hireTimes.length;

   res.status(200).json({
      success: true,
      data: {
         totalChallenges,
         totalSubmissions,
         applicationRate,
         conversion,
         avgScore: Math.round(avgScore),
         avgTimeToHireDays: Math.round(avgTimeToHire / (1000 * 60 * 60 * 24)),
      },
   });
});

const getPlatformAnalytics = catchError(async (req: Request, res: Response) => {
   const now = new Date();
   const last30 = new Date();
   last30.setDate(now.getDate() - 30);
   const prev30 = new Date();
   prev30.setDate(now.getDate() - 60);

   const usersLast30 = await User.countDocuments({
      createdAt: { $gte: last30 },
   });
   const usersPrev30 = await User.countDocuments({
      createdAt: { $gte: prev30, $lt: last30 },
   });
   const revenue = 0;
   const last7 = new Date();
   last7.setDate(now.getDate() - 7);
   const engagedUsers = await User.countDocuments({
      lastLogin: { $gte: last7 },
   });

   res.status(200).json({
      success: true,
      data: {
         userGrowth: {
            last30Days: usersLast30,
            previous30Days: usersPrev30,
         },
         revenue,
         engagementLast7Days: engagedUsers,
      },
   });
});

const getJobPerformance = catchError(async (req: any, res: Response) => {
   const ownerId = req.user._id;
   const challenges = await Challenge.find({ creatorId: ownerId });
   const result = [];

   for (const challenge of challenges) {
      const submissions = await Submission.find({ challengeId: challenge._id });
      const scores = submissions.map((s) => s.aiScore || 0);

      result.push({
         title: challenge.title,
         submissionsCount: submissions.length,
         avgScore:
            scores.length === 0
               ? 0
               : Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
         topScore: scores.length === 0 ? 0 : Math.max(...scores),
      });
   }

   res.status(200).json({ success: true, data: result });
});

export {
   getAdminStats,
   getCompanyStats,
   getCandidateStats,
   getChallengerStats,
   getLeaderboard,
   getUserDistribution,
   getDailyStats,
   getTopChallenges,
   getHiringAnalytics,
   getPlatformAnalytics,
   getJobPerformance,
};
