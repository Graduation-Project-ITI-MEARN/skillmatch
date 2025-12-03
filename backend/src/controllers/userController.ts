import { Request, Response } from "express";
import User from "../models/User";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const getAllCandidates = async (req: Request, res: Response) => {
  try {
    const users = await User.find({ role: "candidate" });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const getAllCompanies = async (req: Request, res: Response) => {
  try {
    const users = await User.find({ role: "company" });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const getAllChallengers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({ role: "challenger" });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
