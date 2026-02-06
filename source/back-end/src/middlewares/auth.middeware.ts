import { NextFunction, Request, Response } from 'express'
import { AppError } from '../errors/AppError'
import { StatusCodes } from 'http-status-codes'
import jwt, { JwtPayload } from 'jsonwebtoken'

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization']
  if (!authHeader) {
    return next(new AppError('Token not found.', StatusCodes.FORBIDDEN))
  }

  // Extract token from "Bearer <token>" format
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader

  const secret = process.env.JWT_SECRET
  if (!secret) {
    return next(new AppError('JWT_SECRET not configured', StatusCodes.INTERNAL_SERVER_ERROR))
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return next(new AppError('Invalid token.', StatusCodes.UNAUTHORIZED))
    }
    req.user = decoded as JwtPayload
    next()
  })
}
