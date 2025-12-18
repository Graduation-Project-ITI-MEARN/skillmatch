import express from "express";
import {
  createPaymentIntent,
  handleWebhook,
  getWalletDetails,
} from "../controllers/paymentController";
import {
  createPaymentIntentSchema,
  paymobWebhookSchema,
} from "../DTO/CreatePaymentIntentDTO";

import auth from "../middlewares/authMiddleware";
import validate from "../middlewares/validate";

const paymentRouter = express.Router();

// Route for Frontend to request a payment key
paymentRouter.post(
  "/create-intent",
  validate(createPaymentIntentSchema),
  auth,
  createPaymentIntent
);

// Route to get Wallet Balance for Dashboard Sidebar
paymentRouter.get("/details", auth, getWalletDetails);

// Webhook for Paymob to notify us (Must be public internet accessible)
paymentRouter.post("/webhook", validate(paymobWebhookSchema), handleWebhook);

export default paymentRouter;
