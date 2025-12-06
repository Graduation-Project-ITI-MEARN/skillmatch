import { Request, Response } from "express";
import Challenge from "../models/Challenge";

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

export const getPublishedChallenges = async (req: Request, res: Response) => {
  return res.status(200).json(res.advancedResults);
};

export const getMyChallenges = async (req: Request, res: Response) => {
  return res.status(200).json(res.advancedResults);
};

export const getAllChallenges = async (req: Request, res: Response) => {
  return res.status(200).json(res.advancedResults);
};
