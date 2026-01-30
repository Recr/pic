import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError } from "zod";
import { StatusCodes } from "http-status-codes";

export const validate = (schema: ZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: "Validation failed",
          details: error.issues,
        });
      }
      next(error);
    }
  };
};
