import { Request, Response, NextFunction } from "express";
import APIError from "../utils/APIError";
import User from "../models/User"; // Import your User model

/**
 * @desc    Middleware to ensure the authenticated user is verified
 * @param   allowedTypes (optional) - An array of user types for which verification is required.
 *          If not provided, verification is required for all types that go through this middleware.
 *          e.g., ['company', 'challenger'] for challenge creation.
 */
export const requireVerification =
   (allowedTypes?: Array<"candidate" | "company" | "challenger">) =>
   async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
         return next(new APIError(401, "Not authorized"));
      }

      // Fetch the latest user data to ensure 'isVerified' is up-to-date
      // This is important because the 'req.user' object might be from a token that doesn't have the latest 'isVerified' status.
      const user = await User.findById(req.user._id).select("isVerified type");

      if (!user) {
         return next(new APIError(404, "User not found."));
      }

      // Check if the current user's type is one of the allowed types for this verification check
      if (allowedTypes && user.type && !allowedTypes.includes(user.type)) {
         // If allowedTypes are specified and the user's type is NOT among them,
         // then this specific verification check doesn't apply to them, so let them pass.
         // This allows you to apply different verification requirements to different user types.
         return next();
      }

      if (!user.isVerified) {
         // Customize this message based on the user's current status
         let message = "You must be verified to perform this action.";
         if (user.verificationStatus === "pending") {
            message =
               "Your verification is pending review. Please wait for approval.";
         } else if (user.verificationStatus === "rejected") {
            message =
               "Your verification was rejected. Please contact support or re-submit documents.";
         } else if (user.verificationStatus === "none") {
            message =
               "Please submit your verification documents to perform this action.";
         }
         return next(new APIError(403, message));
      }

      next(); // User is verified, proceed
   };
