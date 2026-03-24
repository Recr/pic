import { NextFunction, Request, Response } from 'express'
import { LoginUseCase } from '../services/login.use-case'
import { PrismaEmployeeRepository } from '../repositories/employee.repository'
import { RefreshTokenRepository } from '../repositories/refresh-token.repository'
import { AppError } from '../errors/AppError'
import { StatusCodes } from 'http-status-codes'

export const AuthController = {
  async handleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body
      const loginUseCase = await new LoginUseCase(
        new PrismaEmployeeRepository(),
        new RefreshTokenRepository(),
      )
      const { accessToken, refreshToken, user } = await loginUseCase.executeLogin(data)

      const isProduction = process.env.NODE_ENV === 'production'

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      })

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      })

      res.json({ user })
    } catch (error) {
      next(error)
    }
  },

  async handleGetCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = Number(req.user?.sub)
      if (isNaN(userId)) {
        throw new AppError('Invalid user ID in token.', StatusCodes.UNAUTHORIZED)
      }

      const employeeUseCase = new PrismaEmployeeRepository()
      const user = await employeeUseCase.findById(userId)
      if (!user) {
        throw new AppError('User not found.', StatusCodes.NOT_FOUND)
      }
      res.json({ user })
    } catch (error) {
      next(error)
    }
  },

  async handleRefreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken
      if (!refreshToken) {
        throw new AppError('Refresh token is missing.', StatusCodes.BAD_REQUEST)
      }

      const loginUseCase = new LoginUseCase(
        new PrismaEmployeeRepository(),
        new RefreshTokenRepository(),
      )
      const { accessToken, refreshToken: newRefreshToken } =
        await loginUseCase.executeRefreshToken(refreshToken)

      const isProduction = process.env.NODE_ENV === 'production'

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      })

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      })

      res.json({ message: 'Token refreshed successfully.' })
    } catch (error) {
      next(error)
    }
  },

  async handleLogout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken
      if (!refreshToken) {
        throw new AppError('Refresh token is missing.', StatusCodes.BAD_REQUEST)
      }
      const loginUseCase = new LoginUseCase(
        new PrismaEmployeeRepository(),
        new RefreshTokenRepository(),
      )
      await loginUseCase.executeLogout(refreshToken)

      const isProduction = process.env.NODE_ENV === 'production'
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax' as const,
      }

      res.clearCookie('accessToken', cookieOptions)
      res.clearCookie('refreshToken', cookieOptions)

      res.json({ message: 'Logged out successfully.' })
    } catch (error) {
      next(error)
    }
  },

  async handleChangePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = Number(req.user?.sub)
      if (isNaN(userId)) {
        throw new AppError('Invalid user ID in token.', StatusCodes.UNAUTHORIZED)
      }
      const { currentPassword, newPassword } = req.body
      const loginUseCase = new LoginUseCase(
        new PrismaEmployeeRepository(),
        new RefreshTokenRepository(),
      )
      await loginUseCase.executeChangePassword(userId, currentPassword, newPassword)
      res.json({ message: 'Password changed successfully.' })
    } catch (error) {
      next(error)
    }
  },

  async handleRequestPasswordResetToken (req: Request, res: Response, next: NextFunction) {
    try {
      const { re } = req.body
      const loginUseCase = new LoginUseCase(
        new PrismaEmployeeRepository(),
        new RefreshTokenRepository(),
      )
      await loginUseCase.executeRequestPasswordResetToken(re)
      res.json({ message: 'Password reset token sent successfully.' })
    }
  }
}
