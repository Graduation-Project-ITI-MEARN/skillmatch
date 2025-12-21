import { Request, Response } from "express";
import Activity from "../models/Activity";
import { catchError } from "../utils/catchAsync";

/**
 * @desc    Get recent activity logs
 * @route   GET /api/activity
 * @access  Private
 */
export const getRecentActivity = catchError(
   async (req: Request, res: Response) => {
      const user = (req as any).user;
      let query;

      // Admin sees ALL logs. Users see ONLY their own logs.
      if (user.role === "admin") {
         query = Activity.find();
      } else {
         query = Activity.find({ userId: user._id });
      }

      // Check for advancedResults middleware (if your project uses it)
      if ((res as any).advancedResults) {
         return res.status(200).json((res as any).advancedResults);
      }

      // Standard Fallback: Sort by newest, limit to 20
      const logs = await query
         .sort({ createdAt: -1 })
         .limit(20)
         .populate("userId", "name email");

      res.status(200).json({
         success: true,
         count: logs.length,
         data: logs,
      });
   }
);
