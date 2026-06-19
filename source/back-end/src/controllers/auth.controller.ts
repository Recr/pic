import { NextFunction, Request, Response } from 'express'
import { PrismaEmployeeRepository } from '../repositories/employee.repository'
import { AppError } from '../errors/AppError'
import { StatusCodes } from 'http-status-codes'
import { makeLoginUseCase } from '../factories/make-login-use-case.factory'

export const AuthController = {
  async handleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body
      const loginUseCase = makeLoginUseCase()
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

      // For simplicity, we're directly using the repository here, but ideally, this should go through a use case.
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

      const loginUseCase = makeLoginUseCase()
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
      const loginUseCase = makeLoginUseCase()
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
      const loginUseCase = makeLoginUseCase()
      await loginUseCase.executeChangePassword(userId, currentPassword, newPassword)
      res.json({ message: 'Password changed successfully.' })
    } catch (error) {
      next(error)
    }
  },

  async handleRequestPasswordResetToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { re } = req.body
      const loginUseCase = makeLoginUseCase()
      await loginUseCase.executeRequestPasswordResetToken(re)
      res.json({
        message:
          'Password reset token created successfully. Contact an administrator for further assistance.',
      })
    } catch (error) {
      next(error)
    }
  },

  async handleResetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { re, passwordToken, newPassword } = req.body
      const loginUseCase = makeLoginUseCase()
      await loginUseCase.executeResetPassword(re, passwordToken, newPassword)
      res.json({ message: 'Password reset successfully.' })
    } catch (error) {
      next(error)
    }
  },
}
