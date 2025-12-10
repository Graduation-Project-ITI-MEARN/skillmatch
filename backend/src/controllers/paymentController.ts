import { NextFunction, Request, Response } from "express";

import axios from "axios";
import crypto from "crypto";

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
      // merchant_order_id: "optional_internal_id"
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
        // Mandatory dummy fields if not provided
        apartment: "NA",
        email: "user@test.com",
        floor: "NA",
        first_name: "Test",
        street: "NA",
        building: "NA",
        phone_number: "+201234567890",
        shipping_method: "NA",
        postal_code: "NA",
        city: "Cairo",
        country: "EG",
        last_name: "User",
        state: "NA",
      },
      currency: currency || "EGP",
      integration_id: process.env.PAYMOB_INTEGRATION_ID,
    }
  );

  const paymentKey = keyResponse.data.token;

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
    // This is a security failure, not a generic error, so we return 403 explicitly
    // throwing an error here might be confusing for the global handler
    res.status(403).json({ message: "HMAC Signature Mismatch" });
    return;
  }

  // 5. PROCESS TRANSACTION
  if (success === true) {
    console.log(`✅ [Paymob] Payment Succeeded. Order: ${order.id}, Tx: ${id}`);
    // TODO: Call your service to update user wallet/subscription
  } else {
    console.log(`❌ [Paymob] Payment Failed/Pending. Order: ${order.id}`);
  }

  // Acknowledge receipt to Paymob
  res.status(200).send();
};
