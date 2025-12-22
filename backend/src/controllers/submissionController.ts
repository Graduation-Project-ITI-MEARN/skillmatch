import { Request, Response } from "express";
import Submission, { ISubmission, SubmissionType } from "../models/Submission";

import APIError from "../utils/APIError";
import { catchError } from "../utils/catchAsync";
import { emitToUser } from "../socket/socketService";
import { logActivity } from "../utils/activityLogger"; // <-- Import Logger
import mongoose from "mongoose";
import Challenge from "../models/Challenge";

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
 * @desc    Get submissions and started challenges for the logged-in candidate
 * @route   GET /api/submissions/mine
 * @access  Private (Candidate)
 */
const getMySubmissions = catchError(async (req: Request, res: Response) => {
   const user = req.user;
   if (!user) throw new APIError(401, "User not authenticated");

   // Fetch all submissions (including 'started' ones) for the candidate
   const candidateSubmissions = await Submission.find({
      candidateId: new mongoose.Types.ObjectId(user._id),
   }).populate("challengeId", "title category difficulty deadline"); // <-- Populate deadline here

   // Now, structure the data for the dashboard
   const startedChallenges = candidateSubmissions
      .filter((sub) => sub.status === "started")
      .map((sub) => ({
         _id: sub._id,
         challengeId: sub.challengeId,
         status: sub.status,
         createdAt: sub.createdAt,
         deadline: (sub.challengeId as any).deadline, // Access populated deadline
         title: (sub.challengeId as any).title,
         category: (sub.challengeId as any).category,
         difficulty: (sub.challengeId as any).difficulty,
      }));

   const activeSubmissions = candidateSubmissions
      .filter((sub) => sub.status !== "started")
      .map((sub) => ({
         _id: sub._id,
         challengeId: sub.challengeId,
         status: sub.status,
         createdAt: sub.createdAt,
         deadline: (sub.challengeId as any).deadline, // Access populated deadline
         title: (sub.challengeId as any).title,
         category: (sub.challengeId as any).category,
         difficulty: (sub.challengeId as any).difficulty,
         aiScore: sub.aiScore,
         isWinner: sub.isWinner,
         submissionType: sub.submissionType,
      }));

   res.status(200).json({
      success: true,
      data: {
         startedChallenges,
         activeSubmissions,
      },
   });
});

/**
 * @desc    Candidate submits a solution for a challenge (updates a "started" submission)
 * @route   POST /api/submissions   (This endpoint now handles final submission)
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

   // --- VALIDATION FOR ACTUAL SUBMISSION ---
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

   // Find an existing submission (either 'started' or already submitted)
   let submission: ISubmission | null = await Submission.findOne({
      challengeId: new mongoose.Types.ObjectId(challengeId),
      candidateId: new mongoose.Types.ObjectId(candidateId),
   });

   if (!submission) {
      throw new APIError(
         400,
         "You must start the challenge before submitting a solution."
      );
   }

   if (submission.status !== "started") {
      throw new APIError(409, "You have already submitted for this challenge.");
   }

   // Update the existing 'started' submission with the actual solution details
   submission.videoExplanationUrl = videoExplanationUrl.trim();
   submission.submissionType = submissionType;
   submission.linkUrl = linkUrl?.trim() || undefined; // Use undefined to remove if not provided
   submission.fileUrls = fileUrls || [];
   submission.textContent = textContent?.trim() || undefined; // Use undefined to remove if not provided
   submission.status = "pending"; // Change status to pending
   submission.aiScore = 0; // Reset score if it was previously set or for initial pending state

   await submission.save(); // Save the updated submission

   // Populate relationships to get Challenge Title and Candidate Name
   await submission.populate([
      { path: "challengeId", select: "title category difficulty" },
      { path: "candidateId", select: "name email" },
   ]);

   // Log Activity
   const challengeTitle =
      (submission.challengeId as any)?.title || "Unknown Challenge";

   await logActivity(
      candidateId,
      "submission_created", // Or "submission_updated" if you want to differentiate
      `User submitted solution for challenge: ${challengeTitle}`,
      "success",
      submission._id
   );

   res.status(200).json({
      // Changed to 200 OK as it's an update
      success: true,
      data: submission,
      message: "Solution submitted successfully!",
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

const updateSubmissionStatus = catchError(
   async (req: Request, res: Response) => {
      const { id } = req.params;
      const { status, score } = req.body;

      if (!["accepted", "rejected"].includes(status)) {
         throw new APIError(400, "Invalid status");
      }

      const submission = await Submission.findById(id).populate(
         "challengeId",
         "title"
      );

      if (!submission) {
         throw new APIError(404, "Submission not found");
      }

      submission.status = status;
      if (score !== undefined) submission.aiScore = score;

      await submission.save();

      // REAL-TIME NOTIFICATION
      emitToUser(submission.candidateId.toString(), {
         title: "Submission Update",
         message: `Your submission for "${
            (submission.challengeId as any).title
         }" was ${status}.`,
      });

      res.status(200).json({
         success: true,
         data: submission,
      });
   }
);

/**
 * @desc    Candidate starts a challenge (enrolls)
 * @route   POST /api/submissions/start
 * @access  Private (Candidate)
 */
const startChallenge = catchError(async (req: Request, res: Response) => {
   const { challengeId } = req.body;
   const candidateId = req.user?._id;

   if (!candidateId) throw new APIError(401, "User not authenticated");
   if (!challengeId) throw new APIError(400, "Challenge ID is required");

   // Check if the challenge exists and is published
   const challenge = await Challenge.findById(challengeId);
   if (!challenge) {
      throw new APIError(404, "Challenge not found");
   }
   if (challenge.status !== "published") {
      throw new APIError(400, "Cannot start a challenge that is not published");
   }

   // Prevent starting a challenge more than once
   const existingSubmission = await Submission.findOne({
      challengeId: new mongoose.Types.ObjectId(challengeId),
      candidateId: new mongoose.Types.ObjectId(candidateId),
   });

   if (existingSubmission) {
      if (existingSubmission.status === "started") {
         throw new APIError(409, "You have already started this challenge.");
      } else {
         throw new APIError(
            409,
            "You have already submitted for this challenge."
         );
      }
   }

   const startedSubmission = await Submission.create({
      challengeId,
      candidateId,
      status: "started", // Explicitly set status to 'started'
      // Other fields like videoExplanationUrl, submissionType, etc. are omitted for 'started' state
   });

   await logActivity(
      candidateId,
      "challenge_started",
      `User started challenge: ${(challenge as any).title}`,
      "success",
      startedSubmission._id
   );

   res.status(201).json({
      success: true,
      data: startedSubmission,
      message:
         "Challenge successfully started. You can now submit your solution.",
   });
});

export {
   getAllSubmissions,
   getMySubmissions,
   createSubmission,
   getSubmissionsByChallenge,
   getSubmissionById,
   updateSubmissionStatus,
   startChallenge,
};
