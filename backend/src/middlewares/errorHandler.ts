import { NextFunction, Request, Response } from "express";
import APIError from "../utils/APIError";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error for the developer (server-side only)
  console.error(err);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      status: "failure",
      message: err.message,
    });
  }

  if (err.name === "MongooseError") {
    return res.status(400).json({
      status: "failure",
      message: err.message,
    });
  }

  if (err.name === "APIError") {
    return res.status(400).json({ status: "failure", message: err.message });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(400).json({
      status: "failure",
      message: "Invalid token",
    });
  }

  if (err.message && err.message.includes("11000")) {
    return res.status(400).json({
      status: "failure",
      message: "Duplicate key error",
    });
  }

  if (err.name === "CastError") {
    return res
      .status(400)
      .json({ status: "failure", message: "Invalid ID format" });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(400).json({
      status: "failure",
      message: "Token has expired",
    });
  }

  if (err instanceof APIError) {
    return res.status(err.status).json({
      status: "failure",
      message: err.message,
      errors: err.errors || null,
    });
  }

  // Default 500 Error
  return res
    .status(500)
    .json({ status: "failure", message: "Internal Server Error" });
};

export default errorHandler;
