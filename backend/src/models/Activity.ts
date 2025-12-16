import mongoose, { Schema, Document } from "mongoose";

export interface IActivity extends Document {
   userId: mongoose.Types.ObjectId;
   action: string;
   details: string;
   targetId?: mongoose.Types.ObjectId;
   type: "info" | "success" | "warning" | "error";
   createdAt: Date;
}

const ActivitySchema: Schema = new Schema(
   {
      userId: {
         type: Schema.Types.ObjectId,
         ref: "User",
         required: true,
      },
      action: { type: String, required: true },
      details: { type: String, required: true },
      targetId: { type: Schema.Types.ObjectId },
      type: {
         type: String,
         enum: ["info", "success", "warning", "error"],
         default: "info",
      },
   },
   {
      timestamps: { createdAt: true, updatedAt: false }, // We only need createdAt
   }
);

export default mongoose.model<IActivity>("Activity", ActivitySchema);
