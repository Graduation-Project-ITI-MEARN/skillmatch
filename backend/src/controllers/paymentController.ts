import { NextFunction, Request, Response } from "express";

import User from "../models/User";
import axios from "axios";
import { catchError } from "../utils/catchAsync";
import crypto from "crypto";
import { logActivity } from "../utils/activityLogger"; // <-- Import Logger

const createPaymentIntent = catchError(
   async (req: Request, res: Response, next: NextFunction) => {
      const { amount, currency, billing_data, payment_type, plan_id } =
         req.body;
      const user = (req as any).user;

      // VALIDATION: Ensure we know what this payment is for
      if (!payment_type || !["SUBSCRIPTION", "TOPUP"].includes(payment_type)) {
         return res.status(400).json({
            status: "fail",
            message: "payment_type is required (SUBSCRIPTION or TOPUP)",
         });
      }

      // 1. AUTHENTICATION
      const authResponse = await axios.post(
         "https://accept.paymob.com/api/auth/tokens",
         { api_key: process.env.PAYMOB_API_KEY }
      );
      const authToken = authResponse.data.token;

      // 2. ORDER REGISTRATION
      const amountInCents = Math.round(amount * 100);

      const customOrderId = plan_id
         ? `${user._id}---${payment_type}---${plan_id}---${Date.now()}`
         : `${user._id}---${payment_type}---${Date.now()}`;

      const orderResponse = await axios.post(
         "https://accept.paymob.com/api/ecommerce/orders",
         {
            auth_token: authToken,
            delivery_needed: "false",
            amount_cents: amountInCents,
            currency: currency || "EGP",
            merchant_order_id: customOrderId,
         }
      );
      const orderId = orderResponse.data.id;

      // 3. PAYMENT KEY GENERATION
      // Safely extract first and last name, providing fallbacks
      const userFirstName = user.name?.split(" ")[0] || "User";
      const userLastName = user.name?.split(" ")[1] || "NA";

      // Define a complete default billing data object
      const defaultFullBillingData = {
         apartment: "NA",
         email: user.email,
         floor: "NA",
         first_name: userFirstName,
         street: "NA",
         building: "NA",
         phone_number: "+201234567890", // Consider pulling from user.phone if you add it
         shipping_method: "NA",
         postal_code: "NA",
         city: user.city || "Cairo", // Use user's city if available, otherwise default
         country: "EG", // Default to Egypt
         last_name: userLastName,
         state: "NA",
      };

      // Merge provided billing_data with the default billing data
      // This ensures all required fields are present, with req.body.billing_data taking precedence
      const finalBillingData = {
         ...defaultFullBillingData,
         ...(billing_data || {}), // If billing_data from req.body exists, spread it here to override defaults
      };

      const keyResponse = await axios.post(
         "https://accept.paymob.com/api/acceptance/payment_keys",
         {
            auth_token: authToken,
            amount_cents: amountInCents,
            expiration: 3600,
            order_id: orderId,
            billing_data: finalBillingData, // Use the merged billing data
            currency: currency || "EGP",
            integration_id: process.env.PAYMOB_INTEGRATION_ID,
         }
      );

      const paymentKey = keyResponse.data.token;

      // ✅ Log Activity including the type
      await logActivity(
         user._id,
         "payment_initiated",
         `User initiated ${payment_type} payment of ${amount} ${
            currency || "EGP"
         }`,
         "success"
      );

      res.status(200).json({
         status: "success",
         data: {
            paymentKey,
            orderId,
            iframeUrl: `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`,
         },
      });
   }
);

/**
 * WEBHOOK HANDLER
 * Verifies HMAC signature and logs transaction status
 */
const handleWebhook = catchError(
   async (req: Request, res: Response, next: NextFunction) => {
      console.log("🔔 Webhook received:", req.body); // ADD THIS

      const { obj, type, hmac } = req.body;

      if (type !== "TRANSACTION") {
         console.log("❌ Not a TRANSACTION type:", type); // ADD THIS
         res.status(200).send();
         return;
      }

      // 1. EXTRACT DATA FOR HMAC
      // Lexicographical order required by Paymob
      const {
         amount_cents,
         created_at,
         currency,
         error_occured,
         has_parent_transaction,
         id,
         integration_id,
         is_3d_secure,
         is_auth,
         is_capture,
         is_refunded,
         is_standalone_payment,
         is_voided,
         order,
         owner,
         pending,
         source_data_pan,
         source_data_sub_type,
         source_data_type,
         success,
      } = obj;

      // 2. CONCATENATE STRING
      const lexicon = [
         amount_cents,
         created_at,
         currency,
         error_occured,
         has_parent_transaction,
         id,
         integration_id,
         is_3d_secure,
         is_auth,
         is_capture,
         is_refunded,
         is_standalone_payment,
         is_voided,
         order.id,
         owner,
         pending,
         source_data_pan,
         source_data_sub_type,
         source_data_type,
         success,
      ].join("");

      // 3. CALCULATE HMAC
      const calculatedHmac = crypto
         .createHmac("sha512", process.env.PAYMOB_HMAC_SECRET as string)
         .update(lexicon)
         .digest("hex");

      if (calculatedHmac !== hmac) {
         console.log("❌ HMAC mismatch!"); // ADD THIS
         res.status(403).json({ message: "HMAC Signature Mismatch" });
         return;
      }

      // 5. PROCESS TRANSACTION
      if (success === true) {
         console.log("✅ Transaction successful!"); // ADD THIS

         const customId = order?.merchant_order_id;
         console.log("📦 Custom ID:", customId); // ADD THIS

         if (!customId) {
            console.log("❌ No custom ID found"); // ADD THIS
            return res.status(200).send();
         }

         const parts = customId.split("---");
         const userId = parts[0];
         const paymentType = parts[1];
         const planId = parts.length === 4 ? parts[2] : null;

         console.log("📊 Parsed:", { userId, paymentType, planId }); // ADD THIS

         const user = await User.findById(userId);
         if (!user) {
            console.log("❌ User not found:", userId); // ADD THIS
            return res.status(200).send();
         }

         console.log("👤 User found:", user.email); // ADD THIS

         if (paymentType === "SUBSCRIPTION") {
            console.log("💳 Processing subscription..."); // ADD THIS

            user.subscriptionStatus = "active";

            const expiry = new Date();
            expiry.setDate(expiry.getDate() + 30);
            user.subscriptionExpiry = expiry;

            if (
               planId &&
               ["basic", "professional", "enterprise"].includes(planId)
            ) {
               user.subscriptionPlan = planId;
               console.log("📋 Plan set to:", planId); // ADD THIS
            } else {
               console.log("⚠️ Invalid or missing planId:", planId); // ADD THIS
            }

            await user.save();
            console.log("✅ User saved successfully!"); // ADD THIS

            await logActivity(
               userId,
               "subscription_activated",
               `Subscription activated (${
                  planId || "unknown"
               } plan) until ${expiry.toISOString()}`,
               "success"
            );
         }

         if (paymentType === "TOPUP") {
            const amount = amount_cents / 100;
            user.walletBalance += amount;
            await user.save();

            await logActivity(
               userId,
               "wallet_topup",
               `Wallet topped up with ${amount} EGP`,
               "success"
            );
         }
      } else {
         console.log("❌ Transaction not successful"); // ADD THIS
      }

      res.status(200).send();
   }
);
export { createPaymentIntent, handleWebhook };

/**
 * FAKE PAYMENT - FOR DEMO/TESTING ONLY
 * Instantly activates subscription without real payment
 */
export const simulatePayment = catchError(
   async (req: Request, res: Response, next: NextFunction) => {
      const { plan_id } = req.body;
      const user = (req as any).user; // From protect middleware

      console.log("🎭 DEMO MODE: Simulating payment for user:", user.email);

      // Validate plan
      const validPlans = ["basic", "professional", "enterprise"];
      const planToActivate = validPlans.includes(plan_id) ? plan_id : "basic";

      // Update user subscription
      user.subscriptionStatus = "active";
      user.subscriptionPlan = planToActivate;

      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30); // 30 days from now
      user.subscriptionExpiry = expiry;

      await user.save();

      console.log("✅ DEMO: Subscription activated!", {
         user: user.email,
         plan: planToActivate,
         expiry: expiry.toISOString(),
      });

      // Log activity
      await logActivity(
         user._id,
         "subscription_activated",
         `[DEMO] Subscription activated (${planToActivate} plan) until ${expiry.toISOString()}`,
         "success"
      );

      res.status(200).json({
         success: true,
         message: "Subscription activated successfully (DEMO MODE)",
         data: {
            subscriptionStatus: user.subscriptionStatus,
            subscriptionPlan: user.subscriptionPlan,
            subscriptionExpiry: user.subscriptionExpiry,
            user: {
               id: user._id,
               email: user.email,
               name: user.name,
            },
         },
      });
   }
);

/**
 * RESET SUBSCRIPTION - FOR TESTING
 * Resets user back to free tier
 */
export const resetSubscription = catchError(
   async (req: Request, res: Response, next: NextFunction) => {
      const user = (req as any).user;

      user.subscriptionStatus = "free";
      user.subscriptionPlan = null;
      user.subscriptionExpiry = null;

      await user.save();

      console.log("🔄 DEMO: Subscription reset for user:", user.email);

      await logActivity(
         user._id,
         "subscription_reset",
         `[DEMO] Subscription reset to free tier`,
         "success"
      );

      res.status(200).json({
         success: true,
         message: "Subscription reset to free tier",
         data: {
            subscriptionStatus: user.subscriptionStatus,
            subscriptionPlan: user.subscriptionPlan,
            subscriptionExpiry: user.subscriptionExpiry,
         },
      });
   }
);
