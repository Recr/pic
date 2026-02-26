import { NextFunction, Request, Response } from 'express'
import { AppError } from '../errors/AppError'
import { StatusCodes } from 'http-status-codes'
import jwt, { JwtPayload } from 'jsonwebtoken'

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const cookieToken = req.cookies?.accessToken
  const authHeader = req.headers['authorization']

  if (!cookieToken && !authHeader) {
    return next(new AppError('Token not found.', StatusCodes.FORBIDDEN))
  }

  const token = cookieToken
    ? cookieToken
    : authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader

  const secret = process.env.ACCESS_TOKEN_SECRET
  if (!secret) {
    return next(
      new AppError('ACCESS_TOKEN_SECRET not configured', StatusCodes.INTERNAL_SERVER_ERROR),
    )
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return next(new AppError('Invalid token.', StatusCodes.UNAUTHORIZED))
    }
    req.user = decoded as JwtPayload
    next()
  })
}
