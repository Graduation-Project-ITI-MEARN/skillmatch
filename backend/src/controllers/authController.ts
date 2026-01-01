import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import { catchError } from "../utils/catchAsync";
import { logActivity } from "../utils/activityLogger";
import { sendNotification } from "../utils/notification";

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

   await sendNotification(
      user._id,
      "Welcome to skillmatch!",
      `Hi ${user.name}, welcome to skillmatch!`,
      "success"
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
         isVerified: user.isVerified,
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
         isVerified: user.isVerified,
         subscriptionStatus: user.subscriptionStatus,
         subscriptionPlan: user.subscriptionPlan,
         subscriptionExpiry: user.subscriptionExpiry,
      },
   });
});

/**
 * @desc    Log out
 * @route   GET /api/auth/logout
 * @access  Private
 */

const logout = (req: Request, res: Response) => {
   res.cookie("token", "none", {
      expires: new Date(Date.now() + 10 * 1000), // 10 seconds
      httpOnly: true,
   });
   res.status(200).json({ success: true, data: {} });
};

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

export { register, login, getMe, logout };
