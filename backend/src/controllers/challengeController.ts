import { Request, Response } from "express";
import Challenge from "../models/Challenge";
import Submission from "../models/Submission";

/**
 * @desc    Create a new challenge
 * @route   POST /api/challenges
 * @access  Private (Company, Challenger)
 */
export const createChallenge = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const challenge = await Challenge.create({
      ...req.body,
      creatorId: user._id,
    });

    res.status(201).json({ success: true, data: challenge });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

/**
 * @desc    Get all published challenges (Public Feed)
 * @route   GET /api/challenges
 * @access  Public
 */
export const getPublishedChallenges = async (req: Request, res: Response) => {
  return res.status(200).json(res.advancedResults);
};

/**
 * @desc    Get challenges created by the logged-in user
 * @route   GET /api/challenges/mine
 * @access  Private
 */
export const getMyChallenges = async (req: Request, res: Response) => {
  return res.status(200).json(res.advancedResults);
};

/**
 * @desc    Get all challenges (Admin only)
 * @route   GET /api/challenges/all
 * @access  Private (Admin)
 */
export const getAllChallenges = async (req: Request, res: Response) => {
  return res.status(200).json(res.advancedResults);
};
