import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

// User Interface Definition
export interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  role: "user" | "admin";
  type?: "candidate" | "company" | "challenger";
  skills?: string[];
  totalScore?: number;
  badges?: string[];
  isVerified?: boolean;
  verificationStatus?: "none" | "pending" | "verified" | "rejected";
  nationalId?: string;
  verificationDocument?: string;
}

// Mongoose Schema
const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String },
    role: { type: String, default: "user" },
    type: { type: String, enum: ["candidate", "company", "challenger"] },
    skills: [{ type: String }],
    totalScore: { type: Number, default: 0 },
    badges: [{ type: String }],
    isVerified: { type: Boolean, default: false },
    // Added for Verification Task
    verificationStatus: {
      type: String,
      enum: ["none", "pending", "verified", "rejected"],
      default: "none",
    },
    nationalId: { type: String },
    verificationDocument: { type: String },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

/**
 * Pre-save Middleware
 * Hashes the password before saving a new user or updating a password.
 */
UserSchema.pre("save", async function () {
  const user = this as unknown as IUser;

  // Only hash the password if it has been modified
  if (!user.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
});

export default mongoose.model<IUser>("User", UserSchema);
