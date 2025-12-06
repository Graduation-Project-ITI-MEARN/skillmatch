import { Request, Response } from "express";
import Submission, {
  ISubmission,
  SubmissionType,
} from "../models/Submission";
import mongoose from "mongoose";
import APIError from "../utils/APIError";

// Get all submissions
export const getAllSubmissions = async (req: Request, res: Response) => {
  try {
    const submissions = await Submission.find();
    res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// Create new submission
export const createSubmission = async (req: Request, res: Response) => {
  try {
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

    if (!submissionType)
      throw new APIError(400, "Submission type is required");

    if (!Object.values(SubmissionType).includes(submissionType)) {
      throw new APIError(
        400,
        `Invalid submission type: ${Object.values(SubmissionType).join(", ")}`
      );
    }

    // Validate type-specific fields
    switch (submissionType) {
      case SubmissionType.LINK:
        if (!linkUrl?.trim())
          throw new APIError(400, "Link URL required");
        break;

      case SubmissionType.FILE:
        if (!fileUrls?.length)
          throw new APIError(400, "File URLs required");
        break;

      case SubmissionType.TEXT:
        if (!textContent?.trim())
          throw new APIError(400, "Text content is required");
        break;
    }

    const exists = await Submission.findOne({
      challengeId: new mongoose.Types.ObjectId(challengeId),
      candidateId: new mongoose.Types.ObjectId(candidateId),
    });

    if (exists)
      throw new APIError(409, "Already submitted for this challenge");

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

    await submission.populate([
      { path: "challengeId", select: "title category difficulty" },
      { path: "candidateId", select: "name email" },
    ]);

    res.status(201).json({
      success: true,
      data: submission,
    });
  } catch (error: any) {
    if (error instanceof APIError) {
      return res
        .status(error.status)
        .json({ success: false, message: error.message });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Submissions by challenge
export const getSubmissionsByChallenge = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      throw new APIError(400, "Invalid challenge ID");

    const submissions = await Submission.find({ challengeId: id })
      .populate("candidateId", "name email profilePicture")
      .populate("challengeId", "title category difficulty")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error: any) {
    if (error instanceof APIError)
      return res
        .status(error.status)
        .json({ success: false, message: error.message });

    res.status(500).json({
      success: false,
      message: "Failed to retrieve submissions",
      error: error.message,
    });
  }
};

// Single submission
export const getSubmissionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      throw new APIError(400, "Invalid submission ID");

    const submission = await Submission.findById(id)
      .populate("candidateId", "name email profilePicture")
      .populate("challengeId", "title category difficulty");

    if (!submission) throw new APIError(404, "Submission not found");

    res.status(200).json({ success: true, data: submission });
  } catch (error: any) {
    if (error instanceof APIError)
      return res
        .status(error.status)
        .json({ success: false, message: error.message });

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
