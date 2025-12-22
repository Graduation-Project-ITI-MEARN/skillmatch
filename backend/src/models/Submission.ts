import mongoose, { Document, Schema } from "mongoose";

// Enum for submission types
export enum SubmissionType {
   LINK = "link",
   FILE = "file",
   TEXT = "text",
}

export interface ISubmission extends Document {
   challengeId: mongoose.Types.ObjectId;
   candidateId: mongoose.Types.ObjectId;
   videoExplanationUrl: string;
   submissionType?: SubmissionType; // Make optional if 'started' submissions don't have it yet
   linkUrl?: string;
   fileUrls?: string[];
   textContent?: string;
   aiScore: number;
   isWinner: boolean;
   status: "started" | "pending" | "accepted" | "rejected"; // <-- Add "started"
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
      videoExplanationUrl: {
         type: String,
         // required: true, // <-- Make this not required for 'started' status
         trim: true,
      },
      submissionType: {
         type: String,
         enum: Object.values(SubmissionType),
         // required: true, // <-- Make this not required for 'started' status
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
      isWinner: {
         type: Boolean,
         default: false,
      },
      status: {
         type: String,
         enum: ["started", "pending", "accepted", "rejected"], // <-- Update enum
         default: "started", // <-- Default to started when created
      },
   },
   {
      timestamps: true,
   }
);

SubmissionSchema.index({ challengeId: 1, candidateId: 1 }, { unique: true });

export default mongoose.model<ISubmission>("Submission", SubmissionSchema);
