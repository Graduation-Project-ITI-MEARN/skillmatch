// middleware/subscription.ts
import { NextFunction, Request, Response } from "express";

/**
 * Require an ACTIVE subscription for companies
 * IMPORTANT: This middleware must be used AFTER the auth middleware
 * so that req.user is populated
 */
const requireSubscription = (
   req: Request,
   res: Response,
   next: NextFunction
) => {
   const user = (req as any).user;

   console.log("=== SUBSCRIPTION CHECK DEBUG ===");
   console.log("User ID:", user?._id);
   console.log("User Type:", user?.type);
   console.log("Subscription Status:", user?.subscriptionStatus);
   console.log("Subscription Expiry:", user?.subscriptionExpiry);
   console.log("Subscription Plan:", user?.subscriptionPlan);
   console.log("Current Date:", new Date());

   if (!user) {
      return res.status(401).json({
         success: false,
         message: "Not authenticated",
      });
   }

   // Only apply to companies creating challenges
   if (user.type !== "company") {
      console.log("User is not a company, skipping subscription check");
      return next(); // Non-companies can proceed (like challengers)
   }

   // Check subscription status
   if (user.subscriptionStatus !== "active") {
      console.log(
         "BLOCKED: Subscription status is not active:",
         user.subscriptionStatus
      );
      return res.status(403).json({
         success: false,
         message: "Active subscription required to create challenges",
         code: "SUBSCRIPTION_REQUIRED",
         redirectTo: "/dashboard/company/subscription",
         debug: {
            status: user.subscriptionStatus,
            expiry: user.subscriptionExpiry,
         },
      });
   }

   // Check expiry date
   if (!user.subscriptionExpiry) {
      console.log("BLOCKED: No subscription expiry date found");
      return res.status(403).json({
         success: false,
         message: "Invalid subscription. No expiry date found.",
         code: "SUBSCRIPTION_INVALID",
         redirectTo: "/dashboard/company/subscription",
      });
   }

   // Convert to Date object if it's a string
   const expiryDate =
      user.subscriptionExpiry instanceof Date
         ? user.subscriptionExpiry
         : new Date(user.subscriptionExpiry);

   const now = new Date();

   console.log("Expiry Date (parsed):", expiryDate);
   console.log("Current Date:", now);
   console.log("Is Expired?", expiryDate < now);

   if (expiryDate < now) {
      console.log("BLOCKED: Subscription has expired");
      return res.status(403).json({
         success: false,
         message: "Your subscription has expired. Please renew to continue.",
         code: "SUBSCRIPTION_EXPIRED",
         redirectTo: "/dashboard/company/subscription",
         debug: {
            expiry: expiryDate,
            now: now,
         },
      });
   }

   console.log("✅ SUBSCRIPTION CHECK PASSED");
   next();
};

/**
 * Check if user can use the selected AI model tier
 */
const checkAIModelAccess = (
   req: Request,
   res: Response,
   next: NextFunction
) => {
   const user = (req as any).user;
   const { aiConfig } = req.body;

   console.log("=== AI MODEL ACCESS CHECK ===");
   console.log("AI Config Pricing Tier:", aiConfig?.pricingTier);
   console.log("User Subscription Plan:", user?.subscriptionPlan);

   // If not using premium/custom tier, allow it
   if (!aiConfig || !["premium", "balanced"].includes(aiConfig.pricingTier)) {
      console.log("Free/Budget tier selected, allowing access");
      return next();
   }

   // For premium tiers, ensure they have the right subscription plan
   const allowedPlans = ["professional", "enterprise"];

   if (
      !user.subscriptionPlan ||
      !allowedPlans.includes(user.subscriptionPlan)
   ) {
      console.log("BLOCKED: Premium AI requires professional/enterprise plan");
      return res.status(403).json({
         success: false,
         message:
            "Premium AI models require a Professional or Enterprise subscription",
         code: "PREMIUM_AI_REQUIRES_SUBSCRIPTION",
         upgradeTo: "professional",
         debug: {
            currentPlan: user.subscriptionPlan,
            requiredPlans: allowedPlans,
            requestedTier: aiConfig.pricingTier,
         },
      });
   }

   console.log("✅ AI MODEL ACCESS CHECK PASSED");
   next();
};

/**
 * Require minimum wallet balance (For Challengers)
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

      const userBalance = user.walletBalance || 0;

      console.log("=== WALLET BALANCE CHECK ===");
      console.log("Required:", amount);
      console.log("Current:", userBalance);

      if (userBalance < amount) {
         return res.status(402).json({
            success: false,
            message: `Insufficient wallet balance. Required: ${amount}`,
            code: "INSUFFICIENT_BALANCE",
            required: amount,
            current: userBalance,
         });
      }

      console.log("✅ BALANCE CHECK PASSED");
      next();
   };

export { requireSubscription, requireBalance, checkAIModelAccess };
