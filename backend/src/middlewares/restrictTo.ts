// src/middlewares/restrictTo.ts
import { Request, Response, NextFunction } from "express";
import APIError from "../utils/APIError";

/**
 * Middleware to restrict route access based on user roles
 * @param allowedRoles - Array of roles that can access this route
 * @returns Middleware function
 *
 * @example
 * router.delete('/users/:id', authMiddleware, restrictTo(['admin']), deleteUser);
 * router.get('/company/stats', authMiddleware, restrictTo(['admin', 'company']), getStats);
 */
export const restrictTo = (allowedRoles: string[]) => {
   return (req: Request, res: Response, next: NextFunction): void => {
      // Check if user exists (should be set by authMiddleware)
      if (!req.user) {
         return next(
            new APIError(401, "You are not logged in. Please log in first.")
         );
      }

      // Check if user's role is in the allowed roles array
      if (!allowedRoles.includes(req.user.role)) {
         return next(
            new APIError(
               403,
               "You do not have permission to access this route."
            )
         );
      }

      // User has required role, proceed
      next();
   };
};
