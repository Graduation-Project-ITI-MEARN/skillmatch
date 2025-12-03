import { Request, Response } from "express";
import Submission, { ISubmission, SubmissionType } from "../models/Submission";
import mongoose from "mongoose";
import APIError from "../utils/APIError";

/**
 * Get all submissions
 */
export const getAllSubmissions = async (
   req: Request,
   res: Response
): Promise<void> => {
   try {
      const submissions = await Submission.find();
      res.status(200).json({ success: true, data: submissions });
   } catch (error) {
      res.status(500).json({ message: "Server Error", error });
   }
};

/**
 * Create a new submission
 * POST /api/submissions
 * Protected Route - Candidate Only
 */
export const createSubmission = async (
   req: Request,
   res: Response
): Promise<void> => {
   try {
      const {
         challengeId,
         videoExplanationUrl,
         submissionType,
         linkUrl,
         fileUrls,
         textContent,
      } = req.body;

      // Get candidate ID from authenticated user
      const candidateId = req.user?._id;

      if (!candidateId) {
         throw new APIError(401, "User not authenticated");
      }

      // Basic validation
      if (!challengeId) {
         throw new APIError(400, "Challenge ID is required");
      }

      if (!videoExplanationUrl || videoExplanationUrl.trim() === "") {
         throw new APIError(
            400,
            "Video explanation is mandatory for all submissions"
         );
      }

      if (!submissionType) {
         throw new APIError(400, "Submission type is required");
      }

      // Validate submission type
      if (!Object.values(SubmissionType).includes(submissionType)) {
         throw new APIError(
            400,
            `Invalid submission type. Must be one of: ${Object.values(
               SubmissionType
            ).join(", ")}`
         );
      }

      // Type-specific validation
      switch (submissionType) {
         case SubmissionType.LINK:
            if (!linkUrl || linkUrl.trim() === "") {
               throw new APIError(
                  400,
                  "Link URL is required for link-type submissions"
               );
            }
            break;

         case SubmissionType.FILE:
            if (
               !fileUrls ||
               !Array.isArray(fileUrls) ||
               fileUrls.length === 0
            ) {
               throw new APIError(
                  400,
                  "At least one file URL is required for file-type submissions"
               );
            }
            break;

         case SubmissionType.TEXT:
            if (!textContent || textContent.trim() === "") {
               throw new APIError(
                  400,
                  "Text content is required for text-type submissions"
               );
            }
            break;
      }

      // Check for duplicate submission
      const existingSubmission = await Submission.findOne({
         challengeId: new mongoose.Types.ObjectId(challengeId),
         candidateId: new mongoose.Types.ObjectId(candidateId),
      });

      if (existingSubmission) {
         throw new APIError(
            409,
            "You have already submitted for this challenge"
         );
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

      // Populate references
      await submission.populate([
         { path: "challengeId", select: "title category difficulty" },
         { path: "candidateId", select: "name email" },
      ]);

      res.status(201).json({
         success: true,
         message: "Submission created successfully",
         data: submission,
      });
   } catch (error: any) {
      if (error instanceof APIError) {
         res.status(error.status).json({
            success: false,
            message: error.message,
         });
      } else if (error.code === 11000) {
         // Duplicate key error
         res.status(409).json({
            success: false,
            message: "You have already submitted for this challenge",
         });
      } else if (error.name === "ValidationError") {
         res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: Object.values(error.errors).map((e: any) => e.message),
         });
      } else {
         console.error("Create submission error:", error);
         res.status(500).json({
            success: false,
            message: "Failed to create submission",
            error: error.message,
         });
      }
   }
};

/**
 * Get all submissions for a specific challenge
 * GET /api/submissions/challenge/:id
 * Protected Route - Company/Challenger/Admin Only
 */
export const getSubmissionsByChallenge = async (
   req: Request,
   res: Response
): Promise<void> => {
   try {
      const { id } = req.params;

      // Validate challenge ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
         throw new APIError(400, "Invalid challenge ID");
      }

      // Get all submissions for this challenge
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
      if (error instanceof APIError) {
         res.status(error.status).json({
            success: false,
            message: error.message,
         });
      } else {
         console.error("Get submissions error:", error);
         res.status(500).json({
            success: false,
            message: "Failed to retrieve submissions",
            error: error.message,
         });
      }
   }
};

/**
 * Get a single submission by ID
 * GET /api/submissions/:id
 * Protected Route
 */
export const getSubmissionById = async (
   req: Request,
   res: Response
): Promise<void> => {
   try {
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
   } catch (error: any) {
      if (error instanceof APIError) {
         res.status(error.status).json({
            success: false,
            message: error.message,
         });
      } else {
         console.error("Get submission error:", error);
         res.status(500).json({
            success: false,
            message: "Failed to retrieve submission",
            error: error.message,
         });
      }
   }
};
