import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(cors()); // Enable CORS for frontend communication

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
