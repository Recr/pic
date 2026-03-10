import { StatusCodes } from 'http-status-codes'
import { AppError } from '../errors/AppError'
import { NextFunction, Request, Response } from 'express'
import { Role } from '../utils/types/employees.types'

export const checkRole = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role

    if (!userRole) {
      return next(new AppError('Missing role in user payload.', StatusCodes.UNAUTHORIZED))
    }

    if (!allowedRoles.includes(userRole)) {
      return next(new AppError('Insufficient permissions.', StatusCodes.FORBIDDEN))
    }

    next()
  }
}
