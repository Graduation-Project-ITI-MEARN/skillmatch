import { Request, Response } from "express";

import User from "../models/User";
import bcrypt from "bcryptjs";
import { catchError } from "../utils/catchAsync";
import crypto from "crypto";
import { generateOtpEmail } from "../utils/emailTemplates";
import { logActivity } from "../utils/activityLogger";
import sendEmail from "../utils/sendEmail";

const jwt = require("jsonwebtoken");

/**
 * Generates a JWT Token for authenticated sessions
 * @param id - The User ID
 * @param role - The User Role
 */
const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN ?? "3d",
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = catchError(async (req: Request, res: Response) => {
  const { email, password, name, type } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error("User already exists");
  }

  // Create new user (password hashing is handled in the model)
  const user = await User.create({
    email,
    password,
    name,
    type,
  });

  if (!user) {
    throw new Error("Invalid user data");
  }

  // Log Activity
  await logActivity(
    user._id,
    "user_registered",
    `User ${user.name} joined the platform.`,
    "success",
    user._id
  );

  res.status(201).json({
    success: true,
    token: generateToken(user._id.toString(), user.role),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: "user",
      type: user.type,
    },
  });
});

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = catchError(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Validate password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  // Log Activity
  await logActivity(
    user._id,
    "user_logged_in",
    `User ${user.name} logged in.`,
    "success",
    user._id
  );

  // Generate token & send response
  res.json({
    success: true,
    token: generateToken(user._id.toString(), user.role),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      type: user.type,
    },
  });
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = catchError(async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

/**
 * @desc    Forgot password - Send OTP
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = catchError(async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash OTP before saving
  const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

  user.resetOTP = hashedOTP;
  user.resetOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
  await user.save({ validateBeforeSave: false });

  // Send Email
  await sendEmail({
    to: user.email,
    subject: "Password Reset OTP",
    html: generateOtpEmail(otp, user.name || "User"),
  });

  res.status(200).json({
    success: true,
    message: "OTP sent to email",
  });
});

/**
 * @desc    Reset password using OTP
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = catchError(async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;

  const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

  const user = await User.findOne({
    email,
    resetOTP: hashedOTP,
    resetOTPExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error("Invalid or expired OTP");
  }

  user.password = newPassword;
  user.resetOTP = undefined;
  user.resetOTPExpires = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successful",
  });
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = catchError(async (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export { register, login, getMe, forgotPassword, resetPassword, logout };
