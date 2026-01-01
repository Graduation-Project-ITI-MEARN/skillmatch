import { Request, Response } from "express";
import Submission from "../models/Submission";
import User from "../models/User";

export const getGlobalLeaderboard = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    if (!category || category === "all" || category === "All") {
      const leaderboard = res.advancedResults?.data.map(
        (user: any, index: number) => ({
          _id: user._id, // إضافة هذا السطر ضروري جداً
          rank: index + 1,
          name: user.name || "Anonymous",
          score: user.totalScore || 0,
          challengesCompleted: user.challengesCompleted || 0,
        })
      );

      return res.status(200).json({ success: true, data: leaderboard });
    }

    const filteredData = await Submission.aggregate([
      {
        $lookup: {
          from: "challenges",
          localField: "challengeId",
          foreignField: "_id",
          as: "challengeDetails",
        },
      },
      { $unwind: "$challengeDetails" },
      { $match: { "challengeDetails.category": category } },
      {
        $group: {
          _id: "$candidateId",
          totalScore: { $sum: "$aiScore" },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      { $sort: { totalScore: -1 } },
      {
        $project: {
          _id: "$userDetails._id", // اجعلي الـ _id يساوي معرف المستخدم الحقيقي
          name: "$userDetails.name",
          score: "$totalScore",
          challengesCompleted: "$count",
          category: { $literal: category },
        },
      },
    ]);

    const finalLeaderboard = filteredData.map((user, index) => ({
      _id: user._id, // تأكدي من تمريره هنا أيضاً
      rank: index + 1,
      ...user,
    }));

    res.status(200).json({ success: true, data: finalLeaderboard });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
