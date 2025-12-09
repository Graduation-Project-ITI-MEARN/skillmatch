import { Request, Response } from "express";
import Notification from "../models/Notification";

/**
 * @desc    Get logged-in user's notifications
 * @route   GET /api/notifications
 * @access  Private
 */
export const getMyNotifications = async (req: Request, res: Response) => {
  const user = (req as any).user;

  if ((res as any).advancedResults) {
    res.status(200).json((res as any).advancedResults);
    return;
  }

  const notifications = await Notification.find({ userId: user._id }).sort({
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    count: notifications.length,
    data: notifications,
  });
};

/**
 * @desc    Mark a single notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
export const markAsRead = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;

  const notification = await Notification.findById(id);

  if (!notification) {
    res.status(404).json({ message: "Notification not found" });
    return;
  }

  // Security Check: Ensure user owns this notification
  if (notification.userId.toString() !== user._id.toString()) {
    res
      .status(403)
      .json({ message: "Not authorized to access this notification" });
    return;
  }

  notification.isRead = true;
  await notification.save();

  res.status(200).json({ success: true, data: notification });
};

/**
 * @desc    Mark ALL notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
export const markAllAsRead = async (req: Request, res: Response) => {
  const user = (req as any).user;

  await Notification.updateMany(
    { userId: user._id, isRead: false },
    { $set: { isRead: true } }
  );

  res
    .status(200)
    .json({ success: true, message: "All notifications marked as read" });
};
