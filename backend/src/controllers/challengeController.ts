import { Request, Response } from "express";

import Challenge from "../models/Challenge";
import Submission from "../models/Submission";
import { catchError } from "../utils/catchAsync";

/**
 * @desc    Create a new challenge
 * @route   POST /api/challenges
 * @access  Private (Company, Challenger)
 */

const createChallenge = catchError(async (req: Request, res: Response) => {
  const user = (req as any).user;

  const challenge = await Challenge.create({
    ...req.body,
    creatorId: user._id,
  });

  res.status(201).json({ success: true, data: challenge });
});

/**
 * @desc    Get all published challenges (Public Feed)
 * @route   GET /api/challenges
 * @access  Public
 */
const getPublishedChallenges = catchError(
  async (req: Request, res: Response) => {
    const filter: any = { status: "published" };

    // Apply filters from query params
    if (req.query.category) filter.category = req.query.category;
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;

    const challenges = await Challenge.find(filter).populate(
      "creatorId",
      "name type"
    );

    res.status(200).json({
      success: true,
      count: challenges.length,
      data: challenges,
    });
  }
);

/**
 * @desc    Get challenges created by the logged-in user
 * @route   GET /api/challenges/mine
 * @access  Private
 */
const getMyChallenges = catchError(async (req: Request, res: Response) => {
  const user = (req as any).user;

  const challenges = await Challenge.find({ creatorId: user._id });

  res.status(200).json({
    success: true,
    count: challenges.length,
    data: challenges,
  });
});

/**
 * @desc    Get all challenges (Admin only)
 * @route   GET /api/challenges/all
 * @access  Private (Admin)
 */
const getAllChallenges = catchError(async (req: Request, res: Response) => {
  const challenges = await Challenge.find().populate(
    "creatorId",
    "name email type"
  );

  res.status(200).json({
    success: true,
    count: challenges.length,
    data: challenges,
  });
});

/**
 * @desc    Update a challenge with safety checks
 * @route   PUT /api/challenges/:id
 * @access  Private (Creator Only)
 */
const updateChallenge = catchError(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;

  const challenge = await Challenge.findById(id);

  if (!challenge) {
    return res.status(404).json({ message: "Challenge not found" });
  }

  // Check Ownership
  if (challenge.creatorId.toString() !== user._id.toString()) {
    return res
      .status(403)
      .json({ message: "Not authorized to update this challenge" });
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
      return res.status(400).json({
        message:
          'Cannot edit core fields (title, desc, etc.) because candidates have already submitted work. You can only change the status to "closed".',
      });
    }
  }

  const updatedChallenge = await Challenge.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: updatedChallenge });
});

/**
 * @desc    Delete a challenge safely
 * @route   DELETE /api/challenges/:id
 * @access  Private (Creator Only)
 */
const deleteChallenge = catchError(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;

  const challenge = await Challenge.findById(id);

  if (!challenge) {
    return res.status(404).json({ message: "Challenge not found" });
  }

  // Check Ownership
  if (challenge.creatorId.toString() !== user._id.toString()) {
    return res
      .status(403)
      .json({ message: "Not authorized to delete this challenge" });
  }

  // Check for active submissions
  const submissionCount = await Submission.countDocuments({
    challengeId: id,
  });

  if (submissionCount > 0) {
    return res.status(400).json({
      message:
        'Cannot delete challenge with active submissions. Please change status to "closed" instead.',
    });
  }

  await challenge.deleteOne();

  res
    .status(200)
    .json({ success: true, message: "Challenge deleted successfully" });
});

export {
  createChallenge,
  getPublishedChallenges,
  getMyChallenges,
  getAllChallenges,
  updateChallenge,
  deleteChallenge,
};
