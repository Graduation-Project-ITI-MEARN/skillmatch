import { NextFunction, Request, Response } from "express";

/**
 * Require an ACTIVE subscription
 * (For Companies)
 */
const requireSubscription = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = (req as any).user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
  }

  // Check status
  if (user.subscriptionStatus !== "active") {
    return res.status(403).json({
      success: false,
      message: "Active subscription required",
    });
  }

  // Check expiry
  if (!user.subscriptionExpiry || user.subscriptionExpiry < new Date()) {
    return res.status(403).json({
      success: false,
      message: "Subscription expired",
    });
  }

  next();
};

/**
 * Require minimum wallet balance
 * (For Challengers)
 */
const requireBalance =
  (amount: number) => (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    if (user.walletBalance < amount) {
      return res.status(402).json({
        success: false,
        message: `Insufficient wallet balance. Required: ${amount}`,
      });
    }

    next();
  };

export { requireSubscription, requireBalance };
