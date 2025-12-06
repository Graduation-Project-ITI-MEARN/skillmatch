import { Request, Response, NextFunction } from "express";
import APIError from "../utils/APIError";

/**
 * Middleware to restrict route access based on user roles or types.
 * Checks both 'role' (e.g. admin) and 'type' (e.g. company, challenger).
 *
 * @param allowedRoles - Array of roles/types that can access this route
 * @returns Middleware function
 *
 * @example
 * router.delete('/users/:id', auth, restrictTo(['admin']), deleteUser);
 * router.post('/challenges', auth, restrictTo(['company']), createChallenge);
 */
export const restrictTo = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Cast req to any to safely access user, which is attached by authMiddleware
    const user = (req as any).user;

    if (!user) {
      return next(
        new APIError(401, "You are not logged in. Please log in first.")
      );
    }

    // Check permissions: Valid if User's Role OR User's Type is in the allowed list
    const userRole = user.role;
    const userType = user.type || "";

    const hasPermission =
      allowedRoles.includes(userRole) || allowedRoles.includes(userType);

    if (!hasPermission) {
      return next(
        new APIError(403, "You do not have permission to access this route.")
      );
    }

    next();
  };
};
