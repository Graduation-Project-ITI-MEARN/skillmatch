import { NextFunction, Request, Response } from "express";

import Challenge from "../models/Challenge";
import Report from "../models/Report";
import Submission from "../models/Submission";
import User from "../models/User";
import { catchError } from "../utils/catchAsync";

/**
 * @desc    Create a new report (Flag content)
 * @route   POST /api/moderation/report
 * @access  Private (Any authenticated user)
 */

const createReport = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    const { targetType, targetId, reason } = req.body;

    // Validate required fields
    if (!targetType || !targetId || !reason) {
      return res.status(400).json({
        success: false,
        message: "Target type, target ID, and reason are required",
      });
    }

    // Validate targetType
    if (!["challenge", "submission", "user"].includes(targetType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid target type. Must be challenge, submission, or user",
      });
    }

    // Verify that target exists
    let targetExists = false;
    switch (targetType) {
      case "challenge":
        targetExists = !!(await Challenge.findById(targetId));
        break;
      case "submission":
        targetExists = !!(await Submission.findById(targetId));
        break;
      case "user":
        targetExists = !!(await User.findById(targetId));
        break;
    }

    if (!targetExists) {
      return res.status(404).json({
        success: false,
        message: `${targetType} not found`,
      });
    }

    // Prevent users from reporting themselves
    if (targetType === "user" && targetId === user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot report yourself",
      });
    }

    // Check if user already reported this content
    const existingReport = await Report.findOne({
      reporterId: user._id,
      targetType,
      targetId,
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: "You have already reported this content",
      });
    }

    // Create report
    const report = await Report.create({
      reporterId: user._id,
      targetType,
      targetId,
      reason,
    });

    // Populate reporter info
    await report.populate("reporterId", "name email");

    res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      data: report,
    });
  }
);

/**
 * @desc    Get all reports (with pagination)
 * @route   GET /api/moderation
 * @access  Private (Admin only)
 */
const getReports = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    // advancedResults middleware will handle the query
    // This is just for reference
    res.status(200).json(res.advancedResults);
  }
);

/**
 * @desc    Resolve a report
 * @route   PUT /api/moderation/:id/resolve
 * @access  Private (Admin only)
 */
const resolveReport = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status, adminNotes, action } = req.body;

    // Validate status
    if (!status || !["resolved", "dismissed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'resolved' or 'dismissed'",
      });
    }

    // Find report
    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Check if already resolved
    if (report.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Report is already ${report.status}`,
      });
    }

    // Update report status
    report.status = status;
    if (adminNotes) {
      report.adminNotes = adminNotes;
    }
    await report.save();

    // Optional: Take action on the reported content
    if (status === "resolved" && action) {
      await performModerationAction(report, action);
    }

    // Populate related data
    await report.populate([
      { path: "reporterId", select: "name email" },
      { path: "targetId" },
    ]);

    res.status(200).json({
      success: true,
      message: `Report ${status} successfully`,
      data: report,
    });
  }
);

/**
 * @desc    Get report statistics
 * @route   GET /api/moderation/stats
 * @access  Private (Admin only)
 */
const getModerationStats = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
    const stats = await Report.aggregate([
      {
        $facet: {
          byStatus: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
              },
            },
          ],
          byTargetType: [
            {
              $group: {
                _id: "$targetType",
                count: { $sum: 1 },
              },
            },
          ],
          total: [
            {
              $count: "count",
            },
          ],
          pending: [
            {
              $match: { status: "pending" },
            },
            {
              $count: "count",
            },
          ],
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        byStatus: stats[0].byStatus,
        byTargetType: stats[0].byTargetType,
        total: stats[0].total[0]?.count || 0,
        pending: stats[0].pending[0]?.count || 0,
      },
    });
  }
);

/**
 * Helper function to perform moderation actions
 * (Optional: Can be expanded based on requirements)
 */
async function performModerationAction(
  report: any,
  action: "hide" | "ban" | "delete"
) {
  switch (report.targetType) {
    case "challenge":
      if (action === "hide" || action === "delete") {
        await Challenge.findByIdAndUpdate(report.targetId, {
          status: "archived",
        });
      }
      break;

    case "submission":
      if (action === "hide" || action === "delete") {
        await Submission.findByIdAndUpdate(report.targetId, {
          status: "rejected",
        });
      }
      break;

    case "user":
      if (action === "ban") {
        await User.findByIdAndUpdate(report.targetId, {
          isActive: false,
        });
      }
      break;
  }
}

export { createReport, getReports, resolveReport, getModerationStats };
