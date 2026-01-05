import { z } from "zod";

const createPaymentIntentSchema = z.object({
   amount: z.number().positive("Amount must be greater than 0"),

   currency: z
      .string()
      .length(3, "Currency must be a 3-letter code (e.g. EGP)")
      .optional(),

   payment_type: z.enum(["SUBSCRIPTION", "TOPUP"], {
      message: "payment_type must be either SUBSCRIPTION or TOPUP",
   }),
   subscriptionPlanId: z.string().optional(),

   billing_data: z
      .object({
         apartment: z.string().optional(),
         email: z.string().email().optional(),
         floor: z.string().optional(),
         first_name: z.string().optional(),
         street: z.string().optional(),
         building: z.string().optional(),
         phone_number: z.string().optional(),
         shipping_method: z.string().optional(),
         postal_code: z.string().optional(),
         city: z.string().optional(),
         country: z.string().optional(),
         last_name: z.string().optional(),
         state: z.string().optional(),
      })
      .optional(),
});

type CreatePaymentIntentDTO = z.infer<typeof createPaymentIntentSchema>;

const paymobWebhookSchema = z.object({
   type: z.string(),
   hmac: z.string(),

   obj: z.object({
      amount_cents: z.number(),
      created_at: z.string(),
      currency: z.string(),
      error_occured: z.boolean(),
      has_parent_transaction: z.boolean(),
      id: z.number(),
      integration_id: z.number(),
      is_3d_secure: z.boolean(),
      is_auth: z.boolean(),
      is_capture: z.boolean(),
      is_refunded: z.boolean(),
      is_standalone_payment: z.boolean(),
      is_voided: z.boolean(),

      // ✅ FIX IS HERE: Add merchant_order_id
      order: z
         .object({
            id: z.number(),
            merchant_order_id: z.string().optional(),
         })
         .passthrough(), // Optional: allows other extra Paymob fields without stripping them

      owner: z.number(),
      pending: z.boolean(),
      source_data_pan: z.string().optional().nullable(), // .nullable() handles nulls safely
      source_data_sub_type: z.string(),
      source_data_type: z.string(),
      success: z.boolean(),
   }),
});

type PaymobWebhookDTO = z.infer<typeof paymobWebhookSchema>;

export {
   createPaymentIntentSchema,
   CreatePaymentIntentDTO,
   paymobWebhookSchema,
   PaymobWebhookDTO,
};
