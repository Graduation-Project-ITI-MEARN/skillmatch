// models/User.ts

import mongoose, { Document, Schema } from "mongoose";

import { CATEGORIES } from "../controllers/metadataController";
import bcrypt from "bcryptjs";

// User Interface Definition
export interface IUser extends Document {
   email: string;
   password: string;
   name?: string;
   role: "user" | "admin";
   type?: "candidate" | "company" | "challenger";
   skills?: string[]; // Assuming skills are related to categories
   totalScore?: number;
   badges?: string[];
   isVerified?: boolean;
   verificationStatus?: "none" | "pending" | "verified" | "rejected";
   nationalId?: string;
   verificationDocument?: string;
   subscriptionStatus: "free" | "active" | "expired";
   subscriptionExpiry: Date | null;
   subscriptionPlan: {
      type: String;
      enum: ["basic", "professional", "enterprise"];
      default: null;
   };
   walletBalance: number;

  // --- NEW FIELDS FOR CANDIDATE PROFILE ---
  city?: string; // For both candidate and company
  bio?: string; // For both candidate and company
  github?: string;
  linkedin?: string;
  // Add an array for other social links, allowing flexibility
  otherLinks?: { name: string; url: string }[];
  categoriesOfInterest?: (typeof CATEGORIES)[number][]; // Array of categories

  // --- NEW FIELDS FOR COMPANY PROFILE ---
  website?: string;
  // bio and city are already covered above
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
    verificationStatus: {
      type: String,
      enum: ["none", "pending", "verified", "rejected"],
      default: "none",
    },
    resetOTP: { type: String },
    resetOTPExpires: { type: Date },

    nationalId: { type: String },
    verificationDocument: { type: String },

    // --- NEW SCHEMA FIELDS ---
    city: { type: String },
    bio: { type: String },
    github: { type: String },
    linkedin: { type: String },
    otherLinks: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    categoriesOfInterest: [{ type: String, enum: CATEGORIES }], // Array of categories

      website: { type: String }, // For companies
      subscriptionStatus: {
         type: String,
         enum: ["free", "active", "expired"],
         default: "free",
      },
      subscriptionPlan: {
         type: String,
         enum: ["basic", "professional", "enterprise"],
         default: null, // Remove the wrapping object
      },
      subscriptionExpiry: {
         type: Date,
         default: null,
      },
      walletBalance: {
         type: Number,
         default: 0,
      },
   },
   {
      timestamps: true,
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
