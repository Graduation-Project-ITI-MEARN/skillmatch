import { Request, Response } from "express";
import Challenge from "../models/Challenge";
import { isValidCategory, areValidSkills } from './metadataController';

export const createChallenge = async (req: Request, res: Response) => {
  try {
    // Get the logged-in user (attached by auth middleware)
    const user = (req as any).user;
    
    const { category, skills } = req.body;

    // ✅ Validate category
    if (!category) {
      return res.status(400).json({ 
        success: false, 
        message: "Category is required" 
      });
    }

    if (!isValidCategory(category)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid category. Please select a valid category from the list." 
      });
    }

    // ✅ Validate skills (if provided)
    if (skills && Array.isArray(skills) && skills.length > 0) {
      if (!areValidSkills(skills)) {
        return res.status(400).json({ 
          success: false, 
          message: "One or more skills are invalid. Please select valid skills from the list." 
        });
      }
    }

    const challenge = await Challenge.create({
      ...req.body,
      creatorId: user._id, // Automatically set the creator
    });

    res.status(201).json({ success: true, data: challenge });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const getPublishedChallenges = async (req: Request, res: Response) => {
  try {
    const filter: any = { status: "published" }; // Only show published items

    // ✅ Validate category filter if provided
    if (req.query.category) {
      const categoryStr = req.query.category as string;
      if (!isValidCategory(categoryStr)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid category filter" 
        });
      }
      filter.category = categoryStr;
    }

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

export const getMyChallenges = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const challenges = await Challenge.find({ creatorId: user._id });

    res
      .status(200)
      .json({ success: true, count: challenges.length, data: challenges });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const getAllChallenges = async (req: Request, res: Response) => {
  try {
    const challenges = await Challenge.find().populate(
      "creatorId",
      "name email type"
    );

    res
      .status(200)
      .json({ success: true, count: challenges.length, data: challenges });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};