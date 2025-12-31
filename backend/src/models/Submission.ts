// src/models/Submission.ts (Enhanced)
import mongoose, { Document, Schema } from "mongoose";

export enum SubmissionType {
   LINK = "link",
   FILE = "file",
   TEXT = "text",
}

export interface ISubmission extends Document {
   challengeId: mongoose.Types.ObjectId;
   candidateId: mongoose.Types.ObjectId;
   challengeCreator: mongoose.Types.ObjectId;
   videoExplanationUrl?: string; // Optional
   submissionType?: SubmissionType;
   linkUrl?: string;
   fileUrls?: string[];
   textContent?: string;

   // AI Evaluation Results
   aiScore: number;
   aiEvaluation?: {
      technicalScore: number;
      clarityScore: number;
      communicationScore: number;
      feedback: string;
      strengths: string[];
      improvements: string[];
      modelUsed: string;
      evaluatedAt: Date;
      videoTranscribed: boolean; // Whether video was actually transcribed
   };

   isWinner: boolean;
   status: "started" | "pending" | "accepted" | "rejected";
   createdAt: Date;
   updatedAt: Date;
}

const SubmissionSchema: Schema = new Schema(
   {
      challengeId: {
         type: Schema.Types.ObjectId,
         ref: "Challenge",
         required: true,
         index: true,
      },
      candidateId: {
         type: Schema.Types.ObjectId,
         ref: "User",
         required: true,
         index: true,
      },
      challengeCreator: {
         type: Schema.Types.ObjectId,
         ref: "User",
         required: true,
         index: true,
      },
      videoExplanationUrl: {
         type: String,
         trim: true,
      },
      submissionType: {
         type: String,
         enum: Object.values(SubmissionType),
      },
      linkUrl: {
         type: String,
         trim: true,
      },
      fileUrls: {
         type: [String],
         default: [],
      },
      textContent: {
         type: String,
         trim: true,
      },
      aiScore: {
         type: Number,
         default: 0,
         min: 0,
         max: 100,
      },
      aiEvaluation: {
         technicalScore: { type: Number, min: 0, max: 100 },
         clarityScore: { type: Number, min: 0, max: 100 },
         communicationScore: { type: Number, min: 0, max: 100 },
         feedback: { type: String },
         strengths: [{ type: String }],
         improvements: [{ type: String }],
         modelUsed: { type: String },
         evaluatedAt: { type: Date },
         videoTranscribed: { type: Boolean, default: false },
      },
      isWinner: {
         type: Boolean,
         default: false,
      },
      status: {
         type: String,
         enum: ["started", "pending", "accepted", "rejected"],
         default: "started",
      },
   },
   {
      timestamps: true,
   }
);

SubmissionSchema.index({ challengeId: 1, candidateId: 1 }, { unique: true });

export default mongoose.model<ISubmission>("Submission", SubmissionSchema);
