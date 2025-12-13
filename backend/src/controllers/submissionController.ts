import { Request, Response } from "express";
import Submission, { ISubmission, SubmissionType } from "../models/Submission";
import APIError from "../utils/APIError";
import { catchError } from "../utils/catchAsync";
import mongoose from "mongoose";
import { logActivity } from "../utils/activityLogger"; // <-- Import Logger

/**
 * @desc    Get all submissions (Admin/General use)
 * @route   GET /api/submissions
 * @access  Private
 */
const getAllSubmissions = catchError(async (req: Request, res: Response) => {
  const submissions = await Submission.find();

  res.status(200).json({
    success: true,
    data: submissions,
  });
});

/**
 * @desc    Create a new submission for a challenge
 * @route   POST /api/submissions
 * @access  Private (Candidate)
 */
const createSubmission = catchError(async (req: Request, res: Response) => {
  const {
    challengeId,
    videoExplanationUrl,
    submissionType,
    linkUrl,
    fileUrls,
    textContent,
  } = req.body;

  const candidateId = req.user?._id;
  if (!candidateId) throw new APIError(401, "User not authenticated");

  if (!challengeId) throw new APIError(400, "Challenge ID is required");

  if (!videoExplanationUrl?.trim()) {
    throw new APIError(400, "Video explanation is required");
  }

  if (!submissionType) throw new APIError(400, "Submission type is required");

  if (!Object.values(SubmissionType).includes(submissionType)) {
    throw new APIError(
      400,
      `Invalid submission type: ${Object.values(SubmissionType).join(", ")}`
    );
  }

  // Type-specific validation
  switch (submissionType) {
    case SubmissionType.LINK:
      if (!linkUrl?.trim()) {
        throw new APIError(400, "Link URL required");
      }
      break;

    case SubmissionType.FILE:
      if (!fileUrls?.length) {
        throw new APIError(400, "File URLs required");
      }
      break;

    case SubmissionType.TEXT:
      if (!textContent?.trim()) {
        throw new APIError(400, "Text content is required");
      }
      break;
  }

  // Prevent duplicate submissions
  const exists = await Submission.findOne({
    challengeId: new mongoose.Types.ObjectId(challengeId),
    candidateId: new mongoose.Types.ObjectId(candidateId),
  });

  if (exists) {
    throw new APIError(409, "Already submitted for this challenge");
  }

  // Create submission
  const submission: ISubmission = await Submission.create({
    challengeId,
    candidateId,
    videoExplanationUrl: videoExplanationUrl.trim(),
    submissionType,
    linkUrl: linkUrl?.trim(),
    fileUrls,
    textContent: textContent?.trim(),
    aiScore: 0,
  });

  // Populate relationships to get Challenge Title and Candidate Name
  await submission.populate([
    { path: "challengeId", select: "title category difficulty" },
    { path: "candidateId", select: "name email" },
  ]);

  // Log Activity
  // We access the populated challenge title safely
  const challengeTitle =
    (submission.challengeId as any)?.title || "Unknown Challenge";

  await logActivity(
    candidateId,
    "submission_created",
    `User submitted to challenge: ${challengeTitle}`,
    submission._id
  );

  res.status(201).json({
    success: true,
    data: submission,
  });
});

/**
 * @desc    Get submissions for a specific challenge
 * @route   GET /api/challenges/:id/submissions
 * @access  Private
 */
const getSubmissionsByChallenge = catchError(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new APIError(400, "Invalid challenge ID");
    }

    const submissions = await Submission.find({ challengeId: id })
      .populate("candidateId", "name email profilePicture")
      .populate("challengeId", "title category difficulty")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  }
);

/**
 * @desc    Get a single submission by ID
 * @route   GET /api/submissions/:id
 * @access  Private
 */
const getSubmissionById = catchError(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new APIError(400, "Invalid submission ID");
  }

  const submission = await Submission.findById(id)
    .populate("candidateId", "name email profilePicture")
    .populate("challengeId", "title category difficulty");

  if (!submission) {
    throw new APIError(404, "Submission not found");
  }

  res.status(200).json({
    success: true,
    data: submission,
  });
});

export {
  getAllSubmissions,
  createSubmission,
  getSubmissionsByChallenge,
  getSubmissionById,
};
