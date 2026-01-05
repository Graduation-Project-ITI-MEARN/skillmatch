// src/controllers/submissionController.ts
import { Request, Response } from "express";
import Submission, { ISubmission, SubmissionType } from "../models/Submission";
import Challenge from "../models/Challenge";
import APIError from "../utils/APIError";
import { catchError } from "../utils/catchAsync";
import { emitToUser } from "../socket/socketService";
import { logActivity } from "../utils/activityLogger";
import mongoose from "mongoose";
import { evaluateWithModel } from "../services/AIService";
import {
   transcribeVideo,
   isDirectVideoUrl,
} from "../services/videoTranscription";
import { getModelForChallenge } from "../services/AIService";
import {
   validateSubmission,
   validateGitHubLink,
   isFakeGitHubUrl,
} from "../services/validationService";
import { sendNotification } from "../utils/notification";
import { createSubmissionDTO } from "../DTO/submission";
import { ZodError } from "zod";

/**
 * @desc    Get submissions and started challenges for the logged-in candidate
 * @route   GET /api/submissions/mine
 * @access  Private (Candidate)
 */
const getMySubmissions = catchError(async (req: Request, res: Response) => {
   const user = req.user;
   if (!user) throw new APIError(401, "User not authenticated");

   const candidateSubmissions = await Submission.find({
      candidateId: new mongoose.Types.ObjectId(user._id),
   }).populate(
      "challengeId",
      "title category difficulty deadline submissionType aiConfig"
   );

   const startedChallenges = candidateSubmissions
      .filter((sub) => sub.status === "started" && sub.challengeId) // Add check for challengeId
      .map((sub) => ({
         _id: sub._id,
         challengeId: sub.challengeId,
         status: sub.status,
         createdAt: sub.createdAt,
         // Safely access deadline, provide a default or handle null if challengeId is missing
         deadline: (sub.challengeId as any)?.deadline || null,
         title: (sub.challengeId as any)?.title || "N/A",
         category: (sub.challengeId as any)?.category || "N/A",
         difficulty: (sub.challengeId as any)?.difficulty || "N/A",
      }));

   const activeSubmissions = candidateSubmissions
      .filter((sub) => sub.status !== "started" && sub.challengeId) // Add check for challengeId
      .map((sub) => {
         // Check if evaluation is still processing
         const isEvaluating = sub.status === "pending" && !sub.aiEvaluation;

         return {
            _id: sub._id,
            challengeId: sub.challengeId,
            status: sub.status,
            createdAt: sub.createdAt,
            // Safely access deadline, provide a default or handle null if challengeId is missing
            deadline: (sub.challengeId as any)?.deadline || null,
            title: (sub.challengeId as any)?.title || "N/A",
            category: (sub.challengeId as any)?.category || "N/A",
            difficulty: (sub.challengeId as any)?.difficulty || "N/A",
            aiScore: sub.aiScore,
            isWinner: sub.isWinner,

            // Evaluation status
            evaluationStatus: isEvaluating ? "evaluating" : "completed",
            aiEvaluation: isEvaluating ? null : sub.aiEvaluation,
         };
      });

   res.status(200).json({
      success: true,
      data: {
         startedChallenges,
         activeSubmissions,
      },
   });
});

/**
 * @desc    Candidate submits a solution (with automatic AI evaluation)
 * @route   POST /api/submissions
 * @access  Private (Candidate)
 */
const createSubmission = catchError(async (req: Request, res: Response) => {
   console.log("--------------- START createSubmission ---------------");

   try {
      // <--- ADDED: Top-level try-catch for better internal logging
      console.log("1. req.body (after Multer):", req.body);
      console.log("2. req.files (after Multer):", req.files);
      console.log("3. req.user (authenticated user):", req.user); // Check if req.user is populated

      // Text fields are in req.body
      const { submissionId, submissionType, linkUrl, textContent } = req.body;

      const uploadedFiles = req.files as {
         videoExplanationFile?: Express.Multer.File[];
         file?: Express.Multer.File[];
      };

      const candidateId = req.user?._id;
      // The auth middleware should handle this, but an extra check for robust logging
      if (!candidateId)
         throw new APIError(401, "User not authenticated - (Internal Check)");
      console.log("4. Candidate ID:", candidateId);

      if (!submissionId)
         throw new APIError(400, "Submission ID is required in request body.");
      console.log("5. Submission ID:", submissionId);

      let submission: ISubmission | null = await Submission.findById(
         submissionId
      );
      console.log(
         "6. Found Submission:",
         submission ? submission._id : "Not Found"
      );

      if (!submission) {
         throw new APIError(
            404,
            "Submission not found or you must start the challenge first."
         );
      }
      if (submission.candidateId.toString() !== candidateId.toString()) {
         throw new APIError(403, "Not authorized to modify this submission.");
      }
      if (submission.status !== "started") {
         throw new APIError(
            409,
            "You have already submitted for this challenge."
         );
      }

      const challenge = await Challenge.findById(submission.challengeId);
      console.log(
         "7. Found Challenge:",
         challenge ? challenge._id : "Not Found"
      );
      console.log("8. Challenge AI Config:", challenge?.aiConfig); // <--- CRITICAL: Check this output
      if (!challenge) throw new APIError(404, "Associated challenge not found");

      // --- BASIC VALIDATION (before Zod) ---
      if (!submissionType)
         throw new APIError(400, "Submission type is required");
      console.log("9. Submission Type:", submissionType);

      // Clear previous submission-related fields to avoid stale data
      submission.linkUrl = undefined;
      submission.fileUrls = [];
      submission.textContent = undefined;
      submission.videoExplanationUrl = undefined; // Also clear video URL initially

      let finalLinkUrl: string | undefined;
      let finalFileUrls: string[] = [];
      let finalTextContent: string | undefined;
      let finalVideoExplanationUrl: string | undefined;

      console.log("10. Starting submission type specific processing...");
      switch (submissionType) {
         case SubmissionType.LINK:
            if (!linkUrl?.trim()) throw new APIError(400, "Link URL required");
            // ... (fake GitHub URL check) ...
            if (linkUrl.includes("github.com")) {
               const githubValidation = await validateGitHubLink(linkUrl); // <--- Error likely originates from within this function call
               if (!githubValidation.isValid) {
                  // <--- Or this line, throwing the APIError
                  throw new APIError(400, githubValidation.message); // THIS IS THE APIError YOU ARE SEEING
               }
               if (githubValidation.repoData?.warnings?.length > 0) {
                  console.log(
                     "⚠️  GitHub warnings:",
                     githubValidation.repoData.warnings
                  );
               }
            }
            finalLinkUrl = linkUrl.trim();
            console.log("10a. Processed Link URL:", finalLinkUrl);
            break;

         case SubmissionType.FILE:
            const projectFile = uploadedFiles.file?.[0];
            if (!projectFile)
               throw new APIError(
                  400,
                  "Project file required for file submission type."
               );
            finalFileUrls = [projectFile.path]; // Multer-Cloudinary stores the URL in `file.path`
            console.log("10b. Processed Project File URL:", finalFileUrls);
            break;

         case SubmissionType.TEXT:
            if (!textContent?.trim())
               throw new APIError(400, "Text content required");
            finalTextContent = textContent.trim();
            console.log("10c. Processed Text Content:", finalTextContent);
            break;

         default:
            throw new APIError(400, "Invalid submission type provided.");
      }

      // --- VIDEO EXPLANATION HANDLING ---
      // Use optional chaining for aiConfig and then requireVideoTranscript
      const requireVideoTranscript =
         challenge?.aiConfig?.requireVideoTranscript;
      const videoFile = uploadedFiles.videoExplanationFile?.[0];
      console.log(
         "11. Requires Video Transcript (Challenge config):",
         requireVideoTranscript
      );
      console.log(
         "12. Video File Uploaded:",
         videoFile ? videoFile.path : "None"
      );

      if (requireVideoTranscript) {
         if (!videoFile) {
            throw new APIError(
               400,
               "Video explanation file is required for this challenge."
            );
         }
         finalVideoExplanationUrl = videoFile.path; // Set the Cloudinary URL
         console.log(
            "12a. Final Video URL (Required):",
            finalVideoExplanationUrl
         );
      } else {
         finalVideoExplanationUrl = undefined; // Explicitly set to undefined if not required
         console.log(
            "12b. Final Video URL (Not Required):",
            finalVideoExplanationUrl
         );
      }

      // --- FINAL ZOD VALIDATION ---
      const submissionDataForValidation = {
         challengeId: challenge._id.toString(),
         candidateId: candidateId.toString(),
         videoExplanationUrl: finalVideoExplanationUrl,
         submissionType: submissionType,
         linkUrl: finalLinkUrl,
         fileUrls: finalFileUrls,
         textContent: finalTextContent,
         // aiScore is default/optional in DTO, no need to include here for creation
         // Ensure all properties match your createSubmissionDTO schema
      };
      console.log("13. Data for Zod Validation:", submissionDataForValidation);

      try {
         createSubmissionDTO.parse(submissionDataForValidation); // Validate the *processed* data
         console.log("14. Zod Validation PASSED.");
      } catch (error: any) {
         if (error instanceof ZodError) {
            console.error("14. Zod Validation FAILED:", error.message);
            throw new APIError(
               400,
               "Submission validation failed (Zod)",
               error.message
            );
         }
         console.error("14. Unexpected error during Zod validation:", error);
         throw error; // Re-throw other errors
      }

      // --- Update submission in DB with validated data ---
      submission.linkUrl = finalLinkUrl;
      submission.fileUrls = finalFileUrls;
      submission.textContent = finalTextContent;
      submission.videoExplanationUrl = finalVideoExplanationUrl;
      submission.status = "pending";
      submission.aiScore = 0; // Reset score on new submission
      console.log("15. Saving Submission to DB:", submission._id);

      await submission.save();
      console.log("16. Submission SAVED.");

      // Log activity
      await logActivity(
         candidateId,
         "submission_created",
         `User submitted solution for challenge: ${challenge.title}`,
         "success",
         submission._id
      );
      console.log("17. Activity Logged.");

      // Populate for response
      await submission.populate([
         { path: "challengeId", select: "title category difficulty" },
         { path: "candidateId", select: "name email" },
      ]);
      console.log("18. Submission Populated for response.");

      // Start AI evaluation asynchronously (don't wait)
      if (challenge.aiConfig?.autoEvaluate) {
         console.log("19. Starting AI evaluation asynchronously...");
         evaluateSubmissionAsync(submission._id.toString(), challenge);
      } else {
         console.log("19. AI evaluation not set to auto-evaluate.");
      }

      res.status(200).json({
         success: true,
         data: submission,
         message:
            "Solution submitted successfully! AI evaluation in progress...",
      });
      console.log(
         "--------------- END createSubmission (SUCCESS) ---------------"
      );
   } catch (err: any) {
      // <--- This catch block will now log ANY error that occurs within the controller
      console.error(
         "--------------- ERROR in createSubmission ---------------"
      );
      console.error("Caught internal error (full trace):", err); // Log the full error for debugging
      console.error("-------------------------------------------------------");
      // Re-throw the error so the outer `catchError` utility can still process it
      // and send the appropriate APIError response to the frontend.
      throw err;
   }
});

/**
 * Async function to evaluate submission in background
 */
async function evaluateSubmissionAsync(submissionId: string, challenge: any) {
   try {
      console.log(`🤖 Starting AI evaluation for submission: ${submissionId}`);

      const submission = await Submission.findById(submissionId);
      if (!submission) return;

      // 1. Transcribe video if available and required
      let videoTranscript = "";
      let videoTranscribed = false;

      if (
         challenge.aiConfig?.requireVideoTranscript &&
         submission.videoExplanationUrl &&
         isDirectVideoUrl(submission.videoExplanationUrl)
      ) {
         try {
            console.log("📹 Transcribing video...");
            const transcription = await transcribeVideo(
               submission.videoExplanationUrl
            );
            videoTranscript = transcription.text;
            videoTranscribed = true;
            console.log("✅ Video transcribed successfully");
         } catch (error) {
            console.error("⚠️  Video transcription failed:", error);
         }
      }

      // 2. Run comprehensive validation
      console.log("🔍 Running validation checks...");
      const validation = await validateSubmission(
         {
            linkUrl: submission.linkUrl,
            textContent: submission.textContent,
            videoTranscript,
         },
         {
            title: challenge.title,
            description: challenge.description,
            category: challenge.category,
         }
      );

      // 3. Handle validation results
      if (!validation.isValid) {
         console.log("❌ Validation failed:", validation.issues);

         submission.aiEvaluation = {
            technicalScore: 0,
            clarityScore: 0,
            communicationScore: 0,
            feedback: `Submission validation failed: ${validation.issues.join(
               ". "
            )}`,
            strengths: [],
            improvements: ["Address validation issues and resubmit"],
            modelUsed: "validation",
            evaluatedAt: new Date(),
            videoTranscribed: false,
         };

         submission.status = "rejected";
         await submission.save();

         // Notify candidate
         sendNotification(
            submission.candidateId.toString(),
            "Submission Validation Failed",
            `Your submission for "${
               challenge.title
            }" failed validation. Please address the following issues: ${validation.issues.join(
               ". "
            )}`
         );

         return;
      }

      // Show warnings if any
      if (validation.warnings.length > 0) {
         console.log("⚠️  Validation warnings:", validation.warnings);
      }

      // 4. Prepare submission content
      let submissionContent = "";
      if (submission.linkUrl) {
         submissionContent = `GitHub/Project Link: ${submission.linkUrl}`;
      }
      if (submission.textContent) {
         submissionContent += `\n\nCandidate's Explanation:\n${submission.textContent}`;
      }
      if (submission.fileUrls && submission.fileUrls.length > 0) {
         submissionContent += `\n\nFile URLs: ${submission.fileUrls.join(
            ", "
         )}`;
      }

      // Add validation context
      if (validation.plagiarismScore > 0) {
         submissionContent += `\n\n**Note:** Plagiarism check score: ${validation.plagiarismScore}% (for context)`;
      }

      // 5. Add ideal solution for comparison (if provided)
      let idealSolutionContext = "";
      if (challenge.idealSolution) {
         idealSolutionContext = `

**Ideal Solution (For Comparison):**
Type: ${challenge.idealSolution.type}
Solution: ${challenge.idealSolution.value}

Please compare the candidate's submission against this ideal solution. Consider:
- How close is their approach to the ideal?
- What aspects did they implement well?
- What could be improved to match the ideal solution?
`;
      }

      // 6. Determine AI model to use
      const selectedModel = getModelForChallenge(
         challenge.aiConfig?.pricingTier || "free",
         challenge.aiConfig?.selectedModel
      );

      console.log(`🎯 Using AI Model: ${selectedModel}`);

      // 7. Evaluate with AI
      const evaluationResult = await evaluateWithModel({
         challengeTitle: challenge.title,
         challengeDescription: challenge.description,
         difficulty: challenge.difficulty,
         category: challenge.category,
         tags: challenge.tags || [],
         submissionContent: submissionContent + idealSolutionContext,
         videoTranscript,
         selectedModel,
      });

      // 8. Adjust scores based on plagiarism
      let finalTechnicalScore = evaluationResult.technicalScore;
      if (validation.plagiarismScore > 60) {
         finalTechnicalScore = Math.max(
            0,
            finalTechnicalScore - (validation.plagiarismScore - 60)
         );
         evaluationResult.improvements.push(
            "Submission shows signs of plagiarism. Ensure all work is original."
         );
      }

      // 9. Update submission with results
      submission.aiScore = Math.round(
         (finalTechnicalScore +
            evaluationResult.clarityScore +
            evaluationResult.communicationScore) /
            3
      );

      submission.aiEvaluation = {
         technicalScore: finalTechnicalScore,
         clarityScore: evaluationResult.clarityScore,
         communicationScore: evaluationResult.communicationScore,
         feedback: evaluationResult.feedback,
         strengths: evaluationResult.strengths,
         improvements: evaluationResult.improvements,
         modelUsed: evaluationResult.modelUsed,
         evaluatedAt: new Date(),
         videoTranscribed,
      };

      submission.status = "accepted";

      await submission.save();

      console.log(`✅ Evaluation complete! Score: ${submission.aiScore}`);

      // 10. Notify candidate via socket
      sendNotification(
         submission.candidateId.toString(),
         "Submission Evaluated",
         `Your submission for "${challenge.title}" has been evaluated. Score: ${submission.aiScore}`
      );

      if (submission.aiScore >= Number(process.env.MIN_AI_SCORE)) {
         // 11. Notify challenge creator via socket
         sendNotification(
            challenge.creatorId.toString(),
            "Submission Evaluated",
            `A submission for "${challenge.title}" has been evaluated. Score: ${submission.aiScore}`
         );
      }
   } catch (error) {
      console.error("❌ Evaluation failed:", error);

      // Update submission to show evaluation failed
      const submission = await Submission.findById(submissionId);
      if (submission) {
         submission.aiEvaluation = {
            technicalScore: 0,
            clarityScore: 0,
            communicationScore: 0,
            feedback: "Evaluation failed. Please contact support.",
            strengths: [],
            improvements: [],
            modelUsed: "error",
            evaluatedAt: new Date(),
            videoTranscribed: false,
         };
         await submission.save();
      }
   }
}

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

   // Check if still evaluating
   const isEvaluating =
      submission.status === "pending" && !submission.aiEvaluation;

   res.status(200).json({
      success: true,
      data: {
         ...submission.toObject(),
         evaluationStatus: isEvaluating ? "evaluating" : "completed",
      },
   });
});

/**
 * @desc    Get all submissions (Admin/General use)
 * @route   GET /api/submissions
 * @access  Private (Admin)
 */
const getAllSubmissions = catchError(async (req: Request, res: Response) => {
   const submissions = await Submission.find()
      .populate("candidateId", "name email")
      .populate("challengeId", "title category difficulty");

   res.status(200).json({
      success: true,
      data: submissions,
   });
});

/**
 * @desc    Get submissions for a specific challenge
 * @route   GET /api/submissions/challenge/:id
 * @access  Private (Company/Admin)
 */
const getSubmissionsByChallenge = catchError(
   async (req: Request, res: Response) => {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
         throw new APIError(400, "Invalid challenge ID");
      }

      // Get the minimum AI score threshold from environment variables
      // Ensure it's parsed as an integer. Default to 0 if not set or invalid.
      const minAiScore = parseInt(process.env.MIN_AI_SCORE || "0", 10);

      // Construct the query object
      const query = {
         challengeId: id,
         // Filter for submissions where aiScore is greater than the defined minimum
         // This implicitly handles "evaluated submissions" as non-evaluated ones
         // typically have an aiScore of 0 or are missing the field.
         aiScore: { $gt: minAiScore },
      };

      const submissions = await Submission.find(query)
         .populate("candidateId", "name email profilePicture")
         .populate("challengeId", "title category difficulty")
         .sort({ aiScore: -1 });

      res.status(200).json({
         success: true,
         count: submissions.length,
         data: submissions,
      });
   }
);

/**
 * @desc    Update submission status
 * @route   PATCH /api/submissions/:id/status
 * @access  Private (Company/Admin)
 */
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

      // Real-time notification
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

   // Check if challenge exists and is published
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
      challengeCreator: challenge.creatorId,
      status: "started",
   });

   await logActivity(
      candidateId,
      "challenge_started",
      `User started challenge: ${challenge.title}`,
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

// Export all functions
export {
   getAllSubmissions,
   getMySubmissions,
   createSubmission,
   getSubmissionsByChallenge,
   getSubmissionById,
   updateSubmissionStatus,
   startChallenge,
};
