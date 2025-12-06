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
  try {
    const filter: any = { status: "published" };

    // Apply filters from query params
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

/**
 * @desc    Get challenges created by the logged-in user
 * @route   GET /api/challenges/mine
 * @access  Private
 */
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

/**
 * @desc    Get all challenges (Admin only)
 * @route   GET /api/challenges/all
 * @access  Private (Admin)
 */
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

/**
 * @desc    Update a challenge with safety checks
 * @route   PUT /api/challenges/:id
 * @access  Private (Creator Only)
 */
export const updateChallenge = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const challenge = await Challenge.findById(id);

    if (!challenge) {
      res.status(404).json({ message: "Challenge not found" });
      return;
    }

    // Check Ownership
    if (challenge.creatorId.toString() !== user._id.toString()) {
      res
        .status(403)
        .json({ message: "Not authorized to update this challenge" });
      return;
    }

    // Check for active submissions
    const submissionCount = await Submission.countDocuments({
      challengeId: id,
    });

    // If submissions exist, prevent editing of core fields
    if (submissionCount > 0) {
      const lockedFields = [
        "title",
        "description",
        "difficulty",
        "category",
        "type",
      ];
      const requestedUpdates = Object.keys(req.body);

      const isTryingToEditLocked = requestedUpdates.some((field) =>
        lockedFields.includes(field)
      );

      if (isTryingToEditLocked) {
        res.status(400).json({
          message:
            'Cannot edit core fields (title, desc, etc.) because candidates have already submitted work. You can only change the status to "closed".',
        });
        return;
      }
    }

    const updatedChallenge = await Challenge.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: updatedChallenge });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

/**
 * @desc    Delete a challenge safely
 * @route   DELETE /api/challenges/:id
 * @access  Private (Creator Only)
 */
export const deleteChallenge = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const challenge = await Challenge.findById(id);

    if (!challenge) {
      res.status(404).json({ message: "Challenge not found" });
      return;
    }

    // Check Ownership
    if (challenge.creatorId.toString() !== user._id.toString()) {
      res
        .status(403)
        .json({ message: "Not authorized to delete this challenge" });
      return;
    }

    // Check for active submissions
    const submissionCount = await Submission.countDocuments({
      challengeId: id,
    });

    // Prevent hard delete if submissions exist
    if (submissionCount > 0) {
      res.status(400).json({
        message:
          'Cannot delete challenge with active submissions. Please change status to "closed" instead.',
      });
      return;
    }

    await challenge.deleteOne();

    res
      .status(200)
      .json({ success: true, message: "Challenge deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
