import mongoose, { Schema, Document } from "mongoose";

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
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Schema
const SubmissionSchema: Schema = new Schema(
  {
    challengeId: {
      type: Schema.Types.ObjectId,
      ref: "Challenge",
      required: [true, "Challenge ID is required"],
      index: true,
    },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Candidate ID is required"],
      index: true,
    },
    videoExplanationUrl: {
      type: String,
      required: [true, "Video explanation is mandatory for all submissions"],
      trim: true,
    },
    submissionType: {
      type: String,
      enum: Object.values(SubmissionType),
      required: [true, "Submission type is required"],
    },
    linkUrl: {
      type: String,
      trim: true,
      validate: {
        validator: function (this: ISubmission, value: string) {
          if (this.submissionType === SubmissionType.LINK) {
            return !!value && value.length > 0;
          }
          return true;
        },
        message: 'Link URL is required when submission type is "link"',
      },
    },
    fileUrls: {
      type: [String],
      default: [],
      validate: {
        validator: function (this: ISubmission, value: string[]) {
          if (this.submissionType === SubmissionType.FILE) {
            return value && value.length > 0;
          }
          return true;
        },
        message: 'At least one file is required when submission type is "file"',
      },
    },
    textContent: {
      type: String,
      trim: true,
      validate: {
        validator: function (this: ISubmission, value: string) {
          if (this.submissionType === SubmissionType.TEXT) {
            return !!value && value.length > 0;
          }
          return true;
        },
        message: 'Text content is required when submission type is "text"',
      },
    },
    aiScore: {
      type: Number,
      default: 0,
      min: [0, "AI score cannot be negative"],
      max: [100, "AI score cannot exceed 100"],
    },
  },
  {
    timestamps: true,
  }
);

SubmissionSchema.index({ challengeId: 1, candidateId: 1 }, { unique: true });

export default mongoose.model<ISubmission>("Submission", SubmissionSchema);
