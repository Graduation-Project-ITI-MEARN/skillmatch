import mongoose, { Schema, Document } from "mongoose";

export interface IChallenge extends Document {
   title: string;
   description: string;
   difficulty: "easy" | "medium" | "hard";
   category: string;
   creatorId: mongoose.Types.ObjectId;
   status: "draft" | "published" | "closed";
   type: "job" | "prize";
   tags?: string[];
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
      tags: [{ type: String }],
   },
   {
      timestamps: true,
   }
);

export default mongoose.model<IChallenge>("Challenge", ChallengeSchema);
