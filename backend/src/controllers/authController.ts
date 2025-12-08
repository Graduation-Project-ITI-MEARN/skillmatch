import { Request, Response } from "express";

import User from "../models/User";
import bcrypt from "bcryptjs";
import { catchError } from "../utils/catchAsync";

const jwt = require("jsonwebtoken");

/**
 * Generate JWT Token
 * @param id - The User ID
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
// In authController.ts, add a getMe method.
// Logic: Simply return req.user (response should be { success: true, data: user }).
// This is used by the frontend on page load to confirm who is logged in without re-entering credentials.

const getMe = catchError(async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

export { register, login, getMe };
