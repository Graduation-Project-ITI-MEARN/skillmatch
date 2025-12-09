import Notification from "../models/Notification";
import mongoose from "mongoose";

/**
 * Internal helper to send a notification.
 * Triggered by other controllers (Payment, Submission, etc).
 */
export const sendNotification = async (
  userId: string | mongoose.Types.ObjectId,
  title: string,
  message: string,
  type: "info" | "success" | "warning" | "error" = "info",
  link?: string
) => {
  // We don't use try/catch here because if this fails,
  // we usually want to log it but not crash the main request.
  // However, since it's an async helper, we just await creation.
  await Notification.create({
    userId,
    title,
    message,
    type,
    link,
  });
};
