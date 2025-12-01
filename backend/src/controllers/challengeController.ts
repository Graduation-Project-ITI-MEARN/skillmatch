import { Request, Response } from "express";
import Challenge from "../models/Challenge";

export const createChallenge = async (req: Request, res: Response) => {
  try {
    // Get the logged-in user (attached by auth middleware)
    const user = (req as any).user;

    const challenge = await Challenge.create({
      ...req.body,
      creatorId: user._id, // Automatically set the creator
    });

    res.status(201).json({ success: true, data: challenge });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const getChallenges = async (req: Request, res: Response) => {
  try {
    const filter: any = { status: "published" }; // Only show published items

    if (req.query.category) filter.category = req.query.category;
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;

    const challenges = await Challenge.find(filter).populate(
      "creatorId",
      "name type"
    );

    res
      .status(200)
      .json({ success: true, count: challenges.length, data: challenges });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
