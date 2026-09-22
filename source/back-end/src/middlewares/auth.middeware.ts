import { NextFunction, Request, Response } from 'express'
import { AppError } from '../errors/AppError'
import { StatusCodes } from 'http-status-codes'
import jwt, { JwtPayload } from 'jsonwebtoken'

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const accessToken = req.cookies?.accessToken
  const authHeader = req.headers['authorization']

  if (!accessToken && !authHeader) {
    return next(new AppError('Token not found.', StatusCodes.UNAUTHORIZED))
  }
  // if (!refreshToken && !accessToken) {
  //   return next(new AppError('Refresh token not found.', StatusCodes.UNAUTHORIZED))
  // }

  const token =
    accessToken || (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : authHeader)

  const secret = process.env.ACCESS_TOKEN_SECRET
  if (!secret) {
    return next(
      new AppError('ACCESS_TOKEN_SECRET not configured', StatusCodes.INTERNAL_SERVER_ERROR),
    )
  }

  jwt.verify(token, secret, (err: Error | null, decoded: unknown) => {
    if (err) {
      return next(new AppError('Invalid token.', StatusCodes.UNAUTHORIZED))
    }
    const payload = decoded as JwtPayload

    const allowedWhenMustChangePassword = new Set([
      '/auth/me',
      '/auth/change-password',
      '/auth/logout',
    ])

    const requestPath = (req.originalUrl ?? '').split('?').at(0) ?? ''
    const normalizedPath = requestPath.replace(/^\/api/, '')

    if (payload.mustChangePassword === true && !allowedWhenMustChangePassword.has(normalizedPath)) {
      return next(
        new AppError(
          'Password change required before accessing this resource.',
          StatusCodes.FORBIDDEN,
        ),
      )
    }

    req.user = payload
    next()
  })
}
