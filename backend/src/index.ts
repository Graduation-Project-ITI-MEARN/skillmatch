import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import authRouter from "./routes/authRoutes";
import APIError from "./utils/APIError";
import errorHandler from "./middlewares/errorHandler";
import challengeRouter from "./routes/challengeRoutes";
import submissionRouter from "./routes/submissionRoutes";
import userRouter from "./routes/userRoutes";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(helmet());

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
const apiPrefix = "/api";

app.use(`${apiPrefix}/auth`, authRouter);
app.use(`${apiPrefix}/challenges`, challengeRouter);
app.use(`${apiPrefix}/submissions`, submissionRouter);
app.use(`${apiPrefix}/users`, userRouter);

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

// Database Connection
const mongoURI = process.env.MONGODB_URI as string;

if (!mongoURI) {
   console.error("Error: MONGODB_URI is missing in .env file");
   process.exit(1);
}

mongoose
   .connect(mongoURI)
   .then(() => console.log("MongoDB Connected Successfully"))
   .catch((err) => {
      console.error("MongoDB Connection Error:", err);
      process.exit(1);
   });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
   console.log(`Server running on port ${PORT}`);
});
