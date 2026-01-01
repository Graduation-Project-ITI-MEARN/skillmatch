import { NextFunction, Request, Response } from "express";

import User from "../models/User";
import axios from "axios";
import { catchError } from "../utils/catchAsync";
import crypto from "crypto";
import { logActivity } from "../utils/activityLogger"; // <-- Import Logger

/**
 * INITIATE PAYMENT (Paymob 3-Step Flow)
 * 1. Authentication Request -> Get Token
 * 2. Order Registration API -> Get Order ID
 * 3. Payment Key Request -> Get Payment Key for Iframe
 */
const createPaymentIntent = catchError(
  async (req: Request, res: Response, next: NextFunction) => {
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 8d31baa65cb88e9c7c0f1362b586f280ba3815d9
    const { amount, currency, billing_data, payment_type } = req.body;
    const user = (req as any).user;

    console.log("Payment payload:", {
      amount,
      payment_type,
      currency: currency || "EGP",
    });
    console.log("User:", user);

    // VALIDATION: Ensure we know what this payment is for
    if (!payment_type || !["SUBSCRIPTION", "TOPUP"].includes(payment_type)) {
      return res.status(400).json({
        status: "fail",
        message: "payment_type is required (SUBSCRIPTION or TOPUP)",
      });
    }

    // 2. AUTHENTICATION
    const authResponse = await axios.post(
      "https://accept.paymob.com/api/auth/tokens",
      { api_key: process.env.PAYMOB_API_KEY }
    );
    const authToken = authResponse.data.token;

    // 3. ORDER REGISTRATION
    const amountInCents = Math.round(amount * 100);

    // CRITICAL CHANGE:
    // Format: "USER_ID---PAYMENT_TYPE---TIMESTAMP"
    // Example: "654321...---SUBSCRIPTION---17000000"
    // This allows the webhook to split this string and know exactly what to update.
    const customOrderId = `${user._id}---${payment_type}---${Date.now()}`;

<<<<<<< HEAD
=======
    const { amount, currency, billing_data } = req.body;
    const user = (req as any).user; // Get authenticated user

    // 1. AUTHENTICATION
    const authResponse = await axios.post(
      "https://accept.paymob.com/api/auth/tokens",
      {
        api_key: process.env.PAYMOB_API_KEY,
      }
    );
    const authToken = authResponse.data.token;

    // 2. ORDER REGISTRATION
    // Paymob expects amount in cents (e.g., 100 EGP = 10000 cents)
    const amountInCents = Math.round(amount * 100);

>>>>>>> 8d2630a (chore: added dtos for moderation/payment, validated routes, and updated postman)
=======
>>>>>>> 8d31baa65cb88e9c7c0f1362b586f280ba3815d9
    const orderResponse = await axios.post(
      "https://accept.paymob.com/api/ecommerce/orders",
      {
        auth_token: authToken,
        delivery_needed: "false",
        amount_cents: amountInCents,
        currency: currency || "EGP",
<<<<<<< HEAD
<<<<<<< HEAD
        merchant_order_id: customOrderId, // <--- Sent to Paymob here
=======
        // We can pass the User ID here to track it in the webhook later
        merchant_order_id: `TX-${Date.now()}-${user._id}`,
>>>>>>> 8d2630a (chore: added dtos for moderation/payment, validated routes, and updated postman)
=======
        merchant_order_id: customOrderId, // <--- Sent to Paymob here
>>>>>>> 8d31baa65cb88e9c7c0f1362b586f280ba3815d9
      }
    );
    const orderId = orderResponse.data.id;

<<<<<<< HEAD
<<<<<<< HEAD
    // 4. PAYMENT KEY GENERATION
=======
    // 3. PAYMENT KEY GENERATION
>>>>>>> 8d2630a (chore: added dtos for moderation/payment, validated routes, and updated postman)
=======
    // 4. PAYMENT KEY GENERATION
>>>>>>> 8d31baa65cb88e9c7c0f1362b586f280ba3815d9
    const keyResponse = await axios.post(
      "https://accept.paymob.com/api/acceptance/payment_keys",
      {
        auth_token: authToken,
        amount_cents: amountInCents,
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 8d31baa65cb88e9c7c0f1362b586f280ba3815d9
        expiration: 3600,
        order_id: orderId,
        billing_data: billing_data || {
          apartment: "NA",
          email: user.email,
<<<<<<< HEAD
=======
        expiration: 3600, // 1 hour
        order_id: orderId,
        billing_data: billing_data || {
          // Use real user data if available, fallback to defaults
          apartment: "NA",
          email: user.email, // Important for tracking
>>>>>>> 8d2630a (chore: added dtos for moderation/payment, validated routes, and updated postman)
=======
>>>>>>> 8d31baa65cb88e9c7c0f1362b586f280ba3815d9
          floor: "NA",
          first_name: user.name.split(" ")[0] || "User",
          street: "NA",
          building: "NA",
<<<<<<< HEAD
<<<<<<< HEAD
          phone_number: "+201234567890",
=======
          phone_number: "+201234567890", // Paymob requires a valid phone format
>>>>>>> 8d2630a (chore: added dtos for moderation/payment, validated routes, and updated postman)
=======
          phone_number: "+201234567890",
>>>>>>> 8d31baa65cb88e9c7c0f1362b586f280ba3815d9
          shipping_method: "NA",
          postal_code: "NA",
          city: "Cairo",
          country: "EG",
          last_name: user.name.split(" ")[1] || "NA",
          state: "NA",
        },
        currency: currency || "EGP",
        integration_id: process.env.PAYMOB_INTEGRATION_ID,
      }
    );

    const paymentKey = keyResponse.data.token;

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 8d31baa65cb88e9c7c0f1362b586f280ba3815d9
    // ✅ Log Activity including the type
    await logActivity(
      user._id,
      "payment_initiated",
      `User initiated ${payment_type} payment of ${amount} ${
        currency || "EGP"
      }`,
      "success"
    );

<<<<<<< HEAD
=======
    // ✅ Log Activity: User initiated payment
    await logActivity(
      user._id,
      "payment_initiated",
      `User initiated payment of ${amount} ${currency || "EGP"}`,
      undefined // No specific target ID for now, or use orderId cast to ObjectId if you store it locally
    );

    // Send Key and Order ID to Frontend
>>>>>>> 8d2630a (chore: added dtos for moderation/payment, validated routes, and updated postman)
=======
>>>>>>> 8d31baa65cb88e9c7c0f1362b586f280ba3815d9
    res.status(200).json({
      status: "success",
      data: {
        paymentKey,
        orderId,
<<<<<<< HEAD
<<<<<<< HEAD
        iframeUrl: `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`,
=======
        iframeUrl: `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_FRAME_ID}?payment_token=${paymentKey}`,
>>>>>>> 8d2630a (chore: added dtos for moderation/payment, validated routes, and updated postman)
=======
        iframeUrl: `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`,
>>>>>>> 8d31baa65cb88e9c7c0f1362b586f280ba3815d9
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
    const { obj, type, hmac } = req.body;

    // We only care about TRANSACTION updates, ignore others
    if (type !== "TRANSACTION") {
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

    // 4. VERIFY SIGNATURE
    if (calculatedHmac !== hmac) {
      // Security failure
      // This is a security failure, not a generic error, so we return 403 explicitly
      // throwing an error here might be confusing for the global handler
      res.status(403).json({ message: "HMAC Signature Mismatch" });
      return;
    }

    // 5. PROCESS TRANSACTION
    if (success === true) {
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 8d31baa65cb88e9c7c0f1362b586f280ba3815d9
      const customId = order?.merchant_order_id;
      if (!customId) return res.status(200).send();

      const [userId, paymentType] = customId.split("---");

      const user = await User.findById(userId);
      if (!user) return res.status(200).send();

      if (paymentType === "SUBSCRIPTION") {
        user.subscriptionStatus = "active";

        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 30);
        user.subscriptionExpiry = expiry;

        await user.save();
      }
      if (paymentType === "TOPUP") {
        const amount = amount_cents / 100;
        user.walletBalance += amount;

        await user.save();
      }
    }
<<<<<<< HEAD
=======
      console.log(
        `✅ [Paymob] Payment Succeeded. Order: ${order.id}, Tx: ${id}`
      );
      // NOTE: We cannot use logActivity here easily because the webhook comes from Paymob,
      // so we don't have the req.user context.
      // Ideally, you would look up the user via a stored Transaction model using order.id
      // TODO: Call your service to update user wallet/subscription
    } else {
      console.log(`❌ [Paymob] Payment Failed/Pending. Order: ${order.id}`);
    }

    // Acknowledge receipt to Paymob
>>>>>>> 8d2630a (chore: added dtos for moderation/payment, validated routes, and updated postman)
=======
>>>>>>> 8d31baa65cb88e9c7c0f1362b586f280ba3815d9
    res.status(200).send();
  }
);

export { createPaymentIntent, handleWebhook };
