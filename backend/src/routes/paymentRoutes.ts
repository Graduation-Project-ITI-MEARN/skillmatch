import express from "express";
import {
   createPaymentIntent,
   handleWebhook,
} from "../controllers/paymentController";
import auth from "../middlewares/authMiddleware";

const paymentRouter = express.Router();

// Route for Frontend to request a payment key
paymentRouter.post("/create-intent", auth, createPaymentIntent);

// Webhook for Paymob to notify us (Must be public internet accessible)
paymentRouter.post("/webhook", auth, handleWebhook);

export default paymentRouter;
