import { StatusCodes } from "http-status-codes";

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: StatusCodes,
  ) {
    super(message);
    this.name = "ApplicationError";
  }
}
