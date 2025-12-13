import { NextFunction, Request, Response } from "express";

import axios from "axios";
import crypto from "crypto";
import { logActivity } from "../utils/activityLogger"; // <-- Import Logger

/**
 * INITIATE PAYMENT (Paymob 3-Step Flow)
 * 1. Authentication Request -> Get Token
 * 2. Order Registration API -> Get Order ID
 * 3. Payment Key Request -> Get Payment Key for Iframe
 */
export const createPaymentIntent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

    const orderResponse = await axios.post(
      "https://accept.paymob.com/api/ecommerce/orders",
      {
        auth_token: authToken,
        delivery_needed: "false",
        amount_cents: amountInCents,
        currency: currency || "EGP",
        // We can pass the User ID here to track it in the webhook later
        merchant_order_id: `TX-${Date.now()}-${user._id}`,
      }
    );
    const orderId = orderResponse.data.id;

    // 3. PAYMENT KEY GENERATION
    const keyResponse = await axios.post(
      "https://accept.paymob.com/api/acceptance/payment_keys",
      {
        auth_token: authToken,
        amount_cents: amountInCents,
        expiration: 3600, // 1 hour
        order_id: orderId,
        billing_data: billing_data || {
          // Use real user data if available, fallback to defaults
          apartment: "NA",
          email: user.email, // Important for tracking
          floor: "NA",
          first_name: user.name.split(" ")[0] || "User",
          street: "NA",
          building: "NA",
          phone_number: "+201234567890", // Paymob requires a valid phone format
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

    // ✅ Log Activity: User initiated payment
    await logActivity(
      user._id,
      "payment_initiated",
      `User initiated payment of ${amount} ${currency || "EGP"}`,
      undefined // No specific target ID for now, or use orderId cast to ObjectId if you store it locally
    );

    // Send Key and Order ID to Frontend
    res.status(200).json({
      status: "success",
      data: {
        paymentKey,
        orderId,
        iframeUrl: `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_FRAME_ID}?payment_token=${paymentKey}`,
      },
    });
};

/**
 * WEBHOOK HANDLER
 * Verifies HMAC signature and logs transaction status
 */
export const handleWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
    console.log(`✅ [Paymob] Payment Succeeded. Order: ${order.id}, Tx: ${id}`);
    // NOTE: We cannot use logActivity here easily because the webhook comes from Paymob,
    // so we don't have the req.user context.
    // Ideally, you would look up the user via a stored Transaction model using order.id
    // TODO: Call your service to update user wallet/subscription
  } else {
    console.log(`❌ [Paymob] Payment Failed/Pending. Order: ${order.id}`);
  }

  // Acknowledge receipt to Paymob
  res.status(200).send();
};
