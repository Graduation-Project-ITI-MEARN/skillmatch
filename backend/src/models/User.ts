import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

// User Interface Definition
export interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  role: string;
  type?: "candidate" | "company";
}

// Mongoose Schema
const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String },
    role: { type: String, default: "user" },
    type: { type: String, enum: ["candidate", "company"] },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

/**
 * Pre-save Middleware
 * Hashes the password before saving a new user or updating a password.
 */
UserSchema.pre("save", async function (next: any) {
  // Cast 'this' to the IUser interface to access custom fields safely
  const user = this as unknown as IUser;

  // Only hash the password if it has been modified (or is new)
  if (!user.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

export default mongoose.model<IUser>("User", UserSchema);
