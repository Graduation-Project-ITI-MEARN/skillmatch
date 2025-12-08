import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const mongoURI = process.env.MONGODB_URI;

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
