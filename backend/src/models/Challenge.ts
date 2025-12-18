import mongoose, { Schema, Document } from "mongoose";

export interface IChallenge extends Document {
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  creatorId: mongoose.Types.ObjectId;
  status: "draft" | "published" | "closed";
  type: "job" | "prize";
  prizeAmount?: number;
  currency?: string;
  skills?: string[];
  winner?: mongoose.Types.ObjectId;
  winnerScore?: number;
  deadline?: Date;
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
    prizeAmount: { type: Number, default: 0 },
    currency: { type: String, default: "EGP" },
    skills: { type: [String], default: [] },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    winnerScore: { type: Number },
    deadline: { type: Date },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IChallenge>("Challenge", ChallengeSchema);
