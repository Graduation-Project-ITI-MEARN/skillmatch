import mongoose, { Schema, Document } from "mongoose";

export interface IActivity extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  targetId?: mongoose.Types.ObjectId;
  details: string;
  createdAt: Date;
}

const ActivitySchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: { type: String, required: true }, // e.g., 'user_registered', 'challenge_created'
    targetId: { type: Schema.Types.ObjectId }, // e.g., The ID of the challenge
    details: { type: String, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // We only need createdAt
  }
);

export default mongoose.model<IActivity>("Activity", ActivitySchema);
