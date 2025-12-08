import express from "express";
import {
   createPaymentIntent,
   handleWebhook,
} from "../controllers/paymentController";

const paymentRouter = express.Router();

// Route for Frontend to request a payment key
paymentRouter.post("/create-intent", createPaymentIntent);

// Webhook for Paymob to notify us (Must be public internet accessible)
paymentRouter.post("/webhook", handleWebhook);

export default paymentRouter;
