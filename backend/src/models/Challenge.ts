import mongoose, { Document, Schema } from "mongoose";

export interface IChallenge extends Document {
   title: string;
   description: string;
   difficulty: "easy" | "medium" | "hard";
   category: string;
   deadline: Date;
   creatorId: mongoose.Types.ObjectId;
   status: "draft" | "published" | "closed";
   type: "job" | "prize";
   prizeAmount?: number;
   salary?: number;
   additionalInfo?: string;
   tags?: string[];
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
      prizeAmount: { type: Number },
      salary: { type: Number },
      additionalInfo: { type: String },
      tags: [{ type: String }],
      deadline: { type: Date, required: true },
   },
   {
      timestamps: true,
   }
);

export default mongoose.model<IChallenge>("Challenge", ChallengeSchema);
