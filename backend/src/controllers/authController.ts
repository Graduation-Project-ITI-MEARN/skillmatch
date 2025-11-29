import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * Generate JWT Token
 * @param id - The User ID
 */
const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: "1d",
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, type } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    // Create new user (password hashing is handled in the Model)
    const user = await User.create({
      email,
      password,
      name,
      type,
    });

    if (user) {
      res.status(201).json({
        success: true,
        token: generateToken(user._id.toString()),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          type: user.type,
        },
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    // Validate password
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        success: true,
        token: generateToken(user._id.toString()),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          type: user.type,
        },
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
