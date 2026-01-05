import dotenv from "dotenv";
dotenv.config();

import "./config/db";
import "./config/cloudinary";
import "./socket";
import { initSocket } from "./socket";
import APIError from "./utils/APIError";
import { Server } from "socket.io";
import { bootstrap } from "./routes/bootstrap";
import cookieParser from "cookie-parser";
import cors from "cors";
import errorHandler from "./middlewares/errorHandler";
import express from "express";
import helmet from "helmet";
import http from "http";

const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(helmet());
app.use(cookieParser());

const DEFAULT_FRONTEND_URLS = [
   "http://localhost:4200",
   "http://localhost:3000",
];

const FRONTEND_URL = process.env.FRONTEND_URL
   ? process.env.FRONTEND_URL.split(",").map((url) => url.trim())
   : DEFAULT_FRONTEND_URLS;

app.use(
   cors({
      origin: FRONTEND_URL, // This can now correctly be an array or a single string
      credentials: true,
   })
);

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

const server = http.createServer(app);
initSocket(server);

export const io = new Server(server, {
   cors: {
      origin: FRONTEND_URL,
      credentials: true,
   },
});

app.listen(PORT, () => {
   console.log(`Server running on port ${PORT}`);
});
