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
app.use(express.json());
app.use(helmet());
app.use(cookieParser());

// Build allowed origins array
const allowedOrigins = [
   process.env.NEXTJS_URL,
   process.env.ANGULAR_URL,
   "http://localhost:4200", // Local Angular dev
   "http://localhost:3000", // Local Next.js dev
].filter((url): url is string => Boolean(url)); // Type-safe filter

console.log("Allowed CORS origins:", allowedOrigins);

app.use(
   cors({
      origin: (origin, callback) => {
         // Allow requests with no origin (like mobile apps, Postman, curl)
         if (!origin) return callback(null, true);

         if (allowedOrigins.includes(origin)) {
            callback(null, true);
         } else {
            console.warn(`CORS blocked origin: ${origin}`);
            callback(new Error("Not allowed by CORS"));
         }
      },
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

export const io = new Server(server, {
   cors: {
      origin: allowedOrigins,
      credentials: true,
   },
});

initSocket(server);

server.listen(PORT, () => {
   console.log(`Server running on port ${PORT}`);
});
