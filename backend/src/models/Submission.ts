import mongoose, { Document, Schema } from "mongoose";

// Enum for submission types
export enum SubmissionType {
   LINK = "link",
   FILE = "file",
   TEXT = "text",
}

// Interface for TypeScript
export interface ISubmission extends Document {
   challengeId: mongoose.Types.ObjectId;
   candidateId: mongoose.Types.ObjectId;
   videoExplanationUrl: string;
   submissionType: SubmissionType;
   linkUrl?: string;
   fileUrls?: string[];
   textContent?: string;
   aiScore: number;
   status: "pending" | "accepted" | "rejected";
   createdAt: Date;
   updatedAt: Date;
}

// Mongoose Schema
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
      videoExplanationUrl: {
         type: String,
         required: true,
         trim: true,
      },
      submissionType: {
         type: String,
         enum: Object.values(SubmissionType),
         required: true,
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
      status: {
         type: String,
         enum: ["pending", "accepted", "rejected"],
         default: "pending",
      },
   },
   {
      timestamps: true,
   }
);

SubmissionSchema.index({ challengeId: 1, candidateId: 1 }, { unique: true });

export default mongoose.model<ISubmission>("Submission", SubmissionSchema);
