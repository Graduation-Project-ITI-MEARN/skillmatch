import "./config/db";
import "./config/cloudinary";

import APIError from "./utils/APIError";
import { bootstrap } from "./routes/bootstrap";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import errorHandler from "./middlewares/errorHandler";
import metadataRoutes from "./routes/metadataRoutes";
import moderationRouter from "./routes/moderationRoutes"; 
import express from "express";
import helmet from "helmet";

dotenv.config();

const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(helmet());
app.use('/api/metadata', metadataRoutes);
app.use("/api/moderation", moderationRouter);

const FRONTEND_URL = process.env.FRONTEND_URL || [
   "http://localhost:4200",
   "http://localhost:3000",
];
app.use(
   cors({
      origin: FRONTEND_URL,
      credentials: true,
   })
); // Enable CORS for frontend origin

app.use(cookieParser());

// Routes
bootstrap(app);

app.get("/", (req, res) => {
   res.json({
      message: "Welcome to SkillMatch API",
   });
});

// NOT FOUND ROUTES
app.use((req, res, next) => {
   next(new APIError(404, `${req.method} ${req.path} is not found`));
});

// GLOBAL ERROR HANDLER
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
   console.log(`Server running on port ${PORT}`);
});
