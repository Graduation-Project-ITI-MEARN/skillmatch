import { Application } from "express";
import authRouter from "./authRoutes";
import challengeRouter from "./challengeRoutes";
import submissionRouter from "./submissionRoutes";
import uploadRouter from "./uploadRoutes";
import userRouter from "./userRoutes";
import metadataRouter from "./metadataRoutes";
import paymentRouter from "./paymentRoutes";
import statsRouter from "./statsRoutes";
import notificationRouter from "./notificationRoutes";
import moderationRouter from "./moderationRoutes";
import aiRouter from "./aiRoutes";

const apiPrefix = "/api";

export const bootstrap = (app: Application): void => {
   app.use(`${apiPrefix}/auth`, authRouter);
   app.use(`${apiPrefix}/challenges`, challengeRouter);
   app.use(`${apiPrefix}/submissions`, submissionRouter);
   app.use(`${apiPrefix}/users`, userRouter);
   app.use(`${apiPrefix}/upload`, uploadRouter);
   app.use(`${apiPrefix}/metadata`, metadataRouter);
   app.use(`${apiPrefix}/payment`, paymentRouter);
   app.use(`${apiPrefix}/stats`, statsRouter);
   app.use(`${apiPrefix}/notifications`, notificationRouter);
   app.use(`${apiPrefix}/metadata`, metadataRouter);
   app.use(`${apiPrefix}/moderation`, moderationRouter);
   app.use(`${apiPrefix}/ai`, aiRouter);
};
