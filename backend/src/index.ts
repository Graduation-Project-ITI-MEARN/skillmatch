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

// TEMPORARY: Allow all origins for debugging
// TODO: Remove this and use specific origins in production
app.use(
   cors({
      origin: true, // Allow all origins
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
      origin: "*", // Allow all origins for Socket.IO
      credentials: true,
   },
});

initSocket(server);

server.listen(PORT, () => {
   console.log(`Server running on port ${PORT}`);
});
