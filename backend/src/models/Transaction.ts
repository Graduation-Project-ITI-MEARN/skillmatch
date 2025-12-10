import mongoose, { Document, Schema } from "mongoose";

export interface ITransaction extends Document {
  user: mongoose.Types.ObjectId;
  type: "deposit" | "payout" | "escrow_hold" | "earn";
  amount: number;
  status: "pending" | "completed" | "failed";
  referenceId?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["deposit", "payout", "escrow_hold", "earn"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },

    referenceId: {
      type: String,
    },

    metadata: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITransaction>("Transaction", TransactionSchema);
