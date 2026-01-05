import {
   createPaymentIntent,
   handleWebhook,
   resetSubscription,
   simulatePayment,
} from "../controllers/paymentController";
import {
   createPaymentIntentSchema,
   paymobWebhookSchema,
} from "../DTO/CreatePaymentIntentDTO";

import auth from "../middlewares/authMiddleware";
import express from "express";
import validate from "../middlewares/validate";

const paymentRouter = express.Router();

// Route for Frontend to request a payment key
paymentRouter.post(
   "/create-intent",
   validate(createPaymentIntentSchema),
   auth,
   createPaymentIntent
);

paymentRouter.post("/demo/simulate", auth, simulatePayment);
paymentRouter.post("/reset", auth, resetSubscription);

// Webhook for Paymob to notify us (Must be public internet accessible)
paymentRouter.post("/webhook", validate(paymobWebhookSchema), handleWebhook);

export default paymentRouter;
