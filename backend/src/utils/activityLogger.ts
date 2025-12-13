import Activity from "../models/Activity";
import mongoose from "mongoose";

export const logActivity = async (
  userId: string | mongoose.Types.ObjectId,
  action: string,
  details: string,
  targetId?: string | mongoose.Types.ObjectId
) => {
  try {
    await Activity.create({
      userId,
      action,
      details,
      targetId,
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
    // Fail silently so we don't stop the main user action
  }
};
