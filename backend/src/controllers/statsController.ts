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
      0,
    ]);

  res
    .status(200)
    .json({ totalUsers, totalChallenges, totalSubmissions, totalRevenue });
});

// ==================== Company Stats ====================
export const getCompanyStats = catchError(
  async (req: Request, res: Response) => {
    const companyId = (req as any).user._id;

    const myChallenges = await Challenge.find({ creatorId: companyId }).select(
      "_id"
    );
    const myChallengeIds = myChallenges.map((c) => c._id);

    const [totalChallenges, totalSubmissions, avgScore] = await Promise.all([
      Challenge.countDocuments({ creatorId: companyId }) || 0,
      Submission.countDocuments({ challengeId: { $in: myChallengeIds } }) || 0,
      Submission.aggregate([
        { $match: { challengeId: { $in: myChallengeIds } } },
        { $group: { _id: null, avgScore: { $avg: "$aiScore" } } },
      ]).then((r) => r[0]?.avgScore || 0),
    ]);

    const totalHires = 0;

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
        0,
        0,
        0,
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

    const myChallenges = await Challenge.find({
      creatorId: challengerId,
    }).select("_id");
    const myChallengeIds = myChallenges.map((c) => c._id);

    const [activeCount, totalSubmissions, avgScore] = await Promise.all([
      Challenge.countDocuments({
        creatorId: challengerId,
        status: "published",
      }) || 0,
      Submission.countDocuments({ challengeId: { $in: myChallengeIds } }) || 0,
      Submission.aggregate([
        { $match: { challengeId: { $in: myChallengeIds } } },
        { $group: { _id: null, avgScore: { $avg: "$aiScore" } } },
      ]).then((r) => r[0]?.avgScore || 0),
    ]);

    const totalPrizes = 15000; // Placeholder

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
    const leaderboard = [
      {
        name: "Sarah Ahmed",
        score: 980,
        avatar: "https://ui-avatars.com/api/?name=Sarah",
      },
      {
        name: "Mohamed Ali",
        score: 850,
        avatar: "https://ui-avatars.com/api/?name=Mohamed",
      },
      {
        name: "Lina Karim",
        score: 720,
        avatar: "https://ui-avatars.com/api/?name=Lina",
      },
    ];

    res.status(200).json({
      success: true,
      data: leaderboard,
    });
  }
);

// ==================== Placeholders for other routes imported in router ====================
export const getUserDistribution = catchError(
  async (req: Request, res: Response) => res.json({ success: true, data: {} })
);
export const getDailyStats = catchError(async (req: Request, res: Response) =>
  res.json({ success: true, data: {} })
);
export const getTopChallenges = catchError(
  async (req: Request, res: Response) => res.json({ success: true, data: {} })
);
export const getHiringAnalytics = catchError(
  async (req: Request, res: Response) => res.json({ success: true, data: {} })
);
export const getPlatformAnalytics = catchError(
  async (req: Request, res: Response) => res.json({ success: true, data: {} })
);
export const getJobPerformance = catchError(
  async (req: Request, res: Response) => res.json({ success: true, data: {} })
);
