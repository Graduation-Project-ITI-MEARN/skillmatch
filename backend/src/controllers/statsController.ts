import { Request, Response } from "express";
import User from "../models/User";
import Challenge from "../models/Challenge";
import Submission from "../models/Submission";
import { catchError } from "../utils/catchAsync";

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

// ==================== Candidate Stats ====================
const getCandidateStats = async (req: any, res: Response) => {
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
const getChallengerStats = async (req: any, res: Response) => {
  const challengerId = req.user._id;

  const myChallenges = await Challenge.find({ creatorId: challengerId }).select(
    "_id prizeAmount"
  );
  const myChallengeIds = myChallenges.map((c) => c._id);

  // Calculate real total prizes allocated
  const totalPrizes = myChallenges.reduce(
    (acc, curr) => acc + (curr.prizeAmount || 0),
    0
  );

  const [totalSubmissions, avgScore] = await Promise.all([
    Submission.countDocuments({ challengeId: { $in: myChallengeIds } }) || 0,
    Submission.aggregate([
      { $match: { challengeId: { $in: myChallengeIds } } },
      { $group: { _id: null, avgScore: { $avg: "$aiScore" } } },
    ]).then((r) => r[0]?.avgScore || 0),
  ]);

  const activeCount = await Challenge.countDocuments({
    creatorId: challengerId,
    status: "published",
  });

  res.status(200).json({
    totalChallenges: myChallenges.length,
    activeCount,
    totalSubmissions,
    avgScore: Math.round(avgScore),
    totalPrizes,
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
          $ifNull: [{ $round: [{ $avg: "$submissionData.aiScore" }, 0] }, 0],
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
