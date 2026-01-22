import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Prevent stack traces from being sent
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  // Log full error server-side for debugging
  console.error(err);

  // Send clean error response to client
  return res.status(500).json({
    message: "Internal server error",
  });
}