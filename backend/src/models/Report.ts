import mongoose, { Schema, Document } from "mongoose";

/**
 * Report Interface
 *  (Challenge, Submission, أو User)
 */
export interface IReport extends Document {
   reporterId: mongoose.Types.ObjectId;
   targetType: "Challenge" | "Submission" | "User";
   targetId: mongoose.Types.ObjectId;
   reason: string;
   status: "pending" | "resolved" | "dismissed";
   adminNotes?: string;
   createdAt: Date;
   updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
   {
      reporterId: {
         type: Schema.Types.ObjectId,
         ref: "User",
         required: [true, "Reporter ID is required"],
      },

      targetType: {
         type: String,
         enum: {
            values: ["Challenge", "Submission", "User"],
            message: "Target type must be challenge, submission, or user",
         },
         required: [true, "Target type is required"],
      },

      targetId: {
         type: Schema.Types.ObjectId,
         required: [true, "Target ID is required"],
         // Dynamic ref based on targetType
         refPath: "targetType",
      },

      reason: {
         type: String,
         required: [true, "Reason is required"],
         trim: true,
         minlength: [10, "Reason must be at least 10 characters"],
         maxlength: [500, "Reason cannot exceed 500 characters"],
      },

      status: {
         type: String,
         enum: {
            values: ["pending", "resolved", "dismissed"],
            message: "Status must be pending, resolved, or dismissed",
         },
         default: "pending",
      },

      adminNotes: {
         type: String,
         trim: true,
         maxlength: [1000, "Admin notes cannot exceed 1000 characters"],
      },
   },
   {
      timestamps: true,
   }
);

reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ reporterId: 1 });
reportSchema.index({ targetType: 1, targetId: 1 });

reportSchema.index(
   { reporterId: 1, targetType: 1, targetId: 1 },
   { unique: true }
);

const Report = mongoose.model<IReport>("Report", reportSchema);

export default Report;
