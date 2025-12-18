import { Request, Response } from "express";
import User from "../models/User";
import Challenge from "../models/Challenge";
import Submission from "../models/Submission";
import { catchError } from "../utils/catchAsync";

// ==================== Admin Stats ====================
export const getAdminStats = catchError(async (req: Request, res: Response) => {
  const [totalUsers, totalChallenges, totalSubmissions, totalRevenue] =
    await Promise.all([
      User.countDocuments() || 0,
      Challenge.countDocuments() || 0,
      Submission.countDocuments() || 0,
      0, // Placeholder for revenue until Payments are fully integrated
    ]);

  res
    .status(200)
    .json({ totalUsers, totalChallenges, totalSubmissions, totalRevenue });
});

// ==================== Company Stats ====================
export const getCompanyStats = catchError(
  async (req: Request, res: Response) => {
    const companyId = (req as any).user._id;

    // 1. Get all challenge IDs created by this company
    const myChallenges = await Challenge.find({ creatorId: companyId }).select(
      "_id"
    );
    const myChallengeIds = myChallenges.map((c) => c._id);

    const [totalChallenges, totalSubmissions, avgScore] = await Promise.all([
      Challenge.countDocuments({ creatorId: companyId }) || 0,
      Submission.countDocuments({ challengeId: { $in: myChallengeIds } }) || 0,
      Submission.aggregate([
        { $match: { challengeId: { $in: myChallengeIds } } },
        { $group: { _id: null, avgScore: { $avg: "$aiScore" } } }, // Assuming 'aiScore' field exists
      ]).then((r) => r[0]?.avgScore || 0),
    ]);

    const totalHires = 0; // Placeholder

    res
      .status(200)
      .json({ totalChallenges, totalSubmissions, avgScore, totalHires });
  }
);

// ==================== Candidate Stats ====================
export const getCandidateStats = catchError(
  async (req: Request, res: Response) => {
    const candidateId = (req as any).user._id;

    const [mySubmissions, challengesWon, globalRank, totalRevenue] =
      await Promise.all([
        Submission.countDocuments({ candidateId: candidateId }) || 0,
        0, // Placeholder
        0, // Placeholder
        0, // Placeholder
      ]);

    res
      .status(200)
      .json({ mySubmissions, challengesWon, globalRank, totalRevenue });
  }
);

// ==================== Challenger Stats ====================
export const getChallengerStats = catchError(
  async (req: Request, res: Response) => {
    const challengerId = (req as any).user._id;

    // 1. Get all challenge IDs created by this challenger
    const myChallenges = await Challenge.find({
      creatorId: challengerId,
    }).select("_id");
    const myChallengeIds = myChallenges.map((c) => c._id);

    // 2. Aggregate Data
    const [activeCount, totalSubmissions, avgScore] = await Promise.all([
      // Active means 'published'
      Challenge.countDocuments({
        creatorId: challengerId,
        status: "published",
      }) || 0,

      // Submissions on MY challenges
      Submission.countDocuments({ challengeId: { $in: myChallengeIds } }) || 0,

      // Average Score on MY challenges
      Submission.aggregate([
        { $match: { challengeId: { $in: myChallengeIds } } },
        { $group: { _id: null, avgScore: { $avg: "$aiScore" } } },
      ]).then((r) => r[0]?.avgScore || 0),
    ]);

    // Mock Data for prizes (to be replaced with Transaction model later)
    const totalPrizes = 15000;

    res.status(200).json({
      success: true,
      stats: {
        activeCount,
        totalSubmissions,
        avgScore: Math.round(avgScore),
        totalPrizes,
      },
    });
  }
);

// ==================== Leaderboard (New) ====================
export const getLeaderboard = catchError(
  async (req: Request, res: Response) => {
    // Mock Leaderboard for the Dashboard Sidebar
    // In production, this would query the User collection sorted by 'reputation' or 'score'
    const leaderboard = [
      {
        name: "Sarah Ahmed",
        score: 980,
        avatar: "https://i.pravatar.cc/150?u=a",
      },
      {
        name: "Mohamed Ali",
        score: 850,
        avatar: "https://i.pravatar.cc/150?u=b",
      },
      {
        name: "Lina Karim",
        score: 720,
        avatar: "https://i.pravatar.cc/150?u=c",
      },
    ];

    res.status(200).json({
      success: true,
      data: leaderboard,
    });
  }
);
