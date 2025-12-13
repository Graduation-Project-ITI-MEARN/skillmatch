import { Application } from "express";
import aiRouter from "./aiRoutes";
import authRouter from "./authRoutes";
import challengeRouter from "./challengeRoutes";
import metadataRouter from "./metadataRoutes";
import moderationRouter from "./moderationRoutes";
import notificationRouter from "./notificationRoutes";
import paymentRouter from "./paymentRoutes";
import statsRouter from "./statsRoutes";
import submissionRouter from "./submissionRoutes";
import uploadRouter from "./uploadRoutes";
import userRouter from "./userRoutes";
import walletRouter from "./walletRoutes";
import leaderboardRouter from "./leaderboard";
import talentRouter from "./talentRoutes";



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
  app.use(`${apiPrefix}/wallet`, walletRouter);
  app.use(`${apiPrefix}` , leaderboardRouter);
  app.use(`${apiPrefix}`, talentRouter);
};
