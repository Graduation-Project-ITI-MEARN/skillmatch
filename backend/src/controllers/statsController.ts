import { Request, Response } from "express";
import User from "../models/User";
import Challenge from "../models/Challenge";
import Submission from "../models/Submission";

// ==================== Admin Stats ====================
export const getAdminStats = async (req: Request, res: Response) => {
  const [totalUsers, totalChallenges, totalSubmissions, totalRevenue] = await Promise.all([
    User.countDocuments() || 0,
    Challenge.countDocuments() || 0,
    Submission.countDocuments() || 0,
    0 
  ]);

  res.status(200).json({ totalUsers, totalChallenges, totalSubmissions, totalRevenue });
};

// ==================== Company Stats ====================
export const getCompanyStats = async (req: any, res: Response) => {
  const companyId = req.user._id;

  const [totalChallenges, totalSubmissions, avgScore] = await Promise.all([
    Challenge.countDocuments({ creatorId: companyId }) || 0,
    Submission.countDocuments({ challengeCreator: companyId }) || 0,
    Submission.aggregate([
      { $match: { challengeCreator: companyId } },
      { $group: { _id: null, avgScore: { $avg: "$score" } } }
    ]).then(r => r[0]?.avgScore || 0),
  ]);

  const totalHires = 0; 

  res.status(200).json({ totalChallenges, totalSubmissions, avgScore, totalHires });
};

// ==================== Candidate Stats ====================
export const getCandidateStats = async (req: any, res: Response) => {
  const candidateId = req.user._id;

  const [mySubmissions, challengesWon, globalRank, totalRevenue] = await Promise.all([
    Submission.countDocuments({ userId: candidateId }) || 0,
    0, 
    0, 
    0  
  ]);

  res.status(200).json({ mySubmissions, challengesWon, globalRank, totalRevenue });
};

// ==================== Challenger Stats ====================
export const getChallengerStats = async (req: any, res: Response) => {
  const challengerId = req.user._id;

  const [totalChallenges, totalSubmissions, avgScore, totalPrizes] = await Promise.all([
    Challenge.countDocuments({ creatorId: challengerId }) || 0,
    Submission.countDocuments({ challengeCreator: challengerId }) || 0,
    Submission.aggregate([
      { $match: { challengeCreator: challengerId } },
      { $group: { _id: null, avgScore: { $avg: "$score" } } }
    ]).then(r => r[0]?.avgScore || 0),
    0 
  ]);

  res.status(200).json({ totalChallenges, totalSubmissions, avgScore, totalPrizes });
};
