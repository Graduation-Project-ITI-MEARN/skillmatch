// src/models/Challenge.ts (Updated)
import mongoose, { Document, Schema } from "mongoose";
import { AIModel, PricingTier } from "../types/AIModels";

export interface IChallenge extends Document {
   title: string;
   description: string;
   difficulty: "easy" | "medium" | "hard";
   category: string;
   deadline: Date;
   creatorId: mongoose.Types.ObjectId;
   status: "draft" | "published" | "closed";
   type: "job" | "prize";
   submissionType: "link" | "file" | "text";
   prizeAmount?: number;
   salary?: number;
   additionalInfo?: string;
   tags?: string[];
   requirements: string;
   evaluationCriteria: string;
   deliverables: string;
   idealSolution?: {
      type: "link" | "file" | "text";
      value: string;
   };

   // NEW: AI Evaluation Configuration
   aiConfig: {
      pricingTier: PricingTier;
      selectedModel?: AIModel; // If custom tier
      autoEvaluate: boolean; // Auto-evaluate on submission
      requireVideoTranscript: boolean;
   };

   createdAt: Date;
   updatedAt: Date;
}

const ChallengeSchema: Schema = new Schema(
   {
      title: { type: String, required: true },
      description: { type: String, required: true },
      difficulty: {
         type: String,
         enum: ["easy", "medium", "hard"],
         required: true,
      },
      category: { type: String, required: true },
      creatorId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         required: true,
      },
      status: {
         type: String,
         enum: ["draft", "published", "closed"],
         default: "draft",
      },
      type: {
         type: String,
         enum: ["job", "prize"],
         required: true,
      },
      submissionType: {
         type: String,
         enum: ["link", "file", "text"],
         default: "link",
         required: true,
      },
      prizeAmount: { type: Number },
      salary: { type: Number },
      additionalInfo: { type: String },
      tags: [{ type: String }],
      requirements: { type: String, required: true },
      evaluationCriteria: { type: String, required: true },
      deliverables: { type: String, required: true },
      deadline: { type: Date, required: true },
      idealSolution: {
         type: {
            type: String,
            enum: ["link", "file", "text"],
         },
         value: { type: String },
      },
      // AI Configuration
      aiConfig: {
         pricingTier: {
            type: String,
            enum: Object.values(PricingTier),
            default: PricingTier.BALANCED,
            required: true,
         },
         selectedModel: {
            type: String,
            enum: Object.values(AIModel),
         },
         autoEvaluate: {
            type: Boolean,
            default: true,
         },
         requireVideoTranscript: {
            type: Boolean,
            default: true,
         },
      },
   },
   {
      timestamps: true,
   }
);

export default mongoose.model<IChallenge>("Challenge", ChallengeSchema);
